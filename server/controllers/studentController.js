const Assessment = require("../models/Assessment");
const Batch = require("../models/Batch");
const User = require("../models/User");
const Institution = require("../models/Institution");
const Result = require("../models/Result");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ======================================================
    AUTOPILOT CONFIG & ENGINE
====================================================== */
const AUTOPILOT_MAP = {
  "10th": {
    categories: ["logical", "communication"],
    difficulty: "easy",
    questionCount: 10,
    timePerQuestion: 60,
  },
  "12th": {
    categories: ["logical", "problemSolving"],
    difficulty: "medium",
    questionCount: 15,
    timePerQuestion: 60,
  },
  Diploma: {
    categories: ["technical", "logical"],
    difficulty: "medium",
    questionCount: 20,
    timePerQuestion: 75,
  },
  UG: {
    categories: ["technical", "logical", "problemSolving"],
    difficulty: "medium",
    questionCount: 25,
    timePerQuestion: 90,
  },
  PG: {
    categories: ["technical", "logical", "problemSolving", "communication"],
    difficulty: "hard",
    questionCount: 30,
    timePerQuestion: 90,
  },
  "Post PG": {
    categories: ["technical", "logical", "problemSolving", "communication"],
    difficulty: "hard",
    questionCount: 30,
    timePerQuestion: 90,
  },
};

async function generateAssessmentForBatch(batch) {
  try {
    const existingAssessment = await Assessment.findOne({
      batchId: batch.batchId,
    });
    if (existingAssessment) return { success: true };

    let eduLevel = batch.educationLevel || "10th";
    if (eduLevel.includes("10")) eduLevel = "10th";
    const domain = batch.targetDomain || "General Aptitude";
    const config = AUTOPILOT_MAP[eduLevel] || AUTOPILOT_MAP["10th"];

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `Generate assessment JSON for ${eduLevel} level in the ${domain} domain. 
    Count: ${config.questionCount}. Difficulty: ${config.difficulty}. 
    Include categories: ${config.categories.join(", ")}.
    Return ONLY a JSON array. 
    Structure: [{"question": "string", "options": ["string", "string", "string", "string"], "correctAnswer": "string", "category": "string"}]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    let rawQuestions = JSON.parse(cleanJson);

    // SCHEMA VALIDATION
    const validatedQuestions = rawQuestions.map((q) => {
      let opts = Array.isArray(q.options) ? q.options : [];
      if (opts.length < 4) {
        while (opts.length < 4) opts.push(`Option ${opts.length + 1}`);
      } else if (opts.length > 4) {
        opts = opts.slice(0, 4);
      }
      return {
        question: q.question || "Topic-related assessment question",
        options: opts,
        correctAnswer: q.correctAnswer || opts[0],
        category: q.category || config.categories[0],
      };
    });

    const newAssessment = await Assessment.create({
      batchId: batch.batchId,
      slot: {
        date: batch.slot.date,
        startTime: batch.slot.startTime,
        endTime: batch.slot.endTime,
      },
      createdBy: batch.createdBy,
      mode: "autopilot",
      source: "autopilot",
      categories: config.categories,
      difficulty: config.difficulty,
      timePerQuestion: config.timePerQuestion,
      questions: validatedQuestions,
      allowMultipleAttempts: false,
    });

    batch.assessmentId = newAssessment._id;
    await batch.save();
    console.log(`Success: Assessment generated for batch ${batch.batchId}`);
    return { success: true };
  } catch (err) {
    console.error("Autopilot Engine failure:", err.message);
    return { success: false, error: err.message };
  }
}

/* ======================================================
    DASHBOARD & STATUS EXPORTS
====================================================== */
exports.getBatchStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("batchRef")
      .populate("personalBatchRef");

    // Find completed assessments to disable selected campuses
    const results = await Result.find({ studentId: user._id }).select(
      "batchId",
    );
    const completedBatchIds = results.map((r) => r.batchId);

    let completedInstitutions = [];
    if (completedBatchIds.length > 0) {
      const batches = await Batch.find({
        batchId: { $in: completedBatchIds },
      }).select("institutionId");
      completedInstitutions = batches
        .filter((b) => b.institutionId)
        .map((b) => b.institutionId.toString());
    }

    let institutionName = "";
    if (user.institutionId) {
      const inst = await Institution.findById(user.institutionId).select(
        "name",
      );
      if (inst) institutionName = inst.name;
    }

    res.json({
      userName: user.name,
      profileComplete: user.isProfileComplete,
      institutionId: user.institutionId,
      institutionName,
      educationLevel: user.profile?.education,
      profileStream: user.profile?.stream || user.stream,
      // Campus assessment
      stream: user.stream,
      assigned: !!user.batchId,
      batchDetails: user.batchRef,
      // Personal assessment (completely independent)
      personalStream: user.personalStream,
      personalAssigned: !!user.personalBatchId,
      personalBatchId: user.personalBatchId,
      personalBatchDetails: user.personalBatchRef,
      completedInstitutions,
      assessmentsCompleted: results.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching status" });
  }
};

exports.selectInstitution = async (req, res) => {
  try {
    const { institutionId } = req.body;
    const user = await User.findById(req.user.id);

    user.institutionId = institutionId;
    // Don't set stream or batchId here anymore. They select the batch directly from the campus.
    user.stream = null;
    user.batchId = null;
    user.batchRef = null;
    await user.save();

    res.json({ success: true, message: "Campus selected successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Selection failed" });
  }
};

exports.joinCampus = async (req, res) => {
  try {
    const { institutionId, batchId } = req.body;
    const user = await User.findById(req.user.id);

    user.institutionId = institutionId;
    user.role = "campus_student";
    // Reset batch state initially
    user.stream = null;
    user.batchId = null;
    user.batchRef = null;

    if (batchId) {
      const batch = await Batch.findOne({ batchId, isActive: true });
      if (batch) {
        if (!batch.students.includes(user._id)) {
          batch.students.push(user._id);
          await batch.save();
        }
        user.batchId = batch.batchId;
        user.batchRef = batch._id;
        user.stream = batch.targetDomain;

        // Trigger assessment generation in background if autopilot missing
        generateAssessmentForBatch(batch).catch((err) =>
          console.error("Background AI process failed:", err),
        );
      }
    }

    await user.save();

    res.json({ success: true, message: "Joined campus successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to join campus" });
  }
};

exports.getAssessmentForStudent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const type = req.query.type || "campus"; // "campus" or "personal"

    const activeBatchId =
      type === "personal" ? user.personalBatchId : user.batchId;

    if (!activeBatchId) {
      return res.json({ locked: true, reason: "No active assessment." });
    }

    const assessment = await Assessment.findOne({
      batchId: activeBatchId,
    }).select("-questions.correctAnswer");

    if (!assessment) {
      return res.json({
        locked: true,
        reason:
          "Tailoring assessment questions... Please refresh in 10 seconds.",
      });
    }

    const existingResult = await Result.findOne({
      studentId: user._id,
      batchId: activeBatchId,
    });
    // Allow users with the 'general' role to take the assessment unlimited times
    if (existingResult && user.role !== "general") {
      return res.json({
        locked: true,
        reason: "Assessment already completed.",
      });
    }

    res.json({
      success: true,
      locked: false,
      assessment,
      timePerQuestion: assessment.timePerQuestion,
      slot: assessment.slot,
      assessmentType: type,
    });
  } catch (err) {
    res.json({ locked: true, reason: "Error loading assessment." });
  }
};

/* ======================================================
    PROFILE & HELPERS
====================================================== */
exports.cancelAutopilot = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Cancel the personal assessment (uses personalBatchId)
    if (user.personalBatchId && user.personalBatchId.startsWith("AUTO-")) {
      // Delete the generated assessment
      await Assessment.deleteMany({ batchId: user.personalBatchId });
      // Delete the batch document
      await Batch.deleteMany({ batchId: user.personalBatchId });

      // Clear personal state only
      user.personalBatchId = null;
      user.personalBatchRef = null;
      user.personalStream = null;
      await user.save();

      return res.json({
        success: true,
        message: "Assessment cancelled successfully.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "No active personal assessment found to cancel.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to cancel assessment." });
  }
};

exports.saveStudentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.profile = req.body;
    user.isProfileComplete = true;
    await user.save();
    res.json({ success: true, message: "Profile saved." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to save profile" });
  }
};

exports.fetchAvailableBatches = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const batches = await Batch.find({
      institutionId: user.institutionId,
      isActive: true,
    }).sort({ createdAt: -1 });
    res.json({ success: true, batches });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch batches" });
  }
};

exports.joinBatch = async (req, res) => {
  try {
    const { batchId } = req.body;
    const user = await User.findById(req.user.id);
    const batch = await Batch.findOne({ batchId, isActive: true });
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    // Join the batch
    if (!batch.students.includes(user._id)) {
      batch.students.push(user._id);
      await batch.save();
    }

    // Lock the user to the batch and its domain
    user.batchId = batch.batchId;
    user.batchRef = batch._id;
    user.stream = batch.targetDomain;
    await user.save();

    // Trigger assessment generation in the background if it doesn't exist
    generateAssessmentForBatch(batch).catch((err) =>
      console.error("Background AI process failed:", err),
    );

    res.json({ success: true, message: "Joined successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Join failed" });
  }
};

exports.setAssessmentGoal = async (req, res) => {
  try {
    const { domain, goalType } = req.body; // goalType should be 'shortTermGoal' or 'longTermGoal'
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (goalType === "shortTermGoal") {
      user.profile.shortTermGoal = domain;
    } else if (goalType === "longTermGoal") {
      user.profile.longTermGoal = domain;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid goal type" });
    }

    user.markModified("profile");
    await user.save();

    res.json({
      success: true,
      message: `${goalType === "shortTermGoal" ? "Short-Term" : "Long-Term"} Goal updated successfully.`,
      profile: user.profile,
    });
  } catch (err) {
    console.error("Set Goal Error:", err);
    res.status(500).json({ success: false, message: "Failed to save goal" });
  }
};
