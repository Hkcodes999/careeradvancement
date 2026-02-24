const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  submitAssessment,
  getMyResult,
  getBatchAnalytics,
  resetAssessment, // Import the new controller function
} = require("../controllers/resultController");

/* =====================================================
    STUDENT
===================================================== */

/* 📝 Submit Assessment (Includes Target Domain Logic) */
router.post(
  "/submit",
  protect,
  role("student", "general", "campus_student"),
  submitAssessment,
);

/* 📊 Get My Result (Sorted by latest) */
router.get(
  "/my",
  protect,
  role("student", "general", "campus_student"),
  getMyResult,
);

/* 🔄 Reset/Unlock Assessment (Allows Retake/Domain Change) */
router.delete(
  "/reset",
  protect,
  role("student", "general", "campus_student"),
  resetAssessment,
);

/* =====================================================
    ADMIN / SUPERADMIN
===================================================== */

/* 📈 Batch Analytics */
router.get(
  "/batch/:batchId",
  protect,
  role("admin", "superadmin"),
  getBatchAnalytics,
);

module.exports = router;
