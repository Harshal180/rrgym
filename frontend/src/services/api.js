import axios from "axios";

export const BASE_URL = "http://32.236.42.21:3000";
export const ADMIN_TOKEN_KEY = "admin_token";
export const USER_TOKEN_KEY = "user_token";
const LEGACY_ADMIN_TOKEN_KEY = "token";
const LEGACY_MEMBER_SESSION_KEY = "mywebsite_session";

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

const readTokenValue = (key) => {
  const value = localStorage.getItem(key);
  if (!value || value === "undefined" || value === "null") {
    return null;
  }
  return value;
};

const getStoredToken = () => {
  const sessionValue = localStorage.getItem(LEGACY_MEMBER_SESSION_KEY);
  const session = parseStoredSession(sessionValue);
  if (session && typeof session === "object") {
    return session.access || session.token || null;
  }

  return sessionValue;
};

const getTokenForRequest = (config) => {
  const requestUrl = config?.url || "";
  const isAdminRequest = requestUrl.startsWith("/api/admin");

  if (isAdminRequest) {
    return readTokenValue(ADMIN_TOKEN_KEY) || readTokenValue(LEGACY_ADMIN_TOKEN_KEY);
  }

  return readTokenValue(USER_TOKEN_KEY) || getStoredToken();
};

api.interceptors.request.use((config) => {
  const token = getTokenForRequest(config);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});

export default api;
