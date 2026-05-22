// src/services/memberService.js
// All member CRUD and membership API calls.

import api from "./api";

const memberService = {
  // Get all members (with optional filters)
  getAll: (params = {}) =>
    api.get("/api/members", { params }),

  // Get a single member by ID
  getById: (id) =>
    api.get(`/api/members/${id}`),

  // Get all trainers
  getTrainers: () =>
    api.get("/api/members/trainers"),

  // Add a new member (FormData for image upload)
  add: (formData) =>
    api.post("/api/members/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Renew a member's membership
  renew: (data) =>
    api.post("/api/members/renew", data),

  // Send bill PDF to member email
  sendBill: (memberId) =>
    api.post(`/api/members/${memberId}/send-bill`),

  // Get existing (pre-import) members
  getExisting: () =>
    api.get("/api/existing-members"),
};

export default memberService;
