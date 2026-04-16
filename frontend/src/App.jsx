// src/App.jsx
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import MainLayout  from "./layouts/MainLayout";

// Route guards
import AdminRoute     from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

// Context
import { MembersProvider } from "./context/MembersContext";

// User pages
import Home         from "./pages/user/Home";
import AboutUs      from "./pages/user/Aboutus";
import Services     from "./pages/user/Services";
import PricingPlans from "./pages/user/PricingPlans";
import Gallery      from "./pages/user/Gallery";
import ContactUs    from "./pages/user/ContactUs";
import ChatBot      from "./pages/user/ChatBot";
import Login        from "./pages/user/Login";
import Profile      from "./pages/user/Profile";
import CalculateBMI from "./pages/user/CalculateBMI";

// Admin pages
import AdminLogin       from "./pages/admin/AdminLogin";
import Dashboard        from "./pages/admin/Dashboard";
import Members          from "./pages/admin/Members";
import AddMember        from "./pages/admin/AddMember";
import RenewMembership  from "./pages/admin/RenewMembership";
import ExistingMembers  from "./pages/admin/ExistingMembers";
import Attendance       from "./pages/admin/Attendance";
import AttendanceReport from "./pages/admin/AttendanceReport";
import MembershipPlans  from "./pages/admin/MembershipPlans";
import Offers           from "./pages/admin/Offers";
import Reports          from "./pages/admin/Reports";
import Payments         from "./pages/admin/Payments";
import ManageTrainers   from "./pages/admin/ManageTrainers";
import AdminProfile     from "./pages/admin/AdminProfile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public user routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index           element={<Home />} />
          <Route path="login"    element={<Login />} />
          <Route path="aboutus"  element={<AboutUs />} />
          <Route path="pricing"  element={<PricingPlans />} />
          <Route path="services" element={<Services />} />
          <Route path="gallery"  element={<Gallery />} />
          <Route path="contact"  element={<ContactUs />} />
          <Route path="chatbot"  element={<ChatBot />} />
          <Route path="profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="bmi"      element={<ProtectedRoute><CalculateBMI /></ProtectedRoute>} />
        </Route>

        {/* Admin login - outside AdminLayout */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Admin dashboard - protected */}
        <Route path="/admin" element={<AdminRoute><MembersProvider><AdminLayout /></MembersProvider></AdminRoute>}>
          <Route index                    element={<Dashboard />} />
          <Route path="dashboard"         element={<Dashboard />} />
          <Route path="members"           element={<Members />} />
          <Route path="add-member"        element={<AddMember />} />
          <Route path="renew"             element={<RenewMembership />} />
          <Route path="existing-members"  element={<ExistingMembers />} />
          <Route path="attendance"        element={<Attendance />} />
          <Route path="attendance-report" element={<AttendanceReport />} />
          <Route path="plans"             element={<MembershipPlans />} />
          <Route path="offers"            element={<Offers />} />
          <Route path="reports"           element={<Reports />} />
          <Route path="payments"          element={<Payments />} />
          <Route path="trainers"          element={<ManageTrainers />} />
          <Route path="profile"           element={<AdminProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
