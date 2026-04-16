import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PeopleIcon from "@mui/icons-material/People";
import WarningIcon from "@mui/icons-material/Warning";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../services/api";
const Dashboard = () => {
    const navigate = useNavigate();

    const [members, setMembers] = useState([]);
    const [existingMembers, setExistingMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const membersRes = await axios.get(`${BASE_URL}/api/members`);
                const existingRes = await axios.get(`${BASE_URL}/api/existing-members`);

                setMembers(membersRes.data);
                setExistingMembers(existingRes.data);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <Typography>Loading dashboard...</Typography>;

    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === "Active").length;
    const inactiveMembers = members.filter(m => m.status === "Inactive").length;
    const expiringSoonMembers = members.filter(m => m.status === "expiring_soon").length;
    const existingMembersCount = existingMembers.length;

    const cards = [
        {
            title: "Total Members",
            value: totalMembers,
            icon: <PeopleIcon fontSize="large" />,
            color: "#2563eb",
            onClick: () => navigate("/admin/members?status=all")
        },
        {
            title: "Active Members",
            value: activeMembers,
            icon: <CheckCircleIcon fontSize="large" />,
            color: "#16a34a",
            onClick: () => navigate("/admin/members?status=Active")
        },
        {
            title: "Inactive Members",
            value: inactiveMembers,
            icon: <CancelIcon fontSize="large" />,
            color: "#dc2626",
            onClick: () => navigate("/admin/members?status=Inactive")
        },
        {
            title: "Expiry in 7 Days",
            value: expiringSoonMembers,
            icon: <WarningIcon fontSize="large" />,
            color: "#f59e0b",
            onClick: () => navigate("/admin/members?status=expiring_soon")
        },
        {
            title: "Existing Members",
            value: existingMembersCount,
            icon: <PeopleIcon fontSize="large" />,
            color: "#6b21a8",
            onClick: () => navigate("/admin/existing-members")
        }
    ];

    return (
        <>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                {cards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            onClick={card.onClick}
                            sx={{
                                borderLeft: `6px solid ${card.color}`,
                                cursor: "pointer",
                                transition: "0.3s",
                                "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow: 4
                                }
                            }}
                        >
                            <CardContent>
                                <Typography color="text.secondary">
                                    {card.title}
                                </Typography>
                                <Typography variant="h4" fontWeight="bold">
                                    {card.value}
                                </Typography>
                                <Typography sx={{ color: card.color, mt: 1 }}>
                                    {card.icon}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    );
};

export default Dashboard;
