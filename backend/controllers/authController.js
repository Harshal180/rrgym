const db = require("../config/db");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

// ─── OTP RATE LIMITER ─────────────────────────────────────────────────────────
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, try again later" },
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const signMemberToken = (member) =>
  jwt.sign(
    {
      id: member.id,
      email: member.email,
      mobile: member.mobile,
      member_type: member.member_type,
      user_type: "member",
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 8 * 60 * 60 * 1000,
});

// ─── SEND OTP ─────────────────────────────────────────────────────────────────
const sendOTP = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: "Email or mobile is required" });
    }

    const [user] = await db.query(
      "SELECT * FROM members WHERE email = ? OR mobile = ?",
      [identifier, identifier]
    );
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "This email or mobile is not registered" });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 60 * 1000);

    await db.query(
      "UPDATE members SET otp = ?, otp_expiry = ? WHERE id = ?",
      [otp, expiry, user[0].id]
    );

    await sendEmail(
      user[0].email,
      "Gym Login OTP",
      `Your OTP is ${otp}. It is valid for 1 minute.`
    );

    res.status(200).json({ success: true, message: "OTP sent successfully", expiresIn: 60 });
  } catch (error) {
    console.error("sendOTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── VERIFY OTP (LOGIN) ───────────────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ success: false, message: "OTP and email or mobile are required" });
    }

    const [user] = await db.query(
      "SELECT * FROM members WHERE email = ? OR mobile = ?",
      [identifier, identifier]
    );
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "This email or mobile is not registered" });
    }

    const member = user[0];

    if (!member.otp || member.otp !== otp) {
      return res.status(400).json({ success: false, message: "OTP is not valid" });
    }
    if (new Date() > new Date(member.otp_expiry)) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // Clear OTP after successful login
    await db.query("UPDATE members SET otp = NULL, otp_expiry = NULL WHERE id = ?", [member.id]);

    const token = signMemberToken(member);
    res.cookie("token", token, cookieOptions());

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: member.id,
        email: member.email,
        mobile: member.mobile,
        member_type: member.member_type,
        first_name: member.first_name,
        last_name: member.last_name,
      },
    });
  } catch (error) {
    console.error("verifyOTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GET CURRENT USER (lightweight — for auth check) ─────────────────────────
const getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user_type === "admin") {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const [user] = await db.query(
      "SELECT id, email, mobile, image, member_type FROM members WHERE id = ?",
      [decoded.id]
    );
    if (user.length === 0) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user[0] });
  } catch (error) {
    console.error("getMe error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ─── GET FULL PROFILE ─────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user_type === "admin") {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const [user] = await db.query(
      `SELECT id, first_name, last_name, email, mobile, image, member_type,
              age, height, weight, membership_type,
              DATE(start_date) AS start_date, DATE(end_date) AS end_date
       FROM members WHERE id = ?`,
      [decoded.id]
    );
    if (user.length === 0) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user[0] });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

module.exports = { otpLimiter, sendOTP, verifyOTP, getMe, getProfile, logout };
