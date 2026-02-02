const mongoose = require("mongoose");

/* ===================== QUESTION SCHEMA ===================== */
const QuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    options: {
      type: [String],
      required: true,
      validate: [(v) => v.length === 4, "Must have exactly 4 options"],
    },

    correctAnswer: {
      type: String,
      required: true,
    },

    // ✅ EXPLICIT CATEGORY PER QUESTION
    category: {
      type: String,
      required: true, // e.g. Logical, Technical, Communication
    },
  },
  { _id: false }
);

/* ===================== ASSESSMENT SCHEMA ===================== */
const AssessmentSchema = new mongoose.Schema({
  /* 🔑 CORE LINK */
  batchId: {
    type: String,
    required: true,
    index: true,
  },

  /* ⏱ SLOT LOCK */
  slot: {
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },

  /* 👤 ADMIN / SYSTEM */
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  /* ⚙️ CONFIG */
  mode: {
    type: String,
    enum: ["manual", "autopilot"],
    required: true,
  },

  categories: {
    type: [String],
    required: true,
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },

  timePerQuestion: {
    type: Number,
    required: true, // seconds
  },

  /* 🧠 QUESTIONS */
  questions: {
    type: [QuestionSchema],
    required: true,
  },

  /* 🔐 ATTEMPT CONTROL */
  allowMultipleAttempts: {
    type: Boolean,
    default: false, // 🔒 1 attempt only
  },

  /* 📄 SOURCE */
  source: {
    type: String,
    // UPDATED: Added GENERAL_KNOWLEDGE and PROFILE_MATCHING to fix validation errors
    enum: ["pdf", "manual", "autopilot", "PDF_REFERENCE", "PROFILE_MATCHING", "GENERAL_KNOWLEDGE"],
    required: true,
  },

  /* 🕒 META */
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* ===================== INDEXES ===================== */
AssessmentSchema.index({ batchId: 1 });

module.exports = mongoose.model("Assessment", AssessmentSchema);