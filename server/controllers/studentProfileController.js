const User = require("../models/User");
const Batch = require("../models/Batch");
const Assessment = require("../models/Assessment");
const Institution = require("../models/Institution"); // Added to fetch Admin Policy
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mammoth = require("mammoth");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* =========================================================
    AUTOPILOT CONFIG (Fallback Matching)
========================================================= */
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
  UG: {
    categories: ["technical", "logical", "problemSolving"],
    difficulty: "medium",
    questionCount: 20,
    timePerQuestion: 90,
  },
  PG: {
    categories: ["technical", "logical", "problemSolving", "communication"],
    difficulty: "hard",
    questionCount: 25,
    timePerQuestion: 90,
  },
};

/* =========================================================
    PRIVATE HELPER: THE AUTOPILOT ENGINE (ENHANCED)
========================================================= */
async function runAutopilot(user, institutionId) {
  try {
    const eduLevel = user.profile?.education || "UG";
    const stream = user.profile?.stream || "General";

    // 1. Fetch the Admin Policy from the Institution
    const inst = await Institution.findById(institutionId);
    const policy = inst?.autopilot?.active ? inst.autopilot.settings : null;

    const Result = require("../models/Result");
    const previousResults = await Result.find({ studentId: user._id }).select(
      "batchId",
    );
    const completedBatchIds = previousResults.map((r) => r.batchId);

    // 2. Find or Create Batch based on Policy or Default
    let batch = await Batch.findOne({
      institutionId,
      educationLevel: eduLevel,
      isActive: true,
      batchId: { $nin: completedBatchIds },
      // Ensure we don't overflow the batch limit set by admin
      $expr: { $lt: [{ $size: "$students" }, policy?.batchLimit || 500] },
    });

    if (!batch) {
      batch = await Batch.create({
        batchId: `AUTO-${eduLevel.toUpperCase()}-${Date.now()}`,
        name: `AI Batch - ${eduLevel} (${stream})`,
        className: eduLevel,
        educationLevel: eduLevel,
        institutionId: institutionId,
        createdBy: inst?.adminId || user._id, // Acts as admin
        maxStudents: policy?.batchLimit || 500,
        slot: {
          date: new Date().toISOString().split("T")[0],
          startTime: "00:01",
          endTime: "23:59",
        },
      });
    }

    // 3. Auto-Join
    if (!batch.students.includes(user._id)) {
      batch.students.push(user._id);
      await batch.save();
    }

    // 4. Sync User
    user.batchId = batch.batchId;
    user.batchRef = batch._id;
    user.institutionId = institutionId;
    user.isActive = true;
    await user.save();

    // 5. AI Assessment Generation (Triggered only if batch has no assessment)
    const existingAssessment = await Assessment.findOne({
      batchId: batch.batchId,
    });
    if (!existingAssessment) {
      const fallbackConfig = AUTOPILOT_MAP[eduLevel] || AUTOPILOT_MAP["UG"];

      // Admin policy question count applies to ALL categories
      const questionCount =
        policy?.questionsPerCategory || fallbackConfig.questionCount;
      const categories = fallbackConfig.categories;

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Generate a professional assessment as a JSON array for ${eduLevel} students in ${stream}. 
      Return ONLY a JSON array. Total questions required: ${questionCount * categories.length}.
      ${policy?.prompt ? `Admin Custom Instructions: ${policy.prompt}` : ""}
      Structure: [{"question": "string", "options": ["string"], "correctAnswer": "string", "category": "string"}]`;

      const result = await model.generateContent(prompt);
      const questions = JSON.parse(
        result.response
          .text()
          .replace(/```json|```/g, "")
          .trim(),
      );

      await Assessment.create({
        batchId: batch.batchId,
        createdBy: inst?.adminId || user._id,
        mode: "autopilot",
        source: "autopilot",
        categories: categories,
        difficulty: fallbackConfig.difficulty,
        questionCount: questions.length,
        timePerQuestion: policy?.timeLimit
          ? (policy.timeLimit * 60) / questions.length
          : fallbackConfig.timePerQuestion,
        questions,
        slot: batch.slot,
      });
    }
    return true;
  } catch (err) {
    console.error("Autopilot Engine Error:", err.message);
    return false;
  }
}

/* =========================================================
    BIODATA PARSER (PRESERVED)
========================================================= */
async function extractPdfText(buffer) {
  const pdf = require("pdf-parse-fork");
  const parse = typeof pdf === "function" ? pdf : pdf.default;
  const data = await parse(buffer);
  return (data.text || "").replace(/\s+/g, " ").trim();
}

exports.parseBiodata = async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });

    let extractedText =
      req.file.mimetype === "application/pdf"
        ? await extractPdfText(req.file.buffer)
        : (await mammoth.extractRawText({ buffer: req.file.buffer })).value;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Extract details from this resume into JSON: { "extractedData": { "phone":"", "age":0, "dob":"", "gender":"", "education":"", "stream":"", "area":"", "city":"", "state":"", "motherTongue":"", "skills":[], "careerGoal":"" }, "others": {} } Text: ${extractedText.slice(0, 7000)}`;

    const result = await model.generateContent(prompt);
    const parsedData = JSON.parse(
      result.response
        .text()
        .replace(/```json|```/g, "")
        .trim(),
    );
    res.json({ success: true, ...parsedData });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Parsing failed: " + err.message });
  }
};

/* =========================================================
    SAVE PROFILE (ENHANCED)
========================================================= */
exports.saveStudentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const {
      phone,
      age,
      dob,
      gender,
      education,
      stream,
      area,
      city,
      state,
      motherTongue,
      skills,
      careerGoal,
      others,
    } = req.body;

    user.profile = {
      phone,
      age,
      dob,
      gender,
      education,
      stream,
      area,
      city,
      state,
      motherTongue,
      careerGoal,
      others,
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === "string"
          ? skills.split(",").map((s) => s.trim())
          : [],
    };

    user.isProfileComplete = true;
    user.isActive = true;
    await user.save();

    // Trigger Autopilot Logic
    if (user.institutionId) {
      await runAutopilot(user, user.institutionId);
    }

    res.json({
      success: true,
      message: "Profile saved. Autopilot initiated.",
      profile: user.profile,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
    SELECT INSTITUTION (PRESERVED)
========================================================= */
exports.selectInstitution = async (req, res) => {
  try {
    const { institutionId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.institutionId = institutionId;
    user.batchId = null;
    user.batchRef = null;
    await user.save();

    if (user.isProfileComplete) {
      await runAutopilot(user, institutionId);
    }

    res.json({
      success: true,
      message: "Institution selected and Autopilot triggered",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
