const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  submitAssessment,
  getMyResult,
  getAllMyResults, // Added
  getResultById, // Added
  getBatchAnalytics,
  resetAssessment,
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

/* 📚 Get ALL My Results (History View) */
router.get(
  "/my/all",
  protect,
  role("student", "general", "campus_student"),
  getAllMyResults,
);

/* 🔍 Get Specific Result by ID */
router.get(
  "/:id",
  protect,
  role("student", "general", "campus_student"),
  getResultById,
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
