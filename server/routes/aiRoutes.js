const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { uploadWithPayload, uploadSingle } = require("../middleware/uploadMiddleware");

const {
  generateAndStoreAssessment,
  runAutopilot, // The core sequential engine we are fixing
  rollbackAssessment,
  parseBiodata,
} = require("../controllers/aiController");

/* =========================================================
    PARSE BIODATA (AUTO-FILL)
========================================================= */
router.post(
  "/parse-biodata",
  protect,
  uploadSingle, 
  parseBiodata
);

/* =========================================================
    GENERATE AI ASSESSMENT / SAVE POLICY
========================================================= */
/**
 * Handles both:
 * 1. Manual Generation (mode: "manual")
 * 2. Autopilot Policy Saving (mode: "autopilot_config")
 */
router.post(
  "/generate-assessment",
  protect,
  uploadWithPayload("pdf"), 
  generateAndStoreAssessment
);

/* =========================================================
    RUN AUTOPILOT ENGINE (STUDENT DASHBOARD)
========================================================= */
/**
 * REDESIGN: Sequential Trigger
 * Students call this to:
 * 1. Be assigned to a batch (Normalized to "10th" via User Model).
 * 2. Trigger assessment generation if missing.
 * 3. Receive the 'waiting' or 'ready' status.
 */
router.post(
  "/run-autopilot",
  protect,
  async (req, res, next) => {
    // Injecting a small timeout handler for AI generation
    // This prevents the request from timing out while Gemini is thinking
    res.setTimeout(120000, () => {
      res.status(504).json({ 
        success: false, 
        message: "AI is taking longer than usual. Please refresh in a few seconds." 
      });
    });
    next();
  },
  runAutopilot
);

/* =========================================================
    ROLLBACK ASSESSMENT
========================================================= */
router.delete(
  "/rollback/:id",
  protect,
  rollbackAssessment
);

module.exports = router;