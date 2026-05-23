// src/services/api.js
// Single axios instance used by all service modules.
// Every request automatically sends cookies (withCredentials: true).
// This is required for cross-origin cookie auth (Netlify frontend → AWS backend).

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  // CRITICAL: must be true so the browser sends the HttpOnly cookie
  // to the backend on a different domain (cross-origin requests).
  withCredentials: true,
});

// Global 401 interceptor — avoids unhandled promise rejections in route guards.
// Each service/component can still catch and handle errors individually.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let callers handle 401/403 themselves (ProtectedRoute, AdminRoute, etc.)
    return Promise.reject(error);
  }
);

export { BASE_URL };
export default api;
