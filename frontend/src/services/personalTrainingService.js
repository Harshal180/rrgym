// src/services/personalTrainingService.js
// Personal Training plan API calls.

import api from "./api";

const personalTrainingService = {
  // Get all personal training plans (public)
  getAll: () =>
    api.get("/api/personal-training-plans"),

  // Update a plan's price / offer price (admin only)
  update: (id, data) =>
    api.put(`/api/personal-training-plans/${id}`, data),
};

export default personalTrainingService;
