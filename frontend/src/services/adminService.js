// src/services/adminService.js
// All admin authentication and trainer management API calls.

import api, { ADMIN_TOKEN_KEY } from "./api";

const adminService = {
  // Admin login
  login: (username, password) =>
    api.post("/api/admin/login", { username, password }),

  // Get current admin info
  getMe: () =>
    api.get("/api/admin/me"),

  // Change admin password
  changePassword: (currentPassword, newPassword) =>
    api.put("/api/admin/change-password", { currentPassword, newPassword }),

  // Log out
  logout: async () => {
    try {
      return await api.post("/api/admin/logout");
    } finally {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem("token");
    }
  },

  // Trainer management (owner only)
  addTrainer: (data) =>
    api.post("/api/admin/trainers", data),

  getTrainers: () =>
    api.get("/api/admin/trainers"),

  toggleTrainer: (id) =>
    api.put(`/api/admin/trainers/${id}/toggle`),
};

export default adminService;
