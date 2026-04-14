import {
    Box,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Container,
    Grid,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../services/api";

export default function Trainer() {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get(`${BASE_URL}/api/members/trainers`)  // ✅ new endpoint
            .then((res) => {
                setTrainers(res.data);                // ✅ no filter needed
            })
            .catch((err) => {
                console.error("Failed to fetch trainers:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
            </Box>
        );
    }

    if (trainers.length === 0) {
        return (
            <Box textAlign="center" py={8}>
                <Typography color="text.secondary">
                    No trainers found.
                </Typography>
            </Box>
        );
    }

    return (
        <section style={{ padding: "48px 0", backgroundColor: "#ffffff" }}>
            <Container>
                <Grid container spacing={4} justifyContent="center">
                    {trainers.map((member) => (
                        <Grid item xs={12} sm={6} md={6} key={member.id}>
                            <Card
                                sx={{
                                    border: "none",
                                    textAlign: "center",
                                    padding: 2,
                                    height: "430px",
                                    width: "300px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    transition: "transform 0.3s, box-shadow 0.3s",
                                    "&:hover": {
                                        boxShadow: 6,
                                        transform: "translateY(-5px)",
                                    },
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={
                                        member.image
                                            ? `${BASE_URL}/uploads/${member.image}`
                                            : "/assets/default-avatar.png"
                                    }
                                    alt={`${member.first_name} ${member.last_name}`}
                                    sx={{
                                        width: 250,
                                        height: 250,
                                        borderRadius: "50%",
                                        padding: "24px",
                                        objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                        e.target.src = "/assets/default-avatar.png";
                                    }}
                                />

                                <CardContent>
                                    <Typography variant="h5">
                                        {member.first_name} {member.last_name}
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                    >
                                        {member.member_type}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </section>
    );
}