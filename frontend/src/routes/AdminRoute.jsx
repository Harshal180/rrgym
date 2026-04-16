// src/routes/AdminRoute.jsx
// Guards /admin/* routes. Redirects to /admin-login if not an admin.

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import adminService from "../services/adminService";

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    adminService
      .getMe()
      .then(() => setIsAdmin(true))
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  return isAdmin ? children : <Navigate to="/admin-login" />;
};

export default AdminRoute;
