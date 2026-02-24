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
  process.env.TWILIO_AUTH_TOKEN,
);

// 🔐 Centralized token generator
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/* ---------------- SIGNUP ---------------- */
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      // If user exists but is not active, we can resend OTP. But let's keep it simple and just do User exists for now.
      if (!user.isActive) {
        // Optionally, logic to resend could go here, but per requirements we just return "User already exists".
        // The user will need to use a resend endpoint if provided, or we can just update it here.
        // Let's just delete the unverified user if they sign up again to reset the flow cleanly:
        await User.deleteOne({ _id: user._id });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role:
        role &&
        ["general", "campus_student", "admin", "superadmin"].includes(role)
          ? role
          : "general",
      isActive: false, // Must verify OTP to activate
      verificationOTP: otp,
      verificationOTPExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send the email
    const transporterConfig = process.env.EMAIL_HOST
      ? {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT || 25,
          secure: process.env.EMAIL_PORT == 465,
          auth: process.env.EMAIL_PASS
            ? {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              }
            : undefined,
          tls: { rejectUnauthorized: false },
        }
      : {
          service: "smtp",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        };

    const transporter = nodemailer.createTransport(transporterConfig);
    const fromName = process.env.FROM_NAME || "Career Advancement";
    const fromEmail =
      process.env.FROM_EMAIL ||
      process.env.EMAIL_USER ||
      "noreply@careeradvancement.in";

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: "Verify Your Email - Career Advancement",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0F172A; margin-bottom: 20px;">Welcome to Career Advancement!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hi ${name},</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">To complete your registration, please verify your email address by entering the 6-digit code provided below.</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #00A8E8;">${otp}</span>
          </div>
          <p style="color: #64748B; font-size: 14px;">This code will expire in 10 minutes. If you did not create an account, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "Verification code sent to email",
      email: user.email, // pass back so frontend knows what to verify
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------- VERIFY SIGNUP OTP ---------------- */
exports.verifySignupOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      verificationOTP: otp,
      verificationOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isActive = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      role: user.role,
      name: user.name,
      message: "Email verified successfully. Welcome!",
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error during verification" });
  }
};

/* ---------------- LOGIN ---------------- */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

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
      name: user.name,
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
      name: user.name,
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
      { new: true },
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
      name: user.name,
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

    const transporterConfig = process.env.EMAIL_HOST
      ? {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT || 25,
          secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
          auth: process.env.EMAIL_PASS
            ? {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              }
            : undefined,
          tls: { rejectUnauthorized: false }, // Useful for local Postfix
        }
      : {
          service: "smtp",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        };

    const transporter = nodemailer.createTransport(transporterConfig);

    const fromName = process.env.FROM_NAME || "Career Advancement";
    const fromEmail =
      process.env.FROM_EMAIL ||
      process.env.EMAIL_USER ||
      "noreply@careeradvancement.in";

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: "Password Reset Code - Career Advancement",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0F172A; margin-bottom: 20px; text-align: center;">Reset Your Password</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5; text-align: center;">Hi ${user.name || "there"},</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.5; text-align: center;">We received a request to reset your password. Enter the 6-digit code below to proceed.</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; border: 1px solid #e2e8f0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #00A8E8; display: block; margin-left: 12px;">${otp}</span>
          </div>
          <p style="color: #64748B; font-size: 14px; text-align: center;">This code will expire in 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "OTP sent to email and WhatsApp",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process request" });
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
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
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
