const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile"); // Needed for cascading delete
const Institution = require("../models/Institution");       // Needed for cascading delete

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