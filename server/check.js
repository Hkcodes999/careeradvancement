const mongoose = require("mongoose");
require("dotenv").config({ path: "c:/Users/HK/Desktop/CPRS/server/.env" });

console.log("URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const Institution = mongoose.model(
      "Institution",
      new mongoose.Schema(
        {
          name: String,
          createdBy: mongoose.Schema.Types.ObjectId,
          isActive: Boolean,
        },
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

    const insts = await Institution.find({});
    console.log("Institutions:", insts);

    const admins = await User.find({ role: { $in: ["admin", "superadmin"] } });
    console.log("Admins:", admins);

    mongoose.disconnect();
  })
  .catch(console.error);
