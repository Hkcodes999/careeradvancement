const Institution = require("../models/Institution");

/* ======================================================
   GET ADMIN'S INSTITUTION (FOR REFRESH PERSISTENCE)
   GET /api/institution/my
====================================================== */
exports.getMyInstitution = async (req, res) => {
  try {
    // Find the institution created by the currently logged-in user (from authMiddleware)
    const institution = await Institution.findOne({ createdBy: req.user.id });
    
    // Returning 200 even if null so the frontend knows there isn't one yet
    if (!institution) {
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
      return res.status(400).json({ message: "Institution name and code are required" });
    }

    /* 🚫 One institution per admin */
    const existing = await Institution.findOne({ createdBy: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "Institution already exists for this admin" });
    }

    /* 🚫 Unique institution code */
    const codeExists = await Institution.findOne({ code: code.toUpperCase() });
    if (codeExists) {
      return res.status(400).json({ message: "Institution code already exists" });
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
    console.error("CREATE INSTITUTION ERROR:", err.message);
    res.status(500).json({ message: "Failed to create institution" });
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

    // Ownership check
    if (institution.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this institution" });
    }

    if (code && code.toUpperCase() !== institution.code) {
      const codeExists = await Institution.findOne({ 
        code: code.toUpperCase(), 
        _id: { $ne: id } 
      });
      if (codeExists) {
        return res.status(400).json({ message: "Institution code already exists" });
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
    console.error("UPDATE INSTITUTION ERROR:", err.message);
    res.status(500).json({ message: "Failed to update institution" });
  }
};

/* ======================================================
   GET ALL ACTIVE INSTITUTIONS (STUDENTS)
   GET /api/institution/active
===================================================== */
exports.getActiveInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find({ isActive: true }).select("name code _id");
    res.json({ institutions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch institutions" });
  }
};