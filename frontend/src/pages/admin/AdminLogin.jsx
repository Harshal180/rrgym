import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { ADMIN_TOKEN_KEY } from "../../services/api";
import GYM_CONFIG from "../../config/gymConfig";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/admin/me")
      .then(() => navigate("/admin"))
      .catch(() => {});
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      return setError("Username and password are required");
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/admin/login", {
        username,
        password,
      });

      if (res.data?.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, res.data.token);
        localStorage.removeItem("token");
      } else {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem("token");
      }

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ bgcolor: "#f1f5f9" }}
    >
      <Paper elevation={4} sx={{ p: 4, width: 400, borderRadius: 3 }}>
        <Box textAlign="center" mb={3}>
          <Box
            sx={{
              width: 56,
              height: 56,
              bgcolor: "#111827",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <Typography fontSize={24}>A</Typography>
          </Box>

          <Typography variant="h5" fontWeight="bold">
            Admin Login
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {GYM_CONFIG.name}
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Typography color="error" mt={1}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={22} /> : "Login"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminLogin;
