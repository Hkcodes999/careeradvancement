const mongoose = require("mongoose");

const InstitutionSchema = new mongoose.Schema({
  /* ================= BASIC DETAILS ================= */
  name: {
    type: String,
    required: true,
    trim: true,
  },

  code: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
  },

  address: {
    type: String,
  },

  website: {
    type: String,
  },

  /* ================= OWNERSHIP ================= */
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Admin who controls this institution 
    required: true,
  },

  /* ================= AI AUTOPILOT POLICY ================= */
  // This stores the persistent configuration for the AI Admin
  autopilot: {
    active: { 
      type: Boolean, 
      default: false 
    },
    settings: {
      batchLimit: { 
        type: Number, 
        default: 500 
      },
      timeLimit: { 
        type: Number, 
        default: 60 // Total minutes for assessment
      },
      questionsPerCategory: { 
        type: Number, 
        default: 10 
      },
      prompt: { 
        type: String, 
        default: "" 
      },
      syllabusUrl: { 
        type: String, 
        default: null 
      }
    }
  },

  /* ================= SETTINGS ================= */
  isActive: {
    type: Boolean,
    default: true,
  },

  allowAutoJoin: {
    type: Boolean,
    default: true,
  },

  /* ================= META ================= */
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* ================= VALIDATION MIDDLEWARE ================= */
/**
 * Ensures that if autopilot is active, settings have logical minimums.
 * This prevents the AI engine from crashing due to division by zero or null values.
 */
InstitutionSchema.pre("save", function (next) {
  if (this.autopilot && this.autopilot.active) {
    if (!this.autopilot.settings.timeLimit || this.autopilot.settings.timeLimit <= 0) {
      this.autopilot.settings.timeLimit = 60;
    }
    if (!this.autopilot.settings.questionsPerCategory || this.autopilot.settings.questionsPerCategory <= 0) {
      this.autopilot.settings.questionsPerCategory = 5;
    }
  }
  next();
});

/* ================= CASCADE DELETE LOGIC ================= */
InstitutionSchema.pre("findOneAndDelete", async function (next) {
  const institutionId = this.getQuery()._id;
  // Note: Associated Batches and Assessments should ideally be cleaned up here
  next();
});

module.exports = mongoose.model("Institution", InstitutionSchema);