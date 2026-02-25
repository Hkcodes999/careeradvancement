const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Assessment = require("../models/Assessment");
const Batch = require("../models/Batch");
const Institution = require("../models/Institution");
const User = require("../models/User");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* =========================================================
    PDF TEXT EXTRACTION (Node v22 SAFE)
========================================================= */
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdf = require("pdf-parse-fork");
    const parse = typeof pdf === "function" ? pdf : pdf.default;
    if (typeof parse !== "function") throw new Error("PDF parser failed.");
    const data = await parse(dataBuffer);
    return (data.text || "").replace(/\s+/g, " ").trim().slice(0, 7000);
  } catch (err) {
    console.error("Internal PDF Extraction Error:", err.message);
    throw new Error("Failed to extract text from PDF: " + err.message);
  }
}

/* =========================================================
    AUTOPILOT ENGINE (Fixed for Class 10th & Schema Sync)
========================================================= */
exports.runAutopilot = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    console.log("[runAutopilot] Incoming payload:", req.body);
    console.log(
      "[runAutopilot] isPersonal evaluated to:",
      req.body.isPersonal === true,
    );

    // 1. Context validation & NORMALIZATION
    let contextLevel =
      req.body.educationLevel || user?.educationLevel || "10th";
    // Force Class 10 normalization for Batch Enum compatibility
    if (contextLevel.toString().includes("10")) contextLevel = "10th";

    const targetDomain = req.body.stream || user?.stream || "General Aptitude";
    const currentStream =
      req.body.currentStream || user?.profile?.stream || "General";
    const isPersonal =
      req.body.isPersonal === true || String(req.body.isPersonal) === "true";
    const goalType = req.body.goalType || "none";

    // 2. Fetch Institutional Policy if the user belongs to an institution AND it's not a personal assessment
    let config = {
      batchLimit: 500,
      questionsPerCategory: 5,
      timeLimit: 60,
    };

    if (user.institutionId && !isPersonal) {
      const inst = await Institution.findById(user.institutionId);
      if (inst && !inst.autopilot?.active) {
        return res.status(403).json({
          status: "disabled",
          message: "Autopilot is not active for this institution.",
        });
      }
      if (inst && inst.autopilot?.settings) {
        config = inst.autopilot.settings;
      }
    }

    // 3. Batch Management
    const sanitizedDomain = targetDomain.replace(/[^a-zA-Z0-9]/g, "");

    const Result = require("../models/Result");
    const previousResults = await Result.find({ studentId: userId }).select(
      "batchId",
    );
    const completedBatchIds = previousResults.map((r) => r.batchId);

    const query = {
      educationLevel: contextLevel,
      targetDomain: targetDomain,
      creationType: "autopilot",
      isActive: true,
      batchId: { $nin: completedBatchIds },
      $expr: { $lt: [{ $size: "$students" }, config.batchLimit || 500] },
    };
    if (user.institutionId && !isPersonal) {
      query.institutionId = user.institutionId;
    } else {
      query.institutionId = null; // isolate personal batches from campus batches
    }

    let batch = await Batch.findOne(query);

    if (!batch) {
      batch = await Batch.create({
        batchId: `AUTO-${contextLevel.toUpperCase()}-${sanitizedDomain}-${Date.now()}`,
        name: `AI Batch - ${targetDomain} (${contextLevel})`,
        educationLevel: contextLevel,
        targetDomain: targetDomain,
        institutionId:
          !isPersonal && user.institutionId ? user.institutionId : null,
        createdBy:
          !isPersonal && user.institutionId
            ? (await Institution.findById(user.institutionId))?.createdBy ||
              userId
            : userId,
        creationType: "autopilot",
        isActive: true,
        students: [userId],
        slot: {
          date: new Date().toISOString().split("T")[0],
          startTime: "00:00",
          endTime: "23:59",
        },
      });
    }

    // 4. Student Sync
    if (user.batchId !== batch.batchId) {
      user.batchId = batch.batchId;
      user.batchRef = batch._id;
      user.stream = targetDomain;
      await user.save();
    }

    if (!batch.students.includes(userId)) {
      batch.students.push(userId);
      await batch.save();
    }

    // 5. Assessment Generation (The Fix)
    let assessment = await Assessment.findOne({ batchId: batch.batchId });

    if (!assessment) {
      // Using gemini-2.5-flash as specified for reliability
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const categories = [
        "Domain Intuition",
        "Logic",
        "Aptitude",
        "Communication",
      ];
      const qCount = config.questionsPerCategory || 5;

      // Determine goal context phrasing
      let goalContext =
        "wants to explore if they have a natural fit for a career in";
      if (goalType === "shortTermGoal") {
        goalContext = "is actively preparing for a short-term transition into";
      } else if (goalType === "longTermGoal") {
        goalContext =
          "is seriously assessing their long-term potential to become an expert in";
      }

      // Extract Profile Skills & Interests
      const userSkills =
        user?.profile?.skills?.length > 0
          ? user.profile.skills.join(", ")
          : "Not specified";
      const userInterests = user?.profile?.interests || "Not specified";

      const prompt = `Generate a high-quality cognitive and intuitive assessment JSON for a ${contextLevel} student.
      CONTEXT: The student ${goalContext} ${targetDomain}.
      
      STUDENT BACKGROUND:
      - Current Skills: ${userSkills}
      - Interests: ${userInterests}
      (Use this background to frame scenario questions using concepts they *might* already be familiar with, but strictly test their intuition for ${targetDomain}).

      CRITICAL OBJECTIVE: You are testing if the student has the *mindset*, *intuition*, and *problem-solving approach* required for ${targetDomain}. 
      RULES: 
      1. DO ask scenario-based questions that involve the core concepts of ${targetDomain} (e.g., if UI/UX, ask about user flow, contrast, and layout intuition. If Web Dev, ask about organizing information or basic logic flow).
      2. DO NOT ask about specific software, coding syntax, or advanced jargon (e.g., NO Figma questions, NO HTML/React syntax, NO advanced statistical formulas). The student is a beginner. 
      
      CATEGORY DEFINITIONS (STRICTLY REQUIRED):
      1. "Domain Intuition": Scenario-based questions testing their natural 'gut feeling' and common sense for ${targetDomain}'s core concepts.
      2. "Logic": Deductive troubleshooting or structural reasoning relevant to the kinds of problems faced in ${targetDomain}.
      3. "Aptitude": Basic analytical or quantitative reasoning tied to the field's demands (e.g., estimating proportions, identifying data outliers).
      4. "Communication": Understanding hypothetical client requirements, user feedback, or workplace scenarios in the context of ${targetDomain}.

      REQUIREMENT: Exactly ${qCount} questions for EACH category: ${categories.join(", ")}.
      FORMAT: [{"question": "string", "options": ["string", "string", "string", "string"], "correctAnswer": "string", "category": "string"}]`;

      const result = await model.generateContent(prompt);
      let rawQuestions = JSON.parse(result.response.text());

      // SCHEMA GUARD: Ensure exactly 4 options and valid categories for every question
      const validatedQuestions = rawQuestions.map((q) => {
        let opts = Array.isArray(q.options) ? q.options : [];
        if (opts.length < 4)
          while (opts.length < 4) opts.push(`Option ${opts.length + 1}`);
        return {
          question: q.question || "Topic Assessment Question",
          options: opts.slice(0, 4),
          correctAnswer: q.correctAnswer || opts[0],
          category: q.category || categories[0],
        };
      });

      assessment = await Assessment.create({
        batchId: batch.batchId,
        institutionId:
          !isPersonal && user.institutionId ? user.institutionId : null,
        createdBy:
          !isPersonal && user.institutionId
            ? (await Institution.findById(user.institutionId))?.createdBy ||
              userId
            : userId,
        mode: "autopilot",
        source: "autopilot", // Required by schema
        questions: validatedQuestions,
        difficulty: "medium",
        categories: categories,
        timePerQuestion: config.timeLimit
          ? Math.floor((config.timeLimit * 60) / validatedQuestions.length)
          : 60,
        slot: batch.slot, // Ensure slot is passed
      });

      batch.assessmentId = assessment._id;
      await batch.save();

      return res.json({
        status: "waiting",
        message: "AI is tailoring your assessment questions...",
      });
    }

    res.json({ status: "ready", assessment });
  } catch (err) {
    console.error("Autopilot Engine Error:", err.message);
    res
      .status(500)
      .json({ message: "Internal Autopilot Engine Error: " + err.message });
  }
};

/* =========================================================
    ADMIN INTERFACE & OTHER UTILITIES
========================================================= */
exports.generateAndStoreAssessment = async (req, res) => {
  try {
    const payload = req.parsedPayload || req.body;
    const { mode, institutionId, active, settings, config } = payload;

    if (mode === "autopilot_config") {
      const updated = await Institution.findByIdAndUpdate(
        institutionId,
        {
          $set: { "autopilot.active": active, "autopilot.settings": settings },
        },
        { new: true },
      );
      return res.json({
        message: "Autopilot policy saved",
        autopilot: updated.autopilot,
      });
    }

    const targetBatch = await Batch.findOne({ batchId: config.batchId });
    if (!targetBatch)
      return res.status(404).json({ message: "Batch not found" });

    let pdfText = "";
    if (req.file) {
      pdfText = await extractTextFromPDF(req.file.path);
      fs.unlinkSync(req.file.path);
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `Generate manual assessment. Count: ${config.questionCount}. Difficulty: ${config.difficulty}. ${pdfText ? `Ref Syllabus: ${pdfText}` : ""}`;
    const result = await model.generateContent(prompt);

    const assessment = await Assessment.create({
      batchId: targetBatch.batchId,
      institutionId: targetBatch.institutionId,
      createdBy: req.user.id,
      mode: "manual",
      source: "manual",
      questions: JSON.parse(result.response.text()),
      difficulty: config.difficulty || "medium",
      timePerQuestion: config.timePerQuestion || 60,
      slot: targetBatch.slot,
    });

    res.json({
      message: "Manual Assessment Created",
      assessmentId: assessment._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.parseBiodata = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const resumeText = await extractTextFromPDF(req.file.path);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `Extract professional details into JSON: phone, age, gender, education, stream, city, state, skills, interests, careerGoal. Text: ${resumeText}`;
    const result = await model.generateContent(prompt);
    res.json({ extractedData: JSON.parse(result.response.text()) });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
};

exports.rollbackAssessment = async (req, res) => {
  try {
    const deleted = await Assessment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Rollback successful" });
  } catch {
    res.status(500).json({ message: "Rollback failed" });
  }
};
