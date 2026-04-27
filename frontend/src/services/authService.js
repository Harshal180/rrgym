// src/services/authService.js
// All member authentication API calls in one place.

import api, { USER_TOKEN_KEY } from "./api";

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
  logout: async () => {
    try {
      return await api.post("/api/auth/logout");
    } finally {
      localStorage.removeItem(USER_TOKEN_KEY);
    }
  },
};

export default authService;
