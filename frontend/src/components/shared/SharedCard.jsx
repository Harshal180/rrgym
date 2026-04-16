import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "../../services/api";

// Features per plan based on duration
const getPlanFeatures = (months) => {
    if (months === 1) return [
        "Full gym access",
        "Basic fitness programs",
        "Locker room access",
        "No personal training",
    ];
    if (months === 3) return [
        "Full gym access",
        "All fitness programs",
        "Locker room access",
        "Group classes included",
    ];
    if (months === 6) return [
        "Full gym access",
        "All fitness programs",
        "Limited personal training",
        "Trainer support",
    ];
    if (months === 12) return [
        "Unlimited gym access",
        "All programs included",
        "Unlimited personal training",
        "24/7 access",
    ];
    return [];
};

export default function PricingPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/plans`);
                setPlans(res.data);
            } catch (err) {
                console.error("Error fetching plans:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                <CircularProgress sx={{ color: "#000" }} />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 6, px: 2 }}>
            {/* Header */}
            <Box textAlign="center" mb={6}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Membership Plans
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Choose the plan that fits your fitness goals
                </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center" maxWidth={1100} mx="auto">
                {plans.map((plan) => {
                    const hasOffer = plan.offer_price !== null && plan.offer_price !== undefined;
                    const discount = hasOffer
                        ? Math.round(((plan.price - plan.offer_price) / plan.price) * 100)
                        : 0;
                    const features = getPlanFeatures(plan.duration_months);

                    return (
                        <Grid item xs={12} sm={6} md={3} key={plan.id}>
                            <Card
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    border: hasOffer ? "2px solid #22c55e" : "1px solid #e5e7eb",
                                    borderRadius: "16px",
                                    position: "relative",
                                    transition: "transform 0.3s, box-shadow 0.3s",
                                    "&:hover": {
                                        transform: "translateY(-6px)",
                                        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                                    },
                                }}
                            >
                                {/* Offer Badge */}
                                {hasOffer && (
                                    <Chip
                                        label={`${discount}% OFF`}
                                        size="small"
                                        sx={{
                                            position: "absolute",
                                            top: 14,
                                            right: 14,
                                            bgcolor: "#22c55e",
                                            color: "white",
                                            fontWeight: "bold",
                                            fontSize: "11px",
                                        }}
                                    />
                                )}

                                <CardContent sx={{ p: 3 }}>
                                    {/* Plan Name */}
                                    <Typography variant="h6" fontWeight="bold" mb={0.5}>
                                        {plan.plan_name}
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary">
                                        {plan.duration_months} month{plan.duration_months > 1 ? "s" : ""} membership
                                    </Typography>

                                    {/* Price */}
                                    <Box sx={{ mt: 2, mb: 3, minHeight: 60 }}>
                                        {hasOffer ? (
                                            <>
                                                {/* Strikethrough original price */}
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        textDecoration: "line-through",
                                                        color: "text.secondary",
                                                        fontSize: "15px",
                                                    }}
                                                >
                                                    ₹{Number(plan.price).toLocaleString("en-IN")}
                                                </Typography>

                                                {/* Offer price */}
                                                <Box display="flex" alignItems="baseline" gap={0.5}>
                                                    <Typography variant="h4" fontWeight="bold" color="#22c55e">
                                                        ₹{Number(plan.offer_price).toLocaleString("en-IN")}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        / {plan.plan_name.toLowerCase()}
                                                    </Typography>
                                                </Box>

                                                <Typography variant="caption" color="#22c55e" fontWeight="bold">
                                                    You save ₹{Number(plan.price - plan.offer_price).toLocaleString("en-IN")}!
                                                </Typography>
                                            </>
                                        ) : (
                                            <Box display="flex" alignItems="baseline" gap={0.5}>
                                                <Typography variant="h4" fontWeight="bold">
                                                    ₹{Number(plan.price).toLocaleString("en-IN")}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    / {plan.plan_name.toLowerCase()}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Divider */}
                                    <Box sx={{ borderTop: "1px solid #f0f0f0", pt: 2 }}>
                                        {features.map((feature, i) => (
                                            <Box key={i} display="flex" alignItems="center" gap={1} mb={1}>
                                                <Box
                                                    sx={{
                                                        width: 18,
                                                        height: 18,
                                                        borderRadius: "50%",
                                                        bgcolor: hasOffer ? "#22c55e" : "#111827",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <Typography sx={{ color: "white", fontSize: "11px", lineHeight: 1 }}>
                                                        ✓
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {feature}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>

                                <CardActions sx={{ p: 3, pt: 0 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        component={Link}
                                        to="/contact"
                                        sx={{
                                            bgcolor: hasOffer ? "#22c55e" : "#111827",
                                            color: "white",
                                            borderRadius: "10px",
                                            textTransform: "none",
                                            fontWeight: "bold",
                                            py: 1.2,
                                            "&:hover": {
                                                bgcolor: hasOffer ? "#16a34a" : "#374151",
                                            },
                                        }}
                                    >
                                        Start Now
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}