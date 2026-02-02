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
    const parse = typeof pdf === 'function' ? pdf : pdf.default;
    if (typeof parse !== 'function') throw new Error("PDF parser failed.");
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

    // 1. Context validation & NORMALIZATION
    let contextLevel = req.body.educationLevel || user?.educationLevel || "10th";
    // Force Class 10 normalization for Batch Enum compatibility
    if (contextLevel.toString().includes("10")) contextLevel = "10th";

    const targetDomain = req.body.stream || user?.stream || "General Aptitude";
    const currentStream = req.body.currentStream || user?.profile?.stream || "General";

    if (!user || !user.institutionId) {
      return res.status(400).json({ message: "User or Institution context missing." });
    }

    // 2. Fetch Institutional Policy
    const inst = await Institution.findById(user.institutionId);
    if (!inst?.autopilot?.active) {
      return res.status(403).json({ status: "disabled", message: "Autopilot is not active." });
    }

    const config = inst.autopilot.settings;

    // 3. Batch Management
    const sanitizedDomain = targetDomain.replace(/[^a-zA-Z0-9]/g, '');
    let batch = await Batch.findOne({
      institutionId: user.institutionId,
      educationLevel: contextLevel,
      targetDomain: targetDomain,
      creationType: "autopilot",
      isActive: true,
      $expr: { $lt: [{ $size: "$students" }, config.batchLimit || 500] }
    });

    if (!batch) {
      batch = await Batch.create({
        batchId: `AUTO-${contextLevel.toUpperCase()}-${sanitizedDomain}-${Date.now()}`,
        name: `AI Batch - ${targetDomain} (${contextLevel})`,
        educationLevel: contextLevel,
        targetDomain: targetDomain,
        institutionId: user.institutionId,
        createdBy: inst.createdBy || userId,
        creationType: "autopilot",
        isActive: true,
        students: [userId],
        slot: { 
          date: new Date().toISOString().split('T')[0], 
          startTime: "00:00", 
          endTime: "23:59" 
        }
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
        generationConfig: { responseMimeType: "application/json" }
      });

      const categories = ["Technical", "Logic", "Aptitude", "Communication"];
      const qCount = config.questionsPerCategory || 5;
      
      const prompt = `Generate a high-quality assessment JSON for a ${contextLevel} student.
      CONTEXT: Upgrading from ${currentStream} to ${targetDomain}.
      REQUIREMENT: Exactly ${qCount} questions for EACH category: ${categories.join(", ")}.
      FORMAT: [{"question": "string", "options": ["string", "string", "string", "string"], "correctAnswer": "string", "category": "string"}]`;

      const result = await model.generateContent(prompt);
      let rawQuestions = JSON.parse(result.response.text());

      // SCHEMA GUARD: Ensure exactly 4 options and valid categories for every question
      const validatedQuestions = rawQuestions.map(q => {
        let opts = Array.isArray(q.options) ? q.options : [];
        if (opts.length < 4) while (opts.length < 4) opts.push(`Option ${opts.length + 1}`);
        return {
          question: q.question || "Topic Assessment Question",
          options: opts.slice(0, 4),
          correctAnswer: q.correctAnswer || opts[0],
          category: q.category || categories[0]
        };
      });

      assessment = await Assessment.create({
        batchId: batch.batchId,
        institutionId: user.institutionId,
        createdBy: inst.createdBy || userId,
        mode: "autopilot",
        source: "autopilot", // Required by schema
        questions: validatedQuestions,
        difficulty: "medium",
        categories: categories,
        timePerQuestion: config.timeLimit ? Math.floor((config.timeLimit * 60) / validatedQuestions.length) : 60,
        slot: batch.slot // Ensure slot is passed
      });

      batch.assessmentId = assessment._id;
      await batch.save();

      return res.json({ status: "waiting", message: "AI is tailoring your assessment questions..." });
    }

    res.json({ status: "ready", assessment });
  } catch (err) {
    console.error("Autopilot Engine Error:", err.message);
    res.status(500).json({ message: "Internal Autopilot Engine Error: " + err.message });
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
        { $set: { "autopilot.active": active, "autopilot.settings": settings } },
        { new: true }
      );
      return res.json({ message: "Autopilot policy saved", autopilot: updated.autopilot });
    }

    const targetBatch = await Batch.findOne({ batchId: config.batchId });
    if (!targetBatch) return res.status(404).json({ message: "Batch not found" });

    let pdfText = "";
    if (req.file) {
      pdfText = await extractTextFromPDF(req.file.path);
      fs.unlinkSync(req.file.path);
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      generationConfig: { responseMimeType: "application/json" } 
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
      slot: targetBatch.slot
    });

    res.json({ message: "Manual Assessment Created", assessmentId: assessment._id });
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
      generationConfig: { responseMimeType: "application/json" }
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