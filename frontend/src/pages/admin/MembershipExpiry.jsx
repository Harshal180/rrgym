import {
    Box, Card, CardContent, Chip, CircularProgress,
    MenuItem, Table, TableBody, TableCell,
    TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../services/api";

const MembershipExpiry = () => {
    const [days, setDays]       = useState(7);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchExpiring = async (d) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/members`);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const cutoff = new Date(today);
            cutoff.setDate(today.getDate() + d);

            const filtered = res.data.filter((m) => {
                if (!m.end_date) return false;
                const end = new Date(m.end_date);
                end.setHours(0, 0, 0, 0);
                return end >= today && end <= cutoff;
            });
            // Sort by end_date ascending
            filtered.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
            setMembers(filtered);
        } catch (err) {
            console.error("Failed to fetch members:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchExpiring(days); }, [days]);

    const daysLeft = (endDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        return Math.round((end - today) / (1000 * 60 * 60 * 24));
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Membership Expiry
            </Typography>

            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <TextField
                        select label="Expiry Within"
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        sx={{ width: 250 }}
                    >
                        <MenuItem value={7}>Next 7 Days</MenuItem>
                        <MenuItem value={15}>Next 15 Days</MenuItem>
                        <MenuItem value={30}>Next 30 Days</MenuItem>
                    </TextField>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Member Name</b></TableCell>
                                    <TableCell><b>Mobile</b></TableCell>
                                    <TableCell><b>Plan</b></TableCell>
                                    <TableCell><b>End Date</b></TableCell>
                                    <TableCell><b>Days Left</b></TableCell>
                                    <TableCell><b>Status</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {members.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No memberships expiring in the next {days} days.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    members.map((m) => {
                                        const left = daysLeft(m.end_date);
                                        return (
                                            <TableRow key={m.id}>
                                                <TableCell>{m.first_name} {m.last_name}</TableCell>
                                                <TableCell>{m.mobile}</TableCell>
                                                <TableCell>{m.membership_type}</TableCell>
                                                <TableCell>{new Date(m.end_date).toLocaleDateString("en-IN")}</TableCell>
                                                <TableCell>{left}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={left === 0 ? "Expires Today" : `${left} day${left > 1 ? "s" : ""} left`}
                                                        color={left === 0 ? "error" : left <= 3 ? "warning" : "info"}
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default MembershipExpiry;
