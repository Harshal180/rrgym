import {
    Avatar,
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import AlertModal from "../../components/ui/AlertModal";
import { BASE_URL } from "../../services/api";
import useAlert from "../../hooks/useAlert";
import { useMembers } from "../../context/MembersContext";

const Attendance = () => {
    const [memberId, setMemberId] = useState("");
    const [records, setRecords] = useState([]);
    const [memberPhoto, setMemberPhoto] = useState(null);
    const [memberInfo, setMemberInfo] = useState(null);
    const inputRef = useRef(null);

    const { membersMap, getImageSrc } = useMembers();
    const { alert, showAlert, closeAlert } = useAlert();

    const fetchAttendance = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/attendance/today`);
            setRecords(res.data);
        } catch (error) {
            console.error("Error fetching attendance:", error);
        }
    };

    useEffect(() => {
        fetchAttendance();
        inputRef.current?.focus();
    }, []);

    // ✅ Instant lookup from context — no API call, no delay
    useEffect(() => {
        if (!memberId) {
            setMemberPhoto(null);
            setMemberInfo(null);
            return;
        }

        const member = membersMap[memberId];
        if (member) {
            setMemberPhoto(getImageSrc(member.image));
            setMemberInfo(member);
        } else {
            setMemberPhoto(null);
            setMemberInfo(null);
        }
    }, [memberId, membersMap]);

    const handleMark = async () => {
        if (!memberId) return;

        try {
            const res = await axios.post(`${BASE_URL}/api/attendance/mark`, {
                memberId,
            });

            if (res.data?.remainingDays !== undefined && res.data.remainingDays <= 3) {
                showAlert(
                    "warning",
                    "Membership Expiring Soon!",
                    `This member's membership expires in ${res.data.remainingDays} day(s). Please ask them to renew soon.`
                );
            }

            setMemberId("");
            setMemberPhoto(null);
            setMemberInfo(null);
            fetchAttendance();
            inputRef.current?.focus();
        } catch (error) {
            showAlert(
                "error",
                "Attendance Error",
                error.response?.data?.message || "Something went wrong while marking attendance."
            );
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleMark();
    };

    const getExpiryColor = (endDate) => {
        const diffDays = Math.ceil(
            (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays < 0) return "red";
        if (diffDays <= 3) return "orange";
        return "inherit";
    };

    return (
        <>
            <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>

                {/* ── LEFT PANEL: Scanner + Photo ── */}
                <Box
                    sx={{
                        width: 280,
                        flexShrink: 0,
                        bgcolor: "#111827",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        p: 2,
                        gap: 2,
                        borderRight: "1px solid #1f2937",
                    }}
                >
                    {/* Scanner Input */}
                    <Box sx={{ width: "100%" }}>
                        <Typography variant="subtitle2" fontWeight="bold" color="white" mb={1}>
                            Attendance Scanner
                        </Typography>

                        <TextField
                            inputRef={inputRef}
                            fullWidth
                            size="small"
                            placeholder="Enter Member ID"
                            value={memberId}
                            onChange={(e) => setMemberId(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    bgcolor: "#1f2937",
                                    color: "white",
                                    "& fieldset": { borderColor: "#374151" },
                                    "&:hover fieldset": { borderColor: "#22c55e" },
                                    "&.Mui-focused fieldset": { borderColor: "#22c55e" },
                                },
                                "& .MuiInputBase-input": { color: "white" },
                                "& .MuiInputBase-input::placeholder": { color: "#9ca3af" },
                            }}
                        />

                        <Typography variant="caption" color="#6b7280" mt={0.5} display="block">
                            Press Enter to mark attendance
                        </Typography>
                    </Box>

                    {/* Member Photo */}
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1.5,
                            mt: 1,
                        }}
                    >
                        <Avatar
                            src={memberPhoto || undefined}
                            alt={
                                memberInfo
                                    ? `${memberInfo.first_name} ${memberInfo.last_name}`
                                    : "Member"
                            }
                            sx={{
                                width: 160,
                                height: 160,
                                bgcolor: "#1f2937",
                                border: memberPhoto
                                    ? "3px solid #22c55e"
                                    : "3px solid #374151",
                                fontSize: 48,
                                transition: "all 0.3s ease",
                            }}
                        >
                            {!memberPhoto && "👤"}
                        </Avatar>

                        {memberInfo ? (
                            <Box sx={{ textAlign: "center" }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="white">
                                    {memberInfo.first_name} {memberInfo.last_name}
                                </Typography>
                                <Typography variant="caption" color="#9ca3af">
                                    ID: {memberInfo.id || memberId}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography variant="caption" color="#6b7280">
                                {memberId ? "Member not found" : "No member scanned"}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* ── RIGHT PANEL: Attendance Table ── */}
                <Box sx={{ flex: 1, overflow: "auto", p: 3, bgcolor: "#f9fafb" }}>
                    <Typography variant="h5" fontWeight="bold" mb={3}>
                        Today's Attendance
                    </Typography>

                    <Card>
                        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>ID</b></TableCell>
                                        <TableCell><b>Photo</b></TableCell>
                                        <TableCell><b>Name</b></TableCell>
                                        <TableCell><b>IN Time</b></TableCell>
                                        <TableCell><b>OUT Time</b></TableCell>
                                        <TableCell><b>Expiry Date</b></TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {records.length > 0 ? (
                                        records.map((row) => (
                                            <TableRow key={row.id} hover>
                                                <TableCell>{row.member_id}</TableCell>

                                                {/* ✅ Instant image from context map */}
                                                <TableCell>
                                                    <Avatar
                                                        src={getImageSrc(membersMap[row.member_id]?.image) || undefined}
                                                        alt={`${row.first_name} ${row.last_name}`}
                                                        sx={{ width: 40, height: 40 }}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    {row.first_name} {row.last_name}
                                                </TableCell>

                                                <TableCell>{row.in_time || "-"}</TableCell>

                                                <TableCell>{row.out_time || "-"}</TableCell>

                                                <TableCell
                                                    sx={{
                                                        color: getExpiryColor(row.end_date),
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    {row.end_date}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                align="center"
                                                sx={{ py: 6, color: "#9ca3af" }}
                                            >
                                                No attendance records for today
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* ✅ Alert Modal */}
            <AlertModal
                open={alert.open}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onClose={closeAlert}
            />
        </>
    );
};

export default Attendance;