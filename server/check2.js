const mongoose = require("mongoose");
require("dotenv").config({ path: "c:/Users/HK/Desktop/CPRS/server/.env" });

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const Institution = mongoose.model(
      "Institution",
      new mongoose.Schema(
        { name: String, createdBy: mongoose.Schema.Types.ObjectId },
        { strict: false },
      ),
    );
    const User = mongoose.model(
      "User",
      new mongoose.Schema(
        { name: String, role: String, email: String },
        { strict: false },
      ),
    );

    const admins = await User.find({ role: { $in: ["admin", "superadmin"] } });
    const insts = await Institution.find({});

    console.log("=== Admins ===");
    admins.forEach((u) => console.log(u.email, "| ID:", u._id.toString()));

    console.log("\n=== Institutions ===");
    insts.forEach((i) =>
      console.log(
        i.name,
        "| Created By:",
        i.createdBy ? i.createdBy.toString() : "Null",
      ),
    );

    mongoose.disconnect();
  })
  .catch(console.error);
