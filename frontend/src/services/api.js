// src/services/api.js
// Single axios instance used by all service modules.
// Every request automatically sends cookies (withCredentials).

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export { BASE_URL };
export default api;
