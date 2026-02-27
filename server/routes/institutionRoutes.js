const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createInstitution,
  updateInstitution, // Added this
  getMyInstitution,
  getActiveInstitutions,
  getPublicInstitution,
} = require("../controllers/institutionController");

/* ======================================================
   CREATE INSTITUTION (ADMIN)
   POST /api/institution/create
====================================================== */
router.post("/create", protect, createInstitution);

/* ======================================================
   UPDATE INSTITUTION (ADMIN)
   PUT /api/institution/update/:id
====================================================== */
// This was missing! It matches your frontend call: ${API_BASE}/update/${id}
router.put("/update/:id", protect, updateInstitution);

/* ======================================================
   GET LOGGED-IN ADMIN INSTITUTION
   GET /api/institution/my
====================================================== */
router.get("/my", protect, getMyInstitution);

/* ======================================================
   GET ACTIVE INSTITUTIONS (STUDENT)
   GET /api/institution/active
====================================================== */
// Changed from "/list" to "/active" to match your frontend fetchInstitutions call
router.get("/active", getActiveInstitutions);

/* ======================================================
   GET PUBLIC INSTITUTION (STUDENT SCAN QR)
   GET /api/institution/public/:id
   (Unprotected route to fetch name for UI prompt)
====================================================== */
router.get("/public/:id", getPublicInstitution);

module.exports = router;
