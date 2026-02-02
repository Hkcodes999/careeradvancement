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
  getBatchStatus // Added the specific controller method for clean logic
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

/* ===============================
    SELECT INSTITUTION & DOMAIN
================================ */
router.post("/select-institution", protect, selectInstitution);

/* ===============================
    DASHBOARD & REFRESH STATUS
================================ */
router.get("/batch-status", protect, async (req, res) => {
  try {
    // Populate institution and batchRef for complete frontend context
    const user = await User.findById(req.user.id)
      .populate("institutionId")
      .populate("batchRef");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
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
      stream: user.stream || null, // Target Upgrade Domain
      batchId: user.batchId || null,
      batchDetails: null
    };

    // Cross-verify Batch assignment
    const activeBatchId = user.batchId || (user.batchRef ? user.batchRef.batchId : null);

    if (activeBatchId) {
      const batch = await Batch.findOne({ batchId: activeBatchId });

      if (batch && batch.isActive) {
        responseData.assigned = true;
        responseData.batchId = batch.batchId;
        responseData.slot = batch.slot;
        responseData.batchDetails = {
          name: batch.name,
          className: batch.className,
          educationLevel: batch.educationLevel,
          targetDomain: batch.targetDomain
        };
      }
    }

    res.json(responseData);
  } catch (err) {
    console.error("Batch Status Sync Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to sync dashboard status" });
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