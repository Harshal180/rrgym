import {
    Avatar,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../services/api";
import authService from "../../services/authService";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await authService.getProfile();
                setUser(res.data?.data || null);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return (
            <Typography align="center" mt={5}>
                Unable to load profile
            </Typography>
        );
    }

    // Calculate BMI
    const heightInMeters = user.height ? parseFloat(user.height) / 100 : null;
    const weight = user.weight ? parseFloat(user.weight) : null;

    let bmi = "N/A";
    if (heightInMeters && weight) {
        bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", py: 4, px: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                My Profile
            </Typography>

            {/* MAIN LAYOUT */}
            <Box
                sx={{
                    display: "flex",
                    gap: 4,
                    alignItems: "flex-start",
                    flexDirection: { xs: "column", md: "row" }
                }}
            >
                {/* LEFT SIDE CARD */}
                <Box sx={{ flex: 1, minWidth: 300 }}>
                    <Card sx={{ textAlign: "center", p: 3 }}>
                        <Avatar
                            src={
                                user.image
                                    ? `${BASE_URL}/uploads/${user.image}`
                                    : ""
                            }
                            alt="Profile"
                            sx={{
                                width: 130,
                                height: 130,
                                mx: "auto",
                                mb: 2,
                                border: "3px solid #000"
                            }}
                        />

                        <Typography variant="h6">
                            {user.first_name} {user.last_name}
                        </Typography>

                        <Typography color="text.secondary">
                            {user.member_type}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography>
                            <strong>Membership:</strong>{" "}
                            {user.membership_type || "N/A"}
                        </Typography>

                        <Typography>
                            <strong>Valid Till:</strong>{" "}
                            {user.end_date || "N/A"}
                        </Typography>
                    </Card>
                </Box>

                {/* RIGHT SIDE DETAILS */}
                <Box sx={{ flex: 2 }}>
                    {/* PERSONAL INFO */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Personal Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Typography mb={1}>
                                <strong>Name:</strong> {user.first_name} {user.last_name}
                            </Typography>

                            <Typography mb={1}>
                                <strong>Phone:</strong> {user.mobile}
                            </Typography>

                            <Typography mb={1}>
                                <strong>Email:</strong> {user.email}
                            </Typography>

                            <Typography>
                                <strong>Age:</strong> {user.age || "N/A"}
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* FITNESS INFO */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Fitness Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Typography mb={1}>
                                <strong>Height:</strong> {user.height || "N/A"} cm
                            </Typography>

                            <Typography mb={1}>
                                <strong>Weight:</strong> {user.weight || "N/A"} kg
                            </Typography>

                            <Typography mb={1}>
                                <strong>BMI:</strong> {bmi}
                            </Typography>

                            <Typography mb={1}>
                                <strong>Start Date:</strong> {user.start_date || "N/A"}
                            </Typography>

                            <Typography>
                                <strong>End Date:</strong> {user.end_date || "N/A"}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}