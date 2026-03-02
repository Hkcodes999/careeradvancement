const mongoose = require("mongoose");
const User = require("./models/User");
const Institution = require("./models/Institution");
require("dotenv").config();

async function fullDump() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("--- ADMINS ---");
    const admins = await User.find({ role: { $in: ["admin", "superadmin"] } })
      .select("name email role institutionId")
      .lean();
    for (const admin of admins) {
      const owned = await Institution.find({ createdBy: admin._id })
        .select("name")
        .lean();
      console.log(
        `Admin: ${admin.name} | Role: ${admin.role} | Email: ${admin.email} | Assigned Inst: ${admin.institutionId || "NONE"} | Owned: ${owned.map((i) => i.name).join(", ") || "NONE"}`,
      );
    }

    console.log("\n--- INSTITUTIONS & STUDENTS ---");
    const insts = await Institution.find().lean();
    for (const inst of insts) {
      const studentsInInst = await User.find({ institutionId: inst._id })
        .select("name")
        .lean();
      console.log(
        `Inst: ${inst.name} (${inst.code}) | ID: ${inst._id} | Owner: ${inst.createdBy} | Students: ${studentsInInst.length}`,
      );
    }

    const orphanStudents = await User.find({
      role: { $in: ["student", "campus_student"] },
      institutionId: null,
    })
      .select("name")
      .lean();
    console.log(`\nOrphan Students (No Institution): ${orphanStudents.length}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fullDump();
