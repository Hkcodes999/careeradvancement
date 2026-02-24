const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const multer = require("multer");

const {
  saveStudentProfile,
  selectInstitution,
  joinBatch,
  getAssessmentForStudent,
  fetchAvailableBatches,
  getBatchStatus, // Added the specific controller method for clean logic
  joinCampus,
  setAssessmentGoal,
} = require("../controllers/studentController");

// Import the AI Parsing logic
const { parseBiodata } = require("../controllers/studentProfileController");

const Batch = require("../models/Batch");
const User = require("../models/User");

/* ================= MULTER CONFIG ================= */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* ===============================
    PROFILE & AI PARSING
================================ */
router.post("/profile", protect, saveStudentProfile);
router.post("/parse-biodata", protect, upload.single("biodata"), parseBiodata);
router.post("/set-goal", protect, setAssessmentGoal);

/* ===============================
    SELECT INSTITUTION & DOMAIN
================================ */
router.post("/select-institution", protect, selectInstitution);
router.post("/join-campus", protect, joinCampus);

/* ===============================
    DASHBOARD & REFRESH STATUS
================================ */
router.get("/batch-status", protect, async (req, res) => {
  try {
    // Populate institution and batchRef for complete frontend context
    const user = await User.findById(req.user.id)
      .populate("institutionId")
      .populate("batchRef");

    // Include completed institutions lookup and KPI stats
    const Result = require("../models/Result");
    const results = await Result.find({ studentId: user._id });

    const completedBatchIds = results.map((r) => r.batchId);

    // Calculate Dashboard KPIs
    const assessmentsCompleted = results.length;
    let avgScore = "--";
    if (assessmentsCompleted > 0) {
      const totalScore = results.reduce(
        (sum, r) => sum + (r.overallPercentage || 0),
        0,
      );
      avgScore = Math.round(totalScore / assessmentsCompleted);
    }

    let completedInstitutions = [];
    if (completedBatchIds.length > 0) {
      const batches = await Batch.find({
        batchId: { $in: completedBatchIds },
      }).select("institutionId");
      completedInstitutions = batches
        .filter((b) => b.institutionId)
        .map((b) => b.institutionId.toString());
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    /**
     * DASHBOARD PAYLOAD SYNC
     * profileStream: What they studied (from profile)
     * stream: What they are TARGETING (from top-level user.stream)
     */
    const responseData = {
      success: true,
      userName: user.name,
      profileComplete: user.isProfileComplete,
      profile: user.profile || null,
      assigned: false,
      institutionId: user.institutionId?._id || null,
      educationLevel: user.profile?.education || null,
      profileStream: user.profile?.stream || null, // Existing background
      stream: user.stream || null, // Active Target Domain
      shortTermGoal: user.profile?.shortTermGoal || null, // Saved ST Goal
      longTermGoal: user.profile?.longTermGoal || null, // Saved LT Goal
      batchId: user.batchId || null,
      batchDetails: null,
      completedInstitutions,
      assessmentsCompleted,
      avgScore,
    };

    // Cross-verify Batch assignment
    const activeBatchId =
      user.batchId || (user.batchRef ? user.batchRef.batchId : null);

    if (activeBatchId) {
      const batch = await Batch.findOne({ batchId: activeBatchId });

      if (batch && batch.isActive) {
        // Fix Corrupt State: If it's a personal autopilot request, ensure an assessment actually exists
        // If it doesn't, AI generation failed. Clear it so the user isn't stuck.
        if (batch.batchId.startsWith("AUTO-")) {
          const AssessmentModel = require("../models/Assessment");
          const assessmentExists = await AssessmentModel.exists({
            batchId: batch.batchId,
          });
          if (!assessmentExists) {
            user.batchId = null;
            user.batchRef = null;
            user.stream = null;
            await user.save();
            responseData.assigned = false;
            return res.json(responseData);
          }
        }

        responseData.assigned = true;
        responseData.batchId = batch.batchId;
        responseData.slot = batch.slot;
        responseData.batchDetails = {
          name: batch.name,
          className: batch.className,
          educationLevel: batch.educationLevel,
          targetDomain: batch.targetDomain,
        };
      }
    }

    res.json(responseData);
  } catch (err) {
    console.error("Batch Status Sync Error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to sync dashboard status" });
  }
});

/* ===============================
    BATCH LOGIC (MANUAL FALLBACK)
================================ */
router.get("/available-batches", protect, fetchAvailableBatches);
router.post("/join-batch", protect, joinBatch);

/* ===============================
    ASSESSMENT ACCESS
================================ */
router.get("/assessment", protect, getAssessmentForStudent);

module.exports = router;
