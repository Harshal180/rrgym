// src/components/admin/Topbar.jsx
import {
  AppBar, Avatar, Box, IconButton,
  Menu, MenuItem, Toolbar, Tooltip, Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../../services/adminService";

const Topbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [admin, setAdmin]       = useState(null);
  const navigate                = useNavigate();

  useEffect(() => {
    adminService.getMe()
      .then((res) => setAdmin(res.data))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await adminService.logout(); } catch (_) {}
    navigate("/admin-login");
  };

  const menuActions = [
    { label: "Profile", onClick: () => navigate("/admin/profile") },
    { label: "Logout",  onClick: handleLogout },
  ];

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {admin?.role === "owner" ? "Owner Dashboard" : "Trainer Dashboard"}
        </Typography>

        {admin && (
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            {admin.name}
            {admin.role === "owner" && (
              <Box component="span" sx={{ ml: 1, px: 1, py: 0.2, bgcolor: "#fef3c7", color: "#92400e", borderRadius: 1, fontSize: 11, fontWeight: "bold" }}>
                OWNER
              </Box>
            )}
          </Typography>
        )}

        <Tooltip title="Account settings">
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: "#111827" }}>
              {admin?.name?.charAt(0).toUpperCase() || "A"}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {menuActions.map((action) => (
            <MenuItem key={action.label} onClick={() => { setAnchorEl(null); action.onClick(); }}>
              <Typography>{action.label}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
