// src/routes/ProtectedRoute.jsx
// Guards member-only routes. Redirects to /login if not authenticated.

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    authService
      .getMe()
      .then(() => setIsAuth(true))
      .catch(() => setIsAuth(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  return isAuth ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
