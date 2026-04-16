import AddIcon from "@mui/icons-material/Add";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    TextField,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../services/api";

export default function ManageTrainers() {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Add trainer dialog
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [addMessage, setAddMessage] = useState({ text: "", type: "" });
    const [addLoading, setAddLoading] = useState(false);

    const fetchTrainers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/api/admin/trainers`, { withCredentials: true });
            setTrainers(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load trainer accounts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTrainers(); }, []);

    const handleToggle = async (id) => {
        try {
            await axios.put(`${BASE_URL}/api/admin/trainers/${id}/toggle`, {}, { withCredentials: true });
            fetchTrainers();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update");
        }
    };

    const handleAddTrainer = async (e) => {
        e.preventDefault();
        setAddMessage({ text: "", type: "" });
        try {
            setAddLoading(true);
            await axios.post(
                `${BASE_URL}/api/admin/trainers`,
                { name, username, password },
                { withCredentials: true }
            );
            setAddMessage({ text: "Trainer account created!", type: "success" });
            setName(""); setUsername(""); setPassword("");
            fetchTrainers();
            setTimeout(() => setOpen(false), 1200);
        } catch (err) {
            setAddMessage({ text: err.response?.data?.message || "Failed to create trainer", type: "error" });
        } finally {
            setAddLoading(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>;

    return (
        <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, px: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">Manage Trainer Accounts</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { setOpen(true); setAddMessage({ text: "", type: "" }); }}
                    sx={{ bgcolor: "#111827", "&:hover": { bgcolor: "#1f2937" } }}
                >
                    Add Trainer
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {trainers.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" mt={4}>
                    No accounts found.
                </Typography>
            ) : (
                trainers.map((t) => (
                    <Card key={t.id} sx={{ mb: 2, borderRadius: 3, opacity: t.is_active ? 1 : 0.6 }}>
                        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar sx={{ bgcolor: t.role === "owner" ? "#111827" : "#1d4ed8", width: 48, height: 48 }}>
                                {t.name?.charAt(0).toUpperCase()}
                            </Avatar>

                            <Box flexGrow={1}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography fontWeight="bold">{t.name}</Typography>
                                    <Chip
                                        label={t.role}
                                        size="small"
                                        sx={{
                                            bgcolor: t.role === "owner" ? "#fef3c7" : "#e0f2fe",
                                            color: t.role === "owner" ? "#92400e" : "#0369a1",
                                            fontWeight: "bold",
                                            fontSize: 11,
                                        }}
                                    />
                                    <Chip
                                        label={t.is_active ? "Active" : "Disabled"}
                                        size="small"
                                        color={t.is_active ? "success" : "default"}
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary">@{t.username}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Last login: {t.last_login ? new Date(t.last_login).toLocaleString("en-IN") : "Never"}
                                </Typography>
                            </Box>

                            {t.role !== "owner" && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    color={t.is_active ? "error" : "success"}
                                    onClick={() => handleToggle(t.id)}
                                    sx={{ minWidth: 80 }}
                                >
                                    {t.is_active ? "Disable" : "Enable"}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}

            {/* Add Trainer Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Add Trainer Account</DialogTitle>
                <Divider />
                <Box component="form" onSubmit={handleAddTrainer}>
                    <DialogContent>
                        <TextField fullWidth label="Full Name" margin="normal" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                        <TextField fullWidth label="Username" margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} helperText="Used to login — lowercase, no spaces" />
                        <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} helperText="Minimum 6 characters" />
                        {addMessage.text && (
                            <Alert severity={addMessage.type} sx={{ mt: 1 }}>{addMessage.text}</Alert>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={addLoading}
                            sx={{ bgcolor: "#111827", "&:hover": { bgcolor: "#1f2937" } }}
                        >
                            {addLoading ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Create Account"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}
