import axios from "axios";

export const BASE_URL = "http://32.236.42.21:3000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,   // Cookie-based auth still works for same-domain setups
});



const parseStoredSession = (value) => {
  if (!value || value === "undefined" || value === "null") {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "string") {
      return JSON.parse(parsed);
    }
    return parsed;
  } catch (error) {
    return null;
  }
};

const getStoredToken = () => {
  const sessionValue =
    localStorage.getItem("mywebsite_session") || localStorage.getItem("token");

  const session = parseStoredSession(sessionValue);
  if (session && typeof session === "object") {
    return session.access || session.token || null;
  }

  return sessionValue;
};

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
