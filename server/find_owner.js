const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function findOwner() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const ownerId = "699adeeca5711a726e1990c5";
    const user = await User.findById(ownerId).lean();
    console.log("Owner details:", user);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
findOwner();
