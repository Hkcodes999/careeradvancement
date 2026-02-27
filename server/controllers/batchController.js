const Batch = require("../models/Batch");
const User = require("../models/User");
const Institution = require("../models/Institution");
const crypto = require("crypto");

/* ============================================================
   NEW: AUTOPILOT ASSIGN & DYNAMIC BATCH CREATION
   Logic: Scan unassigned students -> Domain Selection -> Assign/Create
============================================================ */
exports.autopilotAssign = async (req, res) => {
  try {
    const { targetDomain, isOther = false } = req.body;
    const studentId = req.user.id;

    // 1. Fetch student and validate unassigned status
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const educationLevel = student.educationLevel || "UG";
    const institutionId = student.institutionId;

    // 2. Find an existing active batch matching Level + Domain
    let batch = await Batch.findOne({
      educationLevel,
      targetDomain,
      institutionId,
      isActive: true,
      creationType: "autopilot",
    });

    // 3. If no batch exists or is full, AI creates a new one (Like an Admin)
    if (!batch || batch.students.length >= batch.maxStudents) {
      const timestamp = Date.now();
      const newBatchId = `AUTO-${educationLevel.toUpperCase()}-${targetDomain.replace(/\s+/g, "-").toUpperCase()}-${timestamp}`;

      batch = await Batch.create({
        batchId: newBatchId,
        name: `AI Batch - ${educationLevel} (${targetDomain})`,
        className: educationLevel,
        educationLevel,
        targetDomain,
        institutionId,
        createdBy: institutionId, // Assigned to the institution/system admin
        creationType: "autopilot",
        slot: {
          date: new Date().toISOString().split("T")[0],
          startTime: "00:00",
          endTime: "23:59",
        },
        maxStudents: 500, // Default for AI batches
        students: [],
      });
    }

    // 4. Assign Student to the Batch
    if (!batch.students.includes(student._id)) {
      batch.students.push(student._id);
      await batch.save();
    }

    // 5. Update Student profile
    student.batchId = batch.batchId;
    student.batchRef = batch._id;
    await student.save();

    res.json({
      message: "Assigned to batch successfully",
      batchId: batch.batchId,
      targetDomain: batch.targetDomain,
    });
  } catch (err) {
    console.error("AUTOPILOT ERROR:", err.message);
    res.status(500).json({ message: "Automated assignment failed" });
  }
};

/* =========================
   CREATE BATCH (ADMIN - MANUAL)
========================= */
exports.createBatch = async (req, res) => {
  try {
    const {
      name,
      slot,
      maxStudents = 50,
      className,
      educationLevel,
      targetDomain = "General", // Default for manual
      institutionId, // Now accepting an explicit institution ID
    } = req.body;

    if (!name || !slot || !className || !educationLevel) {
      return res.status(400).json({ message: "Missing required batch data" });
    }

    let institution;

    if (["admin", "superadmin"].includes(req.user.role)) {
      // SuperAdmin can target a specific institution or fallback to the first active one
      if (institutionId) {
        institution = await Institution.findById(institutionId);
      } else {
        institution = await Institution.findOne({ isActive: true });
      }
    } else {
      // Normal admins must have created the institution
      institution = await Institution.findOne({ createdBy: req.user.id });
    }

    if (!institution) {
      return res.status(403).json({
        message: "No active institution available to create a batch under",
      });
    }

    const batch = await Batch.create({
      name,
      className,
      educationLevel,
      targetDomain,
      batchId: crypto.randomUUID(),
      institutionId: institution._id,
      createdBy: req.user.id,
      creationType: "manual", // Distinction
      slot,
      maxStudents,
      students: [],
    });

    res.json({ batch });
  } catch (err) {
    console.error("CREATE BATCH ERROR:", err.message);
    res.status(500).json({ message: "Batch creation failed" });
  }
};

/* =========================
   GET ALL BATCHES (ADMIN)
   Updated to include AI batches
========================= */
exports.getAllBatches = async (req, res) => {
  try {
    let filter = { isPersonal: { $ne: true } }; // Hide personal batches from Admin UI
    if (!["admin", "superadmin"].includes(req.user.role)) {
      const institution = await Institution.findOne({ createdBy: req.user.id });
      if (!institution) return res.json({ batches: [] });
      filter.institutionId = institution._id;
    }

    const batches = await Batch.find(filter)
      .populate("students", "name email educationLevel")
      .sort({ createdAt: -1 });

    res.json({ batches });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch batches" });
  }
};

/* =========================
   ASSIGN STUDENT TO BATCH (MANUAL)
========================= */
exports.addStudentToBatch = async (req, res) => {
  try {
    const { batchId, studentEmail } = req.body;
    if (!batchId || !studentEmail)
      return res.status(400).json({ message: "Missing data" });

    const student = await User.findOne({
      email: studentEmail,
      role: "student",
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const batch = await Batch.findOne({ batchId });
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    if (!student.institutionId?.equals(batch.institutionId)) {
      return res.status(403).json({ message: "Institution mismatch" });
    }

    if (batch.students.length >= batch.maxStudents) {
      return res.status(403).json({ message: "Batch full" });
    }

    if (batch.students.includes(student._id)) {
      return res.json({ message: "Student already in batch" });
    }

    batch.students.push(student._id);
    await batch.save();

    student.batchId = batch.batchId;
    student.batchRef = batch._id;
    student.isActive = true;
    await student.save();

    res.json({ message: "Student assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Assignment failed" });
  }
};
