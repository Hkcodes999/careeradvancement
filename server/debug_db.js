const mongoose = require("mongoose");
const User = require("./models/User");
const Institution = require("./models/Institution");
require("dotenv").config();

async function debug() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const admins = await User.find({ role: "admin" })
      .select("name email institutionId")
      .lean();
    console.log("Admins with institutionId:", admins);

    const institutions = await Institution.find()
      .select("name code createdBy")
      .lean();
    console.log("Institutions:", institutions);

    const studentCounts = await User.aggregate([
      { $match: { role: { $in: ["student", "campus_student"] } } },
      { $group: { _id: "$institutionId", count: { $sum: 1 } } },
    ]);
    console.log("Student counts per institutionId:", studentCounts);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debug();
