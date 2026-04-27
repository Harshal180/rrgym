import {
    Box,
    Button,
    CircularProgress,
    Grid,
    Link,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { USER_TOKEN_KEY } from "../../services/api";
import authService from "../../services/authService";

const Login = () => {
    const [emailOrMobile, setEmailOrMobile] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [showOtp, setShowOtp] = useState(false);
    const [message, setMessage] = useState("");
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const inputRefs = useRef([]);

    /* ===============================
       AUTO REDIRECT IF ALREADY LOGIN
    =============================== */
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await authService.getMe();
                const type = res.data?.data?.member_type?.toLowerCase();

                if (type === "trainer") {
                    navigate("/admin");
                } else if (type === "member") {
                    navigate("/");
                }
            } catch (err) {
                console.log(err);
            }
        };

        checkAuth();
    }, [navigate]);

    /* ===============================
       TIMER
    =============================== */
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    /* ===============================
       SEND OTP
    =============================== */
    const handleSendOtp = async () => {
        if (!emailOrMobile) {
            return setMessage("Please enter email or mobile");
        }

        try {
            setLoading(true);
            setMessage("");

            const res = await authService.sendOTP(emailOrMobile);

            setShowOtp(true);
            setTimer(60);
            setMessage(res.data?.message || "OTP sent successfully");

        } catch (err) {
            setMessage(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    /* ===============================
       OTP INPUT
    =============================== */
    const handleOtpChange = (value, index) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    /* ===============================
       LOGIN (VERIFY OTP)
    =============================== */
    const handleLogin = async () => {
        try {
            setLoading(true);
            setMessage("");

            const finalOtp = otp.join("");

            const res = await authService.verifyOTP(emailOrMobile, finalOtp);
            const member = res.data?.data;
            const type = member?.member_type?.toLowerCase();

            if (res.data?.token) {
                localStorage.setItem(USER_TOKEN_KEY, res.data.token);
            }

            if (type === "trainer") {
                navigate("/admin");
            } else if (type === "member") {
                navigate("/");
            } else {
                setMessage("Unknown member type");
            }

        } catch (err) {
            setMessage(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <Paper elevation={4} sx={{ p: 4, width: 400 }}>
                <Typography variant="h5" align="center" mb={2}>
                    Login
                </Typography>

                <TextField
                    fullWidth
                    label="Email or Mobile"
                    margin="normal"
                    value={emailOrMobile}
                    onChange={(e) => setEmailOrMobile(e.target.value)}
                />

                {!showOtp && (
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2, backgroundColor: "black", "&:hover": { backgroundColor: "#333" } }}
                        onClick={handleSendOtp}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Send OTP"}
                    </Button>
                )}

                {showOtp && (
                    <>
                        <Grid container spacing={2} mt={1} justifyContent="center">
                            {otp.map((digit, index) => (
                                <Grid item key={index}>
                                    <TextField
                                        value={digit}
                                        inputRef={(el) => (inputRefs.current[index] = el)}
                                        onChange={(e) => handleOtpChange(e.target.value, index)}
                                        inputProps={{ maxLength: 1 }}
                                        sx={{ width: 60 }}
                                    />
                                </Grid>
                            ))}
                        </Grid>

                        <Typography align="center" mt={1}>
                            {timer > 0 ? `OTP valid for ${timer}s` : "OTP expired"}
                        </Typography>

                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2, backgroundColor: "black", "&:hover": { backgroundColor: "#333" } }}
                            onClick={handleLogin}
                            disabled={loading || timer === 0}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Login"}
                        </Button>

                        {timer === 0 && (
                            <Link
                                component="button"
                                variant="body2"
                                onClick={handleSendOtp}
                                sx={{ mt: 1 }}
                            >
                                Resend OTP
                            </Link>
                        )}
                    </>
                )}

                <Typography color="error" mt={2}>
                    {message}
                </Typography>

                <Button
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 2, borderColor: "black", color: "black", "&:hover": { backgroundColor: "#f5f5f5" } }}
                    onClick={() => navigate("/admin-login")}
                >
                    Login as Admin
                </Button>
            </Paper>
        </Box>
    );
};

export default Login;
