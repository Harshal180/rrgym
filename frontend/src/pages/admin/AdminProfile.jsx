import {
    Alert, Avatar, Box, Button, Card, CardContent,
    CircularProgress, Divider, TextField, Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../services/api";

export default function AdminProfile() {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwMessage, setPwMessage] = useState({ text: "", type: "" });
    const [pwLoading, setPwLoading] = useState(false);

    useEffect(() => {
        axios.get(`${BASE_URL}/api/admin/me`, { withCredentials: true })
            .then((res) => setAdmin(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwMessage({ text: "", type: "" });
        if (newPassword !== confirmPassword)
            return setPwMessage({ text: "New passwords do not match", type: "error" });
        if (newPassword.length < 6)
            return setPwMessage({ text: "Password must be at least 6 characters", type: "error" });
        try {
            setPwLoading(true);
            await axios.put(`${BASE_URL}/api/admin/change-password`, { currentPassword, newPassword }, { withCredentials: true });
            setPwMessage({ text: "Password changed successfully!", type: "success" });
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        } catch (err) {
            setPwMessage({ text: err.response?.data?.message || "Failed to change password", type: "error" });
        } finally { setPwLoading(false); }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>;
    if (!admin) return <Typography align="center" mt={6} color="error">Unable to load profile.</Typography>;

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, px: 2 }}>
            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <Avatar sx={{ width: 96, height: 96, mx: "auto", mb: 2, bgcolor: "#111827", fontSize: 36 }}>
                        {admin.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">{admin.name}</Typography>
                    <Box sx={{ display: "inline-block", mt: 0.5, px: 1.5, py: 0.3, bgcolor: admin.role === "owner" ? "#fef3c7" : "#e0f2fe", color: admin.role === "owner" ? "#92400e" : "#0369a1", borderRadius: 2, fontSize: 12, fontWeight: "bold", textTransform: "uppercase" }}>
                        {admin.role}
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ textAlign: "left", px: 2 }}>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>Username</Typography>
                        <Typography variant="body1" fontWeight="500" mb={2}>{admin.username}</Typography>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>Last login</Typography>
                        <Typography variant="body1">{admin.last_login ? new Date(admin.last_login).toLocaleString("en-IN") : "—"}</Typography>
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>Change Password</Typography>
                    <Box component="form" onSubmit={handleChangePassword}>
                        <TextField fullWidth label="Current Password" type="password" margin="normal" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                        <TextField fullWidth label="New Password" type="password" margin="normal" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        <TextField fullWidth label="Confirm New Password" type="password" margin="normal" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        {pwMessage.text && <Alert severity={pwMessage.type} sx={{ mt: 2 }}>{pwMessage.text}</Alert>}
                        <Button type="submit" variant="contained" disabled={pwLoading} sx={{ mt: 2, bgcolor: "#111827", "&:hover": { bgcolor: "#1f2937" } }}>
                            {pwLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Update Password"}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
