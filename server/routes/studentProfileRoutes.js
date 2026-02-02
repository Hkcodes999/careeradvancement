const express = require("express");
const router = express.Router();
const multer = require("multer");
const mammoth = require("mammoth");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const protect = require("../middleware/authMiddleware");
const User = require("../models/User");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ================= MULTER CONFIG ================= */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

async function extractPdfText(buffer) {
  // Use pdf-parse-fork as in your existing logic
  const pdf = require("pdf-parse-fork");
  const parse = typeof pdf === 'function' ? pdf : pdf.default;
  const data = await parse(buffer);
  return (data.text || "").replace(/\s+/g, " ").trim();
}

/* =========================================================
    AI BIODATA PARSING (GEMINI 2.5 FLASH)
========================================================= */
router.post("/parse-biodata", protect, upload.single("biodata"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    let text = "";
    if (req.file.mimetype === "application/pdf") {
      text = await extractPdfText(req.file.buffer);
    } else {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Analyze this resume text and return a valid JSON object. 
    Required fields in 'extractedData': {phone, age, gender, education (Must be one of: 10th, 12th, UG, PG, Post PG), stream, city, state, skills[], careerGoal}. 
    All other findings in 'others' object.
    Text: ${text.slice(0, 7500)}`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, "").trim();
    
    // Safety check for JSON parsing
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      throw new Error("AI returned invalid JSON structure. Please try again.");
    }

    res.json({ success: true, ...parsed });
  } catch (err) {
    console.error("Parsing Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================================
    PROFILE DATA FETCHING
========================================================= */
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.profile || {});
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * NOTE: 
 * The 'save-profile' and 'select-institution' routes have been moved 
 * or synchronized with studentController.js to prevent logic duplication.
 * This ensures 'runAutopilot' is called from one single source of truth.
 */

module.exports = router;