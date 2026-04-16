import {
    Box,
    Button,
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
import { useState } from "react";
import AlertModal from "../../components/ui/AlertModal";
import { BASE_URL } from "../../services/api";
import useAlert from "../../hooks/useAlert";

const AttendanceReport = () => {
    const [selectedDate, setSelectedDate] = useState("");
    const [records, setRecords] = useState([]);
    const { alert, showAlert, closeAlert } = useAlert();

    const handleSubmit = async () => {
        if (!selectedDate) {
            showAlert("warning", "Date Required", "Please select a date to generate the report.");
            return;
        }

        try {
            const res = await axios.get(
                `${BASE_URL}/api/attendance/report/${selectedDate}`
            );
            setRecords(res.data);

            if (res.data.length === 0) {
                showAlert("info", "No Records", `No attendance records found for ${selectedDate}.`);
            }
        } catch (error) {
            console.error(error);
            showAlert("error", "Fetch Failed", "Something went wrong while fetching the report. Please try again.");
        }
    };

    return (
        <>
            <Box sx={{ padding: 3 }}>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                    Attendance Report
                </Typography>

                {/* DATE INPUT */}
                <Card sx={{ mb: 4 }}>
                    <CardContent sx={{ display: "flex", gap: 5 }}>
                        <TextField
                            type="date"
                            value={selectedDate}

                            onChange={(e) => setSelectedDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <Button variant="contained" sx={{ bgcolor: "#000", width: 150, height: 55 }} onClick={handleSubmit}>
                            Submit
                        </Button>
                    </CardContent>
                </Card>

                {/* TABLE */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>
                            Report Data
                        </Typography>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>ID</b></TableCell>
                                    <TableCell><b>Name</b></TableCell>
                                    <TableCell><b>IN Time</b></TableCell>
                                    <TableCell><b>OUT Time</b></TableCell>
                                    <TableCell><b>Expiry Date</b></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {records.length > 0 ? (
                                    records.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.member_id}</TableCell>
                                            <TableCell>
                                                {row.first_name} {row.last_name}
                                            </TableCell>
                                            <TableCell>{row.in_time || "-"}</TableCell>
                                            <TableCell>{row.out_time || "-"}</TableCell>
                                            <TableCell>{row.end_date}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No data found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
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

export default AttendanceReport;