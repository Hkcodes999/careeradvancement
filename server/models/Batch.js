const mongoose = require("mongoose");

/* ===================== BATCH SCHEMA ===================== */
const BatchSchema = new mongoose.Schema({
  /* ================= IDENTIFIERS ================= */
  batchId: {
    type: String,
    required: true,
    unique: true, // e.g. "AUTO-UG-DATA-1706692800000"
  },

  name: {
    type: String,
    required: true, // e.g. "AI Batch - Data Science (UG)"
  },

  /* ================= ACADEMIC TAGS ================= */
  className: {
    type: String,
    trim: true,
    default: function () {
      return this.educationLevel; // Defaults className to educationLevel if not provided
    },
  },

  educationLevel: {
    type: String,
    enum: ["8th", "9th", "10th", "12th", "Diploma", "UG", "PG", "Post PG"],
    default: "UG",
  },

  /* TARGET DOMAIN 
      Used to group students by their interest (e.g., "Computer Science", "Finance") 
  */
  targetDomain: {
    type: String,
    required: true,
    trim: true,
  },

  /* ================= INSTITUTION ================= */
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    default: null,
    index: true,
  },

  /* ================= ADMIN / SYSTEM ================= */
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    // Note: In Autopilot, this is often the Institution Admin's ID or the first student
  },

  /* CREATION TYPE 
      To distinguish between manual admin batches and AI-generated batches 
  */
  creationType: {
    type: String,
    enum: ["manual", "autopilot"],
    default: "manual",
  },

  isPersonal: {
    type: Boolean,
    default: false,
  },

  /* ================= SLOT / TIME LOCK ================= */
  slot: {
    date: {
      type: String, // "2026-02-01"
      required: true,
    },
    startTime: {
      type: String, // "00:01"
      required: true,
    },
    endTime: {
      type: String, // "23:59"
      required: true,
    },
  },

  /* ================= STUDENT LIMIT ================= */
  maxStudents: {
    type: Number,
    default: 500,
    min: 1,
  },

  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  /* ================= AUTO JOIN ================= */
  allowAutoJoin: {
    type: Boolean,
    default: true,
  },

  /* ================= ASSESSMENT CONTROL ================= */
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment",
    default: null,
  },

  isAssessmentLocked: {
    type: Boolean,
    default: false,
  },

  /* ================= STATUS ================= */
  isActive: {
    type: Boolean,
    default: true,
  },

  /* ================= META ================= */
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* ================= VIRTUALS ================= */
BatchSchema.virtual("currentStudentCount").get(function () {
  return this.students ? this.students.length : 0;
});

BatchSchema.set("toJSON", { virtuals: true });
BatchSchema.set("toObject", { virtuals: true });

/* ================= INDEXES ================= */
// Optimized index for the runAutopilot findOne query
BatchSchema.index({
  institutionId: 1,
  educationLevel: 1,
  targetDomain: 1,
  creationType: 1,
  isActive: 1,
});

module.exports = mongoose.model("Batch", BatchSchema);
