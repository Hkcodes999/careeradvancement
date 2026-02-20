const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// 🔐 Centralized token generator
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* ---------------- SIGNUP ---------------- */
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role && ["student", "admin", "superadmin"].includes(role) ? role : "student",
      isActive: true, // ✅ FIX
    });

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      role: user.role,
      message: "Signup successful",
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------- LOGIN ---------------- */
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    if (user.role !== role)
      return res
        .status(403)
        .json({ success: false, message: "Role mismatch" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "User account inactive" });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      role: user.role,
      message: "Login successful",
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------- GOOGLE LOGIN ---------------- */
exports.googleAuth = async (req, res) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(32).toString("hex"),
        role: null,
        isActive: true, // ✅ FIX (CRITICAL)
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      role: user.role, // may be null → frontend role modal
    });
  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err);
    res
      .status(401)
      .json({ success: false, message: "Google authentication failed" });
  }
};

/* ---------------- UPDATE ROLE ---------------- */
exports.updateRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        role: req.body.role,
        isActive: true, // ✅ FIX: activate user after role selection
      },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      role: user.role,
      token,
      message: "Role updated successfully",
    });
  } catch (err) {
    console.error("UPDATE ROLE ERROR:", err);
    res.status(500).json({ success: false, message: "Role update failed" });
  }
};

/* ---------------- OTP SYSTEM ---------------- */

/* FORGOT PASSWORD */
exports.forgotPassword = async (req, res) => {
  const { email, phone } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    if (phone) {
      try {
        await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: `whatsapp:${phone}`,
          body: `Your Password Reset OTP is: ${otp}. It expires in 10 minutes.`,
        });
      } catch (twilioErr) {
        console.error("TWILIO ERROR:", twilioErr.message);
      }
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<h3>Password Reset</h3>
             <p>Your OTP is <strong>${otp}</strong></p>
             <p>Valid for 10 minutes.</p>`,
    });

    res.json({
      success: true,
      message: "OTP sent to email and WhatsApp",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to process request" });
  }
};

/* RESET PASSWORD */
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = null;
    user.resetOTPExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
