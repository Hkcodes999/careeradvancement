const Assessment = require("../models/Assessment");
const Result = require("../models/Result");
const User = require("../models/User");
const careerEngine = require("../utils/careerEngine");

/* ======================================================
    SUBMIT ASSESSMENT (REFINED WITH USER CONTEXT)
====================================================== */
exports.submitAssessment = async (req, res) => {
  try {
    const { answers, timeSpent, targetDomain, educationLevel } = req.body;
    const studentId = req.user.id;

    // Fetch full user to get Profile info and Batch info
    const user = await User.findById(studentId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const batchId = user.batchId;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: "Student is not assigned to any batch",
      });
    }

    /* ================= ATTEMPT LOCK ================= */
    const existing = await Result.findOne({ studentId, batchId });
    // Bypass the lock for 'general' users
    if (existing && user.role !== "general") {
      return res.status(403).json({
        success: false,
        message: "Assessment already submitted. One attempt only.",
      });
    }

    /* ================= FETCH ASSESSMENT ================= */
    const assessment = await Assessment.findOne({ batchId });
    if (!assessment || !assessment.questions) {
      return res
        .status(404)
        .json({ success: false, message: "Assessment content not found" });
    }

    /* ================= SCORE CALCULATION ================= */
    const categoryScoresMap = {};
    let totalCorrect = 0;

    assessment.questions.forEach((q, index) => {
      const category = q.category || "General";
      if (!categoryScoresMap[category]) {
        categoryScoresMap[category] = { correct: 0, total: 0 };
      }
      categoryScoresMap[category].total++;

      if (answers[index] === q.correctAnswer) {
        categoryScoresMap[category].correct++;
        totalCorrect++;
      }
    });

    const categoryScores = Object.entries(categoryScoresMap).map(
      ([category, c]) => ({
        category,
        correct: c.correct,
        total: c.total,
        percentage: Math.round((c.correct / c.total) * 100),
      }),
    );

    /* ================= DYNAMIC CONTEXT COMPUTATION ================= */
    const batch = await require("../models/Batch").findOne({ batchId });

    // Fallbacks ensure we always have valid strings for the analysis engine
    const finalTargetDomain =
      targetDomain ||
      (batch ? batch.targetDomain : null) ||
      user.stream ||
      "General";

    const finalEducationLevel =
      educationLevel ||
      (batch ? batch.educationLevel : null) ||
      user.profile?.education ||
      "UG";

    /* ================= AI CAREER ENGINE ================= */
    const aiAnalysis = await careerEngine(
      categoryScores,
      finalEducationLevel,
      user.profile?.others || {},
      finalTargetDomain,
    );

    /* ================= SAVE RESULT ================= */
    const result = await Result.create({
      studentId,
      batchId,
      assessmentId: assessment._id,
      targetDomain: finalTargetDomain,
      educationLevel: finalEducationLevel,
      categoryScores,
      totalCorrect,
      totalQuestions: assessment.questions.length,
      overallPercentage: Math.round(
        (totalCorrect / assessment.questions.length) * 100,
      ),
      strengths: aiAnalysis.strengths,
      weaknesses: aiAnalysis.weaknesses,
      fitReasoning: aiAnalysis.fitReasoning,
      gapReasoning: aiAnalysis.gapReasoning,
      explanations: aiAnalysis.explanations,
      improvementSuggestions: aiAnalysis.improvementSuggestions,
      recommendedCareers: aiAnalysis.recommendedCareers,
      timeSpent: Number(timeSpent) || 0,
      attempt: 1,
      isLocked: true,
    });

    /* ================= CLEAR ACTIVE ASSESSMENT STATE ================= */
    // Allow the student to take another assessment for a different campus
    user.batchId = null;
    user.batchRef = null;
    user.institutionId = null;
    user.stream = null;
    await user.save();

    res.json({
      success: true,
      message: "Assessment submitted successfully",
      // Include student info for immediate PDF download availability
      result: {
        ...result.toObject(),
        studentName: user.name,
        studentEmail: user.email,
      },
    });
  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error during submission" });
  }
};

/* ======================================================
    GET MY RESULT (UPDATED WITH USER POPULATION)
====================================================== */
exports.getMyResult = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Find latest result
    const result = await Result.findOne({ studentId }).sort({ createdAt: -1 });

    if (!result) {
      return res.json({
        locked: true,
        message: "No results found.",
      });
    }

    // Fetch user details to inject Name and Email for the PDF
    const user = await User.findById(studentId).select("name email");

    res.json({
      success: true,
      ...result.toObject(),
      studentName: user ? user.name : "N/A",
      studentEmail: user ? user.email : "N/A",
    });
  } catch (err) {
    res
      .status(500)
      .json({ locked: true, message: "Failed to retrieve result" });
  }
};

/* ======================================================
    GET ALL MY RESULTS (FOR HISTORY VIEW)
====================================================== */
exports.getAllMyResults = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Find all results for this student, sorted newest first
    const results = await Result.find({ studentId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      results,
    });
  } catch (err) {
    console.error("GET ALL MYS RESULTS ERROR:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve results history" });
  }
};

/* ======================================================
    GET SPECIFIC RESULT BY ID
====================================================== */
exports.getResultById = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const result = await Result.findOne({ _id: id, studentId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found or unauthorized.",
      });
    }

    const user = await User.findById(studentId).select("name email");

    res.json({
      success: true,
      ...result.toObject(),
      studentName: user ? user.name : "N/A",
      studentEmail: user ? user.email : "N/A",
    });
  } catch (err) {
    console.error("GET RESULT BY ID ERROR:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve specific result" });
  }
};

/* ======================================================
    ADMIN ANALYTICS & RESET
====================================================== */
exports.getBatchAnalytics = async (req, res) => {
  try {
    const { batchId } = req.params;
    const results = await Result.find({ batchId });
    if (!results || results.length === 0) {
      return res.json({
        submissions: 0,
        averageScore: 0,
        categoryAverages: [],
      });
    }

    let totalPercentageSum = 0;
    const categoryMap = {};

    results.forEach((r) => {
      totalPercentageSum += r.overallPercentage;
      r.categoryScores.forEach((c) => {
        if (!categoryMap[c.category])
          categoryMap[c.category] = { sum: 0, count: 0 };
        categoryMap[c.category].sum += c.percentage;
        categoryMap[c.category].count++;
      });
    });

    const categoryAverages = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      averagePercentage: Math.round(
        categoryMap[cat].sum / categoryMap[cat].count,
      ),
    }));

    res.json({
      success: true,
      submissions: results.length,
      averageScore: Math.round(totalPercentageSum / results.length),
      categoryAverages,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Analytics failed" });
  }
};

exports.resetAssessment = async (req, res) => {
  try {
    const studentId = req.user.id;
    const user = await User.findById(studentId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Find the latest result and delete it ONLY if they aren't a general user (who keeps all records)
    const latestResult = await Result.findOne({ studentId }).sort({
      createdAt: -1,
    });
    if (latestResult && user.role !== "general") {
      await Result.deleteOne({ _id: latestResult._id });
    }

    // Ensure the user's batch state is cleared just in case
    user.batchId = null;
    user.batchRef = null;
    user.stream = null;
    await user.save();

    res.json({ success: true, message: "Assessment unlocked." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Reset failed" });
  }
};
