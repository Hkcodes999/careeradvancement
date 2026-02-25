const mongoose = require("mongoose");

/* ================= CATEGORY SCORE ================= */
const CategoryScoreSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    correct: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

/* ================= RESULT SCHEMA ================= */
const ResultSchema = new mongoose.Schema({
  /* 👤 STUDENT & REFERENCE */
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  /* 🧪 BATCH REFERENCE */
  batchId: {
    type: String,
    required: true,
    index: true,
  },

  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment",
    required: true,
  },

  /* 🎯 TARGET GOALS (NEW) */
  targetDomain: {
    type: String, // e.g., "Computer Science", "Medical"
    required: true,
  },

  educationLevel: {
    type: String, // e.g., "High School", "Undergraduate"
    required: true,
  },

  /* 📊 PERFORMANCE DATA */
  categoryScores: {
    type: [CategoryScoreSchema],
    required: true,
  },

  totalCorrect: {
    type: Number,
    required: true,
  },

  totalQuestions: {
    type: Number,
    required: true,
  },

  overallPercentage: {
    type: Number,
    required: true,
  },

  /* 🧠 AI ANALYTICS — STRENGTHS */
  strengths: {
    type: [String],
    default: [],
  },

  /* ❌ AI ANALYTICS — WEAK AREAS (Object Structure) */
  weaknesses: {
    type: [
      {
        category: String,
        reason: String,
        improvementTips: [String],
      },
    ],
    default: [],
  },

  /* 💡 AI SUGGESTIONS (General) */
  improvementSuggestions: {
    type: [String],
    default: [],
  },

  /* 🧐 DOMAIN FITMENT REASONING (UPDATED) */
  fitReasoning: {
    type: String, // Detailed explanation: Why you fit the target domain
    default: "",
  },

  gapReasoning: {
    type: String, // Detailed explanation: Gaps for the target domain
    default: "",
  },

  explanations: {
    type: [String], // General AI context
    default: [],
  },

  /* 🎓 CAREER RECOMMENDATIONS */
  recommendedCareers: {
    type: [String],
    default: [],
  },

  /* ⏱ TIME TRACKING (In Seconds) */
  timeSpent: {
    type: Number,
    default: 0,
  },

  /* 🔒 LOCKING & ATTEMPTS */
  isLocked: {
    type: Boolean,
    default: true,
    index: true,
  },

  attempt: {
    type: Number,
    default: 1,
  },

  /* 🕒 TIMESTAMPS */
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

/* ================= INDEXES ================= */
// Facilitates fast lookup for batch-level analytics
ResultSchema.index({ batchId: 1, createdAt: -1 });

module.exports = mongoose.model("Result", ResultSchema);
