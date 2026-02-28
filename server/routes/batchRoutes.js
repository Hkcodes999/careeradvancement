const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createBatch,
  getAllBatches,
  addStudentToBatch,
  updateBatch,
} = require("../controllers/batchController");

router.post("/create", protect, createBatch);
router.put("/update/:batchId", protect, updateBatch);
router.get("/all", protect, getAllBatches);
router.post("/assign", protect, addStudentToBatch);

module.exports = router;
