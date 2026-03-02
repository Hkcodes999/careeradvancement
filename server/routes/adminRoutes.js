const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getAdminStats,
  getRecentActivities,
  getInstitutionStudents,
  getStudentDetails,
} = require("../controllers/adminController");

// @route   GET /api/admin/stats
router.get("/stats", protect, getAdminStats);

// @route   GET /api/admin/activity
// @desc    Get recent database events for the live feed
router.get("/activity", protect, getRecentActivities);

// @route   GET /api/admin/students
router.get("/students", protect, getInstitutionStudents);

// @route   GET /api/admin/students/:id
router.get("/students/:id", protect, getStudentDetails);

module.exports = router;
