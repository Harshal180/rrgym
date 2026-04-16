// src/services/authService.js
// All member authentication API calls in one place.

import api from "./api";

const authService = {
  // Send OTP to email/mobile
  sendOTP: (identifier) =>
    api.post("/api/auth/send-otp", { identifier }),

  // Verify OTP and log in
  verifyOTP: (identifier, otp) =>
    api.post("/api/auth/verify-otp", { identifier, otp }),

  // Get lightweight current user (for auth guard checks)
  getMe: () =>
    api.get("/api/auth/me"),

  // Get full member profile
  getProfile: () =>
    api.get("/api/auth/profile"),

  // Log out
  logout: () =>
    api.post("/api/auth/logout"),
};

export default authService;
