import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SendIcon from "@mui/icons-material/Send";
import {
    Avatar,
    Box,
    CircularProgress,
    IconButton,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../../services/api";

const API_URL = `${BASE_URL}/api/chatbot/generate`;

export default function ChatBot() {
    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hi 👋 I’m your fitness assistant. Tell me your goal!"
        }
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { sender: "user", text: input };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const formattedMessages = [
                ...messages.map(msg => ({
                    role: msg.sender === "user" ? "user" : "assistant",
                    content: msg.text
                })),
                {
                    role: "user",
                    content: input
                }
            ];

            const res = await axios.post(API_URL, {
                messages: formattedMessages
            });

            const botReply = {
                sender: "bot",
                text: res.data.reply || "No response from server"
            };

            setMessages(prev => [...prev, botReply]);
        } catch (error) {
            console.error("Error:", error);

            setMessages(prev => [
                ...prev,
                { sender: "bot", text: "Server not responding 😕" }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper
            elevation={6}
            sx={{
                width: 380,
                height: 520,
                position: "fixed",
                bottom: 20,
                right: 20,
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                overflow: "hidden"
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                }}
            >
                <Avatar sx={{ bgcolor: "white", color: "primary.main" }}>
                    <FitnessCenterIcon />
                </Avatar>
                <Typography variant="h6">RR Fitness Bot 💪</Typography>
            </Box>

            {/* Chat Area */}
            <Box
                sx={{
                    flex: 1,
                    p: 2,
                    overflowY: "auto",
                    bgcolor: "#f4f6f8"
                }}
            >
                {messages.map((msg, i) => (
                    <Box
                        key={i}
                        sx={{
                            display: "flex",
                            justifyContent:
                                msg.sender === "user" ? "flex-end" : "flex-start",
                            mb: 1
                        }}
                    >
                        <Box
                            sx={{
                                bgcolor:
                                    msg.sender === "user" ? "primary.main" : "white",
                                color:
                                    msg.sender === "user" ? "white" : "black",
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                maxWidth: "75%",
                                boxShadow: 1
                            }}
                        >
                            {msg.text}
                        </Box>
                    </Box>
                ))}

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                        <CircularProgress size={20} />
                    </Box>
                )}

                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box
                sx={{
                    p: 1.5,
                    display: "flex",
                    gap: 1,
                    borderTop: "1px solid #ddd"
                }}
            >
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    disabled={loading}
                />
                <IconButton
                    color="primary"
                    onClick={sendMessage}
                    disabled={loading}
                >
                    <SendIcon />
                </IconButton>
            </Box>
        </Paper>
    );
}
