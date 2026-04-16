const express = require("express");
const router = express.Router();
const { otpLimiter, sendOTP, verifyOTP, getMe, getProfile, logout } = require("../controllers/authController");

router.post("/send-otp",   otpLimiter, sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/logout",     logout);

router.get("/me",      getMe);
router.get("/profile", getProfile);

module.exports = router;
