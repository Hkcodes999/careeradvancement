const mongoose = require("mongoose");

/**
 * Student Profile Schema
 * Stores comprehensive user data for career analysis and AI personalization.
 */
const StudentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
      index: true, 
    },

    // Contact & Demographic
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [10, "Age must be at least 10"],
      max: [100, "Age must be valid"],
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
      lowercase: true,
    },

    // Academic Context
    education: {
      type: String,
      required: [true, "Education level is required"],
      enum: ["10th", "12th", "UG", "PG", "Post PG"],
    },

    stream: {
      type: String,
      trim: true,
    },

    // Geographical & Behavioral Info
    personalityType: {
      type: String,
      enum: ["Introvert", "Extrovert", "Ambivert", null, ""],
      default: null,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    interests: {
      type: String, 
      trim: true,
    },

    // Skills & Career Direction
    skills: {
      type: [String],
      required: [true, "At least one skill is required"],
      default: []
    },

    careerGoal: {
      type: String,
      required: [true, "Career goal is required"],
      trim: true,
    },

    /* =========================================================
        NEW: FLEXIBLE DATA STORAGE (The "Others" Category)
        Used to store Nationality, Languages, Hobbies, etc.
    ========================================================= */
    others: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // Metadata for AI Autopilot flow and system tracking
    metadata: {
      parsedByAI: { type: Boolean, default: false },
      lastModelUsed: { type: String, default: "gemini-2.5-flash" }
    },

    completed: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true 
  }
);

// Middleware to ensure empty strings or invalid enums are handled gracefully
StudentProfileSchema.pre("save", function (next) {
  if (this.personalityType === "") {
    this.personalityType = undefined;
  }
  next();
});

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);