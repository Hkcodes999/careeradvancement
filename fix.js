require("dotenv").config({ path: "./server/.env" });
const mongoose = require("mongoose");
const connectDB = require("./server/config/db");
const User = require("./server/models/User");

const runReset = async () => {
  await connectDB();
  const res = await User.updateMany(
    { role: "student" },
    {
      $set: {
        batchId: null,
        batchRef: null,
        institutionId: null,
        stream: null,
      },
    },
  );
  console.log(
    "Successfully wiped stuck active tests from users",
    res.modifiedCount,
  );
  process.exit(0);
};

runReset().catch((err) => {
  console.error(err);
  process.exit(1);
});
