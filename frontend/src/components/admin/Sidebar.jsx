// src/components/admin/Sidebar.jsx
import {
  Box, IconButton, List, ListItem, ListItemIcon,
  ListItemText, Tooltip, Typography,
  useMediaQuery, useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import AssessmentIcon      from "@mui/icons-material/Assessment";
import ChevronLeftIcon     from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon    from "@mui/icons-material/ChevronRight";
import CurrencyRupeeIcon   from "@mui/icons-material/CurrencyRupee";
import DashboardIcon       from "@mui/icons-material/Dashboard";
import EventAvailableIcon  from "@mui/icons-material/EventAvailable";
import LocalOfferIcon      from "@mui/icons-material/LocalOffer";
import ManageAccountsIcon  from "@mui/icons-material/ManageAccounts";
import PeopleIcon          from "@mui/icons-material/People";
import PersonAddIcon       from "@mui/icons-material/PersonAdd";

import GYM_CONFIG   from "../../config/gymConfig";
import adminService from "../../services/adminService";

const BASE_MENU = [
  { label: "Dashboard",         path: "/admin/dashboard",         icon: <DashboardIcon /> },
  { label: "Add Member",        path: "/admin/add-member",        icon: <PersonAddIcon /> },
  { label: "Renew Member",      path: "/admin/renew",             icon: <PersonAddIcon /> },
  { label: "Members",           path: "/admin/members",           icon: <PeopleIcon /> },
  { label: "Attendance",        path: "/admin/attendance",        icon: <EventAvailableIcon /> },
  { label: "Attendance Report", path: "/admin/attendance-report", icon: <AssessmentIcon /> },
  { label: "Membership Plans",  path: "/admin/plans",             icon: <CurrencyRupeeIcon /> },
  { label: "Offers",            path: "/admin/offers",            icon: <LocalOfferIcon /> },
  { label: "Reports",           path: "/admin/reports",           icon: <AssessmentIcon /> },
  { label: "Existing Members",  path: "/admin/existing-members",  icon: <PeopleIcon /> },
  { label: "Payments",          path: "/admin/payments",          icon: <CurrencyRupeeIcon /> },
];

const OWNER_MENU = [
  { label: "Manage Trainers", path: "/admin/trainers", icon: <ManageAccountsIcon /> },
];

const EXPANDED_WIDTH  = 260;
const COLLAPSED_WIDTH = 64;

const Sidebar = () => {
  const theme         = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole]           = useState(null);

  useEffect(() => { setCollapsed(isSmallScreen); }, [isSmallScreen]);

  useEffect(() => {
    adminService.getMe()
      .then((res) => setRole(res.data.role))
      .catch(() => {});
  }, []);

  const menuItems = role === "owner" ? [...BASE_MENU, ...OWNER_MENU] : BASE_MENU;

  return (
    <Box sx={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH, minWidth: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH, flexShrink: 0, bgcolor: "#111827", color: "white", height: "100vh", minHeight: "100vh", transition: "width 0.3s ease, min-width 0.3s ease", overflow: "hidden", display: "flex", flexDirection: "column", position: "sticky", top: 0 }}>

      {/* Logo / toggle */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", minHeight: 56, flexShrink: 0 }}>
        {!collapsed && <Typography variant="h6" fontWeight="bold" noWrap>{GYM_CONFIG.name}</Typography>}
        <IconButton onClick={() => setCollapsed((p) => !p)} size="small" sx={{ color: "white", bgcolor: "#1f2937", border: "1px solid #374151", flexShrink: 0, "&:hover": { bgcolor: "#374151" } }}>
          {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Nav links */}
      <List sx={{ px: collapsed ? 0 : 1, flexGrow: 1, overflowY: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, "&:hover": { scrollbarWidth: "thin" }, "&:hover::-webkit-scrollbar": { display: "block", width: "4px" }, "&:hover::-webkit-scrollbar-thumb": { backgroundColor: "#374151", borderRadius: "4px" } }}>
        {menuItems.map((item) => (
          <Tooltip key={item.path} title={collapsed ? item.label : ""} placement="right" arrow>
            <ListItem component={NavLink} to={item.path} sx={{ color: "white", borderRadius: collapsed ? 0 : "8px", mb: 0.5, justifyContent: collapsed ? "center" : "flex-start", px: collapsed ? 0 : 2, minHeight: 48, "&.active": { bgcolor: "#1f2937", borderLeft: "4px solid #22c55e" }, "&:hover": { bgcolor: "#1f2937" } }}>
              <ListItemIcon sx={{ color: "white", minWidth: collapsed ? "unset" : 40, justifyContent: "center" }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} sx={{ opacity: collapsed ? 0 : 1, transition: "opacity 0.2s ease", whiteSpace: "nowrap" }} />}
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
