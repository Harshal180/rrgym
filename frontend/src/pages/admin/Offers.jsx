import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import AlertModal from "../../components/ui/AlertModal";
import { BASE_URL } from "../../services/api";
import useAlert from "../../hooks/useAlert";
const Offers = () => {
    const [memberMessage, setMemberMessage] = useState("");
    const [existingMessage, setExistingMessage] = useState("");
    const { alert, showAlert, closeAlert } = useAlert();

    const handleSendToMembers = async () => {
        if (!memberMessage) {
            showAlert("warning", "Message Required", "Please enter a message before sending.");
            return;
        }

        try {
            await axios.post(`${BASE_URL}/api/send/members`, {
                message: memberMessage,
            });

            showAlert("success", "Message Sent!", "Your offer has been sent to all current members successfully.");
            setMemberMessage("");
        } catch (error) {
            console.error(error);
            showAlert("error", "Send Failed", "Something went wrong while sending to current members. Please try again.");
        }
    };

    const handleSendToExisting = async () => {
        if (!existingMessage) {
            showAlert("warning", "Message Required", "Please enter a message before sending.");
            return;
        }

        try {
            await axios.post(`${BASE_URL} / api / send / existing - members`, {
                message: existingMessage,
            });

            showAlert("success", "Message Sent!", "Your offer has been sent to all existing members successfully.");
            setExistingMessage("");
        } catch (error) {
            console.error(error);
            showAlert("error", "Send Failed", "Something went wrong while sending to existing members. Please try again.");
        }
    };

    return (
        <>
            <Box>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                    Offers & Notifications
                </Typography>

                {/* SEND TO CURRENT MEMBERS */}
                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Typography variant="h6" mb={2}>
                            Send to Current Members
                        </Typography>

                        <TextField
                            label="Write Offer / Message"
                            multiline
                            rows={4}
                            fullWidth
                            value={memberMessage}
                            onChange={(e) => setMemberMessage(e.target.value)}
                            required
                        />

                        <Button
                            variant="contained"
                            sx={{ mt: 2, bgcolor: "#000" }}
                            onClick={handleSendToMembers}
                        >
                            Send
                        </Button>
                    </CardContent>
                </Card>

                {/* SEND TO EXISTING MEMBERS */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>
                            Send to Existing Members
                        </Typography>

                        <TextField
                            label="Write Offer / Message"
                            multiline
                            rows={4}
                            fullWidth
                            value={existingMessage}
                            onChange={(e) => setExistingMessage(e.target.value)}
                            required
                        />

                        <Button
                            variant="contained"
                            sx={{ mt: 2, bgcolor: "#000" }}
                            onClick={handleSendToExisting}
                        >
                            Send
                        </Button>
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

export default Offers;