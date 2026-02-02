const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id || decoded._id).select(
      "_id role email name batchId batchRef isProfileComplete institutionId isActive"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // --- TEMPORARY FIX: Commented out to allow login during dev ---
    // if (!user.isActive) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "User account is inactive",
    //   });
    // }
    // -------------------------------------------------------------

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      batchId: user.batchId || null,
      batchRef: user.batchRef || null,
      isProfileComplete: user.isProfileComplete,
      institutionId: user.institutionId || null,
      isActive: user.isActive,
    };

    next();
  } catch (err) {
    // 🔥 CLEAN + PERMANENT JWT HANDLING
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

module.exports = protect;