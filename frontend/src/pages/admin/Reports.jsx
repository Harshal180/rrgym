import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../services/api";

const Reports = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch from database
    const fetchMembers = async () => {
        try {
            const res = await axios.get(
                `${BASE_URL}/api/members`
            );
            setMembers(res.data);
        } catch (err) {
            console.error("Error fetching members:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // Calculate counts from DB data
    const totalMembers = members.length;
    const activeMembers = members.filter(
        (m) => m.status === "Active"
    ).length;

    const inactiveMembers = members.filter(
        (m) => m.status === "Inactive"
    ).length;

    if (loading) return <Typography>Loading...</Typography>;

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Reports
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary">
                                Total Members
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {totalMembers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary">
                                Active Members
                            </Typography>
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                color="green"
                            >
                                {activeMembers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary">
                                Inactive Members
                            </Typography>
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                color="red"
                            >
                                {inactiveMembers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Members List */}
            <Card>
                <CardContent>
                    <Typography variant="h6" mb={2}>
                        Members Summary
                    </Typography>

                    {members.length > 0 ? (
                        members.map((member) => (
                            <Box
                                key={member.id}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    borderBottom: "1px solid #eee",
                                    py: 1,
                                }}
                            >
                                <Typography>
                                    {member.first_name} {member.last_name}
                                </Typography>

                                <Typography
                                    color={
                                        member.status === "active"
                                            ? "green"
                                            : "red"
                                    }
                                >
                                    {member.status?.toUpperCase()}
                                </Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography>No members found</Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default Reports;
