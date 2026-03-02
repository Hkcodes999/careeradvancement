const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Institution = require("../models/Institution");
const Result = require("../models/Result");
const Batch = require("../models/Batch");

// ✅ Optimized Stats (Parallel fetching)
exports.getAdminStats = async (req, res) => {
  try {
    const [admin, totalStudents, activeStudents] = await Promise.all([
      User.findById(req.user.id).select("name").lean(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "student", batchId: { $ne: null } }),
    ]);

    res.json({
      totalStudents,
      activeStudents,
      adminName: admin?.name || "Admin",
    });
  } catch (err) {
    console.error("ADMIN STATS ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};

// ✅ Delete User and Cleanup Associated Data
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 Cascading Delete: Check role and delete associated profile/institution
    if (user.role === "student") {
      await StudentProfile.findOneAndDelete({ userId: id });
    } else if (user.role === "institution") {
      await Institution.findOneAndDelete({ userId: id });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User and all related records deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err.message);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// ✅ Returns SEPARATE activities for each milestone
exports.getRecentActivities = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("name createdAt updatedAt batchId isProfileComplete")
      .lean();

    const activities = [];

    students.forEach((student) => {
      activities.push({
        id: `${student._id}_reg`,
        text: `New student registered: ${student.name}`,
        time: student.createdAt,
        type: "new",
      });

      if (student.isProfileComplete) {
        activities.push({
          id: `${student._id}_profile`,
          text: `${student.name} completed their profile setup`,
          time: student.updatedAt,
          type: "profile",
        });
      }

      if (student.batchId) {
        activities.push({
          id: `${student._id}_batch`,
          text: `${student.name} assigned to batch ${student.batchId}`,
          time: student.updatedAt,
          type: "enrollment",
        });
      }
    });

    const finalFeed = activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    res.json(finalFeed);
  } catch (err) {
    console.error("RECENT ACTIVITY ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};

// --- NEW: Get all students for the admin's institution ---
exports.getInstitutionStudents = async (req, res) => {
  try {
    const adminId = req.user.id;
    const role = req.user.role;

    // Superadmin: can see all students
    if (role === "superadmin") {
      const students = await User.find({
        role: { $in: ["student", "campus_student"] },
      })
        .select("name email role createdAt isProfileComplete batchId")
        .sort({ name: 1 })
        .lean();
      return res.json({ success: true, students });
    }

    // Regular Admin: find their institution
    let institution = await Institution.findOne({ createdBy: adminId });

    if (!institution) {
      const adminUser = await User.findById(adminId).select("institutionId");
      if (adminUser?.institutionId) {
        institution = await Institution.findById(adminUser.institutionId);
      }
    }

    if (!institution) {
      return res.json({ success: true, students: [] });
    }

    const students = await User.find({
      institutionId: institution._id,
      role: { $in: ["student", "campus_student"] },
    })
      .select("name email role createdAt isProfileComplete batchId")
      .sort({ name: 1 })
      .lean();

    res.json({ success: true, students });
  } catch (err) {
    console.error("GET INSTITUTION STUDENTS ERROR:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch students" });
  }
};

// --- NEW: Get full details for a specific student ---
exports.getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const role = req.user.role;

    let institution = null;
    if (role !== "superadmin") {
      // Verify admin owns or belongs to the institution this student belongs to
      institution = await Institution.findOne({ createdBy: adminId });
      if (!institution) {
        const adminUser = await User.findById(adminId).select("institutionId");
        if (adminUser?.institutionId) {
          institution = await Institution.findById(adminUser.institutionId);
        }
      }

      if (!institution) {
        return res.status(403).json({
          success: false,
          message: "No institution found for this admin",
        });
      }
    }

    const query = { _id: id };
    if (role !== "superadmin") {
      query.institutionId = institution._id;
    }

    const student = await User.findOne(query).select("-password").lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your institution",
      });
    }

    // Fetch student's results
    const results = await Result.find({ studentId: id })
      .sort({ createdAt: -1 })
      .lean();

    // Enrich results with batch names
    const batchIds = [...new Set(results.map((r) => r.batchId))];
    const batches = await Batch.find({ batchId: { $in: batchIds } }).lean();
    const batchMap = {};
    batches.forEach((b) => {
      batchMap[b.batchId] = b;
    });

    const enrichedResults = results.map((r) => {
      const batch = batchMap[r.batchId];
      return {
        ...r,
        batchName: batch ? batch.name : null,
        assessmentType:
          batch && batch.creationType === "manual"
            ? "Batch Test"
            : "Personal Assessment",
      };
    });

    res.json({
      success: true,
      student,
      results: enrichedResults,
    });
  } catch (err) {
    console.error("GET STUDENT DETAILS ERROR:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch student details" });
  }
};
