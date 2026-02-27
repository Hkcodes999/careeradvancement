require("dotenv").config();
const mongoose = require("mongoose");
const Batch = require("./models/Batch");
const Assessment = require("./models/Assessment");

async function clean() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // Find all autopilot batches
    const batches = await Batch.find({ creationType: "autopilot" });
    console.log(`Found ${batches.length} autopilot batches to delete.`);

    for (const batch of batches) {
      if (batch.assessmentId) {
        await Assessment.findByIdAndDelete(batch.assessmentId);
        console.log(`Deleted assessment ${batch.assessmentId}`);
      }
      await Batch.findByIdAndDelete(batch._id);
      console.log(`Deleted batch ${batch.name}`);
    }

    console.log("Cleanup complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clean();
