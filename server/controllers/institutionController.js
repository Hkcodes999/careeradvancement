const Institution = require("../models/Institution");

/* ======================================================
   GET PUBLIC INSTITUTION (FOR QR VERIFICATION)
   GET /api/institution/public/:id
   Returns ONLY explicitly safe public fields to avoid data breaches.
====================================================== */
exports.getPublicInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id)
      .select("name city") // Only select safe public data
      .lean();

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    res.status(200).json({ institution });
  } catch (err) {
    console.error("PUBLIC INSTITUTION ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch institution" });
  }
};

/* ======================================================
   GET ADMIN'S INSTITUTION (FOR REFRESH PERSISTENCE & CHECK)
   GET /api/institution/my
====================================================== */
exports.getMyInstitution = async (req, res) => {
  try {
    let institution;

    // Disable ownership check for getMyInstitution so AdminDashboard acts globally
    if (["admin", "superadmin"].includes(req.user.role)) {
      // Return ALL active institutions for Admin/SuperAdmin (frontend handles array)
      institution = await Institution.find({ isActive: true });
    } else {
      // Normal admins only get the one they created
      institution = await Institution.findOne({ createdBy: req.user.id });
    }

    if (
      !institution ||
      (Array.isArray(institution) && institution.length === 0)
    ) {
      return res.status(200).json({ institution: null });
    }

    res.status(200).json({ institution });
  } catch (err) {
    console.error("GET INSTITUTION ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch institution profile" });
  }
};

/* ======================================================
   CREATE INSTITUTION (ADMIN ONLY)
   POST /api/institution/create
====================================================== */
exports.createInstitution = async (req, res) => {
  try {
    const { name, code, address, website } = req.body;

    /* 🔒 Only admin / superadmin */
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!name || !code) {
      return res
        .status(400)
        .json({ message: "Institution name and code are required" });
    }

    /* 🚫 One institution per admin */
    const existing = await Institution.findOne({ createdBy: req.user.id });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Institution already exists for this admin" });
    }

    /* 🚫 Unique institution code */
    const codeExists = await Institution.findOne({ code: code.toUpperCase() });
    if (codeExists) {
      return res
        .status(400)
        .json({ message: "Institution code already exists" });
    }

    const institution = await Institution.create({
      name,
      code: code.toUpperCase(),
      address,
      website,
      createdBy: req.user.id,
      isActive: true,
    });

    res.status(201).json({
      message: "Institution created successfully",
      institution,
    });
  } catch (err) {
    console.error("CREATE INSTITUTION ERROR:", err.message, err.stack);
    res.status(500).json({
      message: "Failed to create institution",
      error: err.message,
      stack: err.stack,
    });
  }
};

/* ======================================================
   UPDATE INSTITUTION (ADMIN ONLY)
   PUT /api/institution/update/:id
====================================================== */
exports.updateInstitution = async (req, res) => {
  try {
    const { name, code, address, website } = req.body;
    const { id } = req.params;

    /* 🔒 Only admin / superadmin */
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const institution = await Institution.findById(id);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    console.log("UPDATE_INSTITUTION DEBUG:", {
      role: req.user.role,
      userId: req.user.id,
      createdBy: institution.createdBy.toString(),
    });

    // Ownership check - DISABLED for now as requested to allow "AdminDashboard" to act globally.
    // if (
    //   institution.createdBy.toString() !== req.user.id &&
    //   req.user.role !== "superadmin"
    // ) {
    //   return res
    //     .status(403)
    //     .json({ message: "Unauthorized to update this institution" });
    // }

    if (code && code.toUpperCase() !== institution.code) {
      const codeExists = await Institution.findOne({
        code: code.toUpperCase(),
        _id: { $ne: id },
      });
      if (codeExists) {
        return res
          .status(400)
          .json({ message: "Institution code already exists" });
      }
    }

    institution.name = name || institution.name;
    institution.code = code ? code.toUpperCase() : institution.code;
    institution.address = address || institution.address;
    institution.website = website || institution.website;

    const updatedInstitution = await institution.save();

    res.status(200).json({
      message: "Institution updated successfully",
      institution: updatedInstitution,
    });
  } catch (err) {
    console.error("UPDATE INSTITUTION ERROR:", err.message, err.stack);
    res.status(500).json({
      message: "Failed to update institution",
      error: err.message,
      stack: err.stack,
    });
  }
};

/* ======================================================
   GET ALL ACTIVE INSTITUTIONS (STUDENTS)
   GET /api/institution/active
===================================================== */
exports.getActiveInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find({ isActive: true }).select(
      "name code _id",
    );
    res.json({ institutions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch institutions" });
  }
};
