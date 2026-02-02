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
  "10th": { categories: ["logical", "communication"], difficulty: "easy", questionCount: 10, timePerQuestion: 60 },
  "12th": { categories: ["logical", "problemSolving"], difficulty: "medium", questionCount: 15, timePerQuestion: 60 },
  "Diploma": { categories: ["technical", "logical"], difficulty: "medium", questionCount: 20, timePerQuestion: 75 },
  "UG": { categories: ["technical", "logical", "problemSolving"], difficulty: "medium", questionCount: 25, timePerQuestion: 90 },
  "PG": { categories: ["technical", "logical", "problemSolving", "communication"], difficulty: "hard", questionCount: 30, timePerQuestion: 90 },
  "Post PG": { categories: ["technical", "logical", "problemSolving", "communication"], difficulty: "hard", questionCount: 30, timePerQuestion: 90 },
};

async function runAutopilot(user, instId, targetDomain, educationLevel) {
  try {
    // 1. Normalize Inputs
    let eduLevel = educationLevel || user.profile?.education || "10th";
    // Force normalization for Class 10 to match Batch Schema Enum
    if (eduLevel.includes("10")) eduLevel = "10th";

    const domain = (targetDomain && targetDomain.trim() !== "") 
                   ? targetDomain.trim() 
                   : "General Aptitude";

    const config = AUTOPILOT_MAP[eduLevel] || AUTOPILOT_MAP["10th"];

    // 2. Find or Create Batch
    const sanitizedDomain = domain.replace(/\s+/g, '');
    let batch = await Batch.findOne({ 
      institutionId: instId, 
      educationLevel: eduLevel,
      targetDomain: domain, 
      isActive: true 
    });

    if (!batch) {
      batch = await Batch.create({
        batchId: `AUTO-${eduLevel.replace(/\s+/g, '')}-${sanitizedDomain}-${Date.now()}`,
        name: `AI Batch - ${eduLevel} (${domain})`,
        className: eduLevel,
        educationLevel: eduLevel,
        targetDomain: domain,
        institutionId: instId,
        createdBy: user._id,
        creationType: "autopilot",
        isActive: true,
        maxStudents: 500,
        slot: {
          date: new Date().toISOString().split('T')[0],
          startTime: "00:01",
          endTime: "23:59"
        }
      });
    }

    // 3. Sync User to Batch
    if (!batch.students.includes(user._id)) {
      batch.students.push(user._id);
      await batch.save();
    }

    user.batchId = batch.batchId;
    user.batchRef = batch._id;
    user.institutionId = instId;
    user.stream = domain; 
    await user.save();

    // 4. Assessment Generation (Schema-Aligned)
    const existingAssessment = await Assessment.findOne({ batchId: batch.batchId });
    if (!existingAssessment) {
      // Use your working model version
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", 
        generationConfig: { responseMimeType: "application/json" }
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

      // SCHEMA VALIDATION: Map AI output to match QuestionSchema exactly (4 options + category)
      const validatedQuestions = rawQuestions.map(q => {
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
          category: q.category || config.categories[0] // Required per QuestionSchema
        };
      });

      const newAssessment = await Assessment.create({
        batchId: batch.batchId,
        slot: {
          date: batch.slot.date,
          startTime: batch.slot.startTime,
          endTime: batch.slot.endTime
        },
        createdBy: user._id,
        mode: "autopilot",
        source: "autopilot", // Must match Schema Enum
        categories: config.categories,
        difficulty: config.difficulty, // Must match Schema Enum (easy, medium, hard)
        timePerQuestion: config.timePerQuestion,
        questions: validatedQuestions,
        allowMultipleAttempts: false
      });

      batch.assessmentId = newAssessment._id;
      await batch.save();
      console.log(`Success: Assessment generated for batch ${batch.batchId}`);
    }
    return { success: true };
  } catch (err) {
    console.error("Autopilot Engine failure:", err.message);
    if (user) {
      await User.findByIdAndUpdate(user._id, { batchId: null, batchRef: null });
    }
    return { success: false, error: err.message };
  }
}

/* ======================================================
    DASHBOARD & STATUS EXPORTS
====================================================== */
exports.getBatchStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('batchRef');
    res.json({
      userName: user.name,
      profileComplete: user.isProfileComplete,
      institutionId: user.institutionId,
      educationLevel: user.profile?.education,
      stream: user.stream, 
      assigned: !!user.batchId, 
      batchDetails: user.batchRef
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching status" });
  }
};

exports.selectInstitution = async (req, res) => {
  try {
    const { institutionId, stream } = req.body;
    const user = await User.findById(req.user.id);
    
    user.institutionId = institutionId;
    user.stream = stream || "General Aptitude"; 
    user.batchId = null; 
    user.batchRef = null;
    await user.save();

    runAutopilot(user, institutionId, user.stream, user.profile?.education)
      .catch(err => console.error("Background AI process failed:", err));
    
    res.json({ success: true, message: "AI is tailoring your assessment." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Selection failed" });
  }
};

exports.getAssessmentForStudent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.batchId) {
      return res.json({ locked: true, reason: "No active batch assigned." });
    }

    const assessment = await Assessment.findOne({ batchId: user.batchId })
                                       .select("-questions.correctAnswer");

    if (!assessment) {
      return res.json({ locked: true, reason: "Tailoring assessment questions... Please refresh in 10 seconds." });
    }

    const existingResult = await Result.findOne({ studentId: user._id, batchId: user.batchId });
    if (existingResult) {
      return res.json({ locked: true, reason: "Assessment already completed." });
    }

    res.json({
      success: true,
      locked: false,
      assessment,
      timePerQuestion: assessment.timePerQuestion,
      slot: assessment.slot
    });
  } catch (err) {
    res.json({ locked: true, reason: "Error loading assessment." });
  }
};

/* ======================================================
    PROFILE & HELPERS
====================================================== */
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
    const batches = await Batch.find({ institutionId: user.institutionId, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, batches });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch batches" });
  }
};

exports.joinBatch = async (req, res) => {
  try {
    const { batchId } = req.body;
    const user = await User.findById(req.user.id);
    const batch = await Batch.findOne({ batchId, isActive: true });
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    
    if (!batch.students.includes(user._id)) {
      batch.students.push(user._id);
      await batch.save();
    }
    user.batchId = batch.batchId;
    user.batchRef = batch._id;
    await user.save();
    res.json({ success: true, message: "Joined successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Join failed" });
  }
};