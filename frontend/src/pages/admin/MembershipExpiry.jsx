import {
    Box,
    Card,
    CardContent,
    Chip,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { getExpiringMembers } from "../data/attendanceData";
import { members } from "../data/members";

const MembershipExpiry = () => {
    const [days, setDays] = useState(7);

    const expiringMembers = getExpiringMembers(members, days);

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Nearby Membership Expiry
            </Typography>

            {/* Filter */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <TextField
                        select
                        label="Expiry Within"
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

            {/* Table */}
            <Card>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Member Name</TableCell>
                                <TableCell>End Date</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {expiringMembers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No memberships expiring
                                    </TableCell>
                                </TableRow>
                            ) : (
                                expiringMembers.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>{member.name}</TableCell>
                                        <TableCell>{member.membershipEnd}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label="Expiring Soon"
                                                color="warning"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Box>
    );
};

export default MembershipExpiry;
