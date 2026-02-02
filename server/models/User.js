const mongoose = require("mongoose");

/* ================= PROFILE SUB-SCHEMA ================= */
const ProfileSchema = new mongoose.Schema(
  {
    phone: { type: String, default: "" },
    age: { type: Number, default: null },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    /* UPDATED: Added a setter to normalize education strings. 
      This ensures "10" becomes "10th" to match Batch enum requirements.
    */
    education: { 
      type: String, 
      default: "",
      set: function(v) {
        if (!v) return v;
        const val = v.toLowerCase().trim();
        // Regex to catch "10", "10th", "class 10", "grade 10" etc.
        if (/\b10\b/.test(val) || val.includes("10th")) return "10th";
        return v;
      }
    }, 
    stream: { type: String, default: "" },    // Current background
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    personalityType: { type: String, default: "" },
    skills: { type: [String], default: [] },
    interests: { type: String, default: "" },
    careerGoal: { type: String, default: "" },
    
    others: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

/* ================= USER SCHEMA ================= */
const UserSchema = new mongoose.Schema(
  {
    /* ================= BASIC AUTH ================= */
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "admin", "superadmin"],
      default: "student",
    },

    /* ================= OTP RESET FIELDS ================= */
    resetOTP: {
      type: String,
      default: null,
    },

    resetOTPExpires: {
      type: Date,
      default: null,
    },

    /* ================= STUDENT PROFILE ================= */
    profile: {
      type: ProfileSchema,
      default: () => ({}), 
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    /* ================= INSTITUTION ================= */
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      default: null,
    },

    /* ================= BATCH ASSIGNMENT ================= */
    // Note: 'stream' here acts as the 'Target Domain' once selected
    stream: {
      type: String,
      default: null,
    },

    batchId: {
      type: String, 
      default: null,
    },

    batchRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    /* ================= STATUS ================= */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* ================= VIRTUALS ================= */
/**
 * Bridges the gap between the Profile sub-schema and the Autopilot controller requirements.
 * This ensures user.educationLevel returns user.profile.education.
 */
UserSchema.virtual("educationLevel").get(function () {
  return this.profile?.education || null;
});

/* ================= CASCADE DELETE LOGIC ================= */
UserSchema.pre("findOneAndDelete", async function (next) {
  try {
    const user = await this.model.findOne(this.getQuery());

    if (user && user.role === "admin") {
      const Institution = mongoose.model("Institution");
      await Institution.deleteMany({ createdBy: user._id });
      
      const Batch = mongoose.model("Batch");
      await Batch.deleteMany({ createdBy: user._id });
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", UserSchema);