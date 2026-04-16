// src/layouts/MainLayout.jsx
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import FitnessChatbot from "../components/user/FitnessChatbot";
import Footer from "../components/shared/Footer";
import Navbar from "../components/shared/Navbar";
import authService from "../services/authService";

export default function MainLayout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    authService
      .getMe()
      .then((res) => setUser(res.data?.data || null))
      .catch(() => setUser(null));
  }, []);

  return (
    <>
      <Navbar />
      <Outlet />
      {user?.member_type === "Member" && <FitnessChatbot />}
      <Footer />
    </>
  );
}
