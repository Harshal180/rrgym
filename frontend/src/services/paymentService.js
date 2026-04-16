// src/services/paymentService.js
// All payment API calls.

import api from "./api";

const paymentService = {
  // Record a new payment
  record: (data) =>
    api.post("/api/payments", data),

  // Get all payments (with optional date range)
  getAll: (from, to) =>
    api.get("/api/payments", { params: { from, to } }),

  // Get payments for a specific member
  getByMember: (memberId) =>
    api.get(`/api/payments/member/${memberId}`),

  // Get members with pending balances
  getPending: () =>
    api.get("/api/payments/pending"),

  // Collect a balance payment
  collectBalance: (data) =>
    api.post("/api/payments/collect-balance", data),

  // Get summary stats
  getStats: () =>
    api.get("/api/payments/stats"),
};

export default paymentService;
