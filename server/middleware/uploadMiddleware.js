const multer = require("multer");
const fs = require("fs");
const path = require("path");

/* =========================================================
    ENSURE UPLOADS FOLDER EXISTS
========================================================= */
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* =========================================================
    ALLOWED MIME TYPES
========================================================= */
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
];

/* =========================================================
    STORAGE CONFIG (DISK)
========================================================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename: remove spaces and special characters
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

/* =========================================================
    MULTER INSTANCE
========================================================= */
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only PDF or DOCX files are allowed."),
        false
      );
    }
  },
});

/* =========================================================
    DYNAMIC PAYLOAD WRAPPER MIDDLEWARE
========================================================= */
/**
 * Handles multipart/form-data. 
 * 1. Uploads the file from fieldName.
 * 2. Parses the 'payload' field from req.body into req.parsedPayload.
 */
const uploadWithPayload = (fieldName = "pdf") => {
  const uploadSingle = upload.single(fieldName);

  return (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Multer Error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      // Logic: In AiBuilderTab.jsx, we send data under the key 'payload'
      if (req.body.payload) {
        try {
          req.parsedPayload = JSON.parse(req.body.payload);
        } catch (parseErr) {
          // If already an object (though usually a string in FormData)
          req.parsedPayload = req.body.payload;
        }
      }

      next();
    });
  };
};

module.exports = {
  upload, // Raw multer instance
  // IMPORTANT: Matches studentApi.js which uses formData.append("biodata", file)
  uploadSingle: upload.single("biodata"), 
  uploadWithPayload, // For AI assessment builder
};