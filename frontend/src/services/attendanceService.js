// src/services/attendanceService.js
// All attendance-related API calls.

import api from "./api";

const attendanceService = {
  // Mark attendance for a member (IN or OUT)
  mark: (memberId) =>
    api.post("/api/attendance/mark", { memberId }),

  // Get today's full attendance list (admin only)
  getToday: () =>
    api.get("/api/attendance/today"),

  // Get attendance for a specific date (admin only)
  getByDate: (date) =>
    api.get(`/api/attendance/report/${date}`),
};

export default attendanceService;
