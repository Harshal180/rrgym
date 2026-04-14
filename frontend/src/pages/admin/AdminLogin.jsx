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
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../services/api";
import GYM_CONFIG from "../../config/gymConfig";
axios.defaults.withCredentials = true;

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in as admin
    useEffect(() => {
        axios.get(`${BASE_URL}/api/admin/me`, { withCredentials: true })
            .then(() => navigate("/admin"))
            .catch(() => { });
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password) {
            return setError("Username and password are required");
        }

        try {
            setLoading(true);
            setError("");
            await axios.post(
                `${BASE_URL}/api/admin/login`,
                { username: username.trim(), password },
                { withCredentials: true }
            );
            navigate("/admin");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
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
                {/* Header */}
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
                        <Typography fontSize={24}>💪</Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold">
                        Admin Login
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {GYM_CONFIG.name}
                    </Typography>
                </Box>

                {/* Form */}
                <Box component="form" onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="Username"
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus
                        autoComplete="username"
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword((p) => !p)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {error && (
                        <Typography color="error" variant="body2" mt={1}>
                            {error}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{
                            mt: 3,
                            py: 1.2,
                            bgcolor: "#111827",
                            "&:hover": { bgcolor: "#1f2937" },
                            borderRadius: 2,
                            fontWeight: "bold",
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={22} sx={{ color: "white" }} />
                        ) : (
                            "Login"
                        )}
                    </Button>
                </Box>

                <Box textAlign="center" mt={3}>
                    <Typography
                        variant="body2"
                        component="a"
                        href="/login"
                        sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                    >
                        Member? Login here →
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default AdminLogin;
