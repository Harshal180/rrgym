// src/services/planService.js
// Membership plan API calls.

import api from "./api";

const planService = {
  // Get all membership plans (public)
  getAll: () =>
    api.get("/api/plans"),

  // Update a plan's price / offer price (admin only)
  update: (id, data) =>
    api.put(`/api/plans/${id}`, data),
};

export default planService;
