import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    InputAdornment,
    TextField,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import AlertModal from "../../components/ui/AlertModal";
import { BASE_URL } from "../../services/api";
import useAlert from "../../hooks/useAlert";

const MembershipPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const { alert, showAlert, closeAlert } = useAlert();

    const fetchPlans = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/plans`);
            setPlans(res.data);
        } catch (err) {
            console.error(err);
            showAlert("error", "Fetch Failed", "Could not load membership plans.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handlePriceChange = (id, field, value) => {
        setPlans((prev) =>
            prev.map((plan) =>
                plan.id === id ? { ...plan, [field]: value } : plan
            )
        );
    };

    const handleSave = async (plan) => {
        if (!plan.price || isNaN(plan.price) || Number(plan.price) <= 0) {
            showAlert("warning", "Invalid Price", `Please enter a valid price for ${plan.plan_name}.`);
            return;
        }

        if (plan.offer_price !== "" && plan.offer_price !== null) {
            if (isNaN(plan.offer_price) || Number(plan.offer_price) <= 0) {
                showAlert("warning", "Invalid Offer Price", `Offer price for ${plan.plan_name} must be a valid number.`);
                return;
            }
            if (Number(plan.offer_price) >= Number(plan.price)) {
                showAlert("warning", "Invalid Offer Price", `Offer price must be less than the original price (₹${plan.price}).`);
                return;
            }
        }

        setSaving(plan.id);
        try {
            await axios.put(`${BASE_URL}/api/plans/${plan.id}`, {
                price: Number(plan.price),
                offer_price: plan.offer_price !== "" && plan.offer_price !== null
                    ? Number(plan.offer_price)
                    : null,
            });

            showAlert("success", "Plan Updated!", `${plan.plan_name} has been updated successfully.`);
            fetchPlans();
        } catch (err) {
            console.error(err);
            showAlert("error", "Update Failed", `Could not update ${plan.plan_name}. Please try again.`);
        } finally {
            setSaving(null);
        }
    };

    const handleRemoveOffer = async (plan) => {
        setSaving(plan.id);
        try {
            await axios.put(`${BASE_URL}/api/plans/${plan.id}`, {
                price: Number(plan.price),
                offer_price: null,
            });

            showAlert("success", "Offer Removed!", `Offer for ${plan.plan_name} has been removed.`);
            fetchPlans();
        } catch (err) {
            console.error(err);
            showAlert("error", "Failed", "Could not remove offer. Please try again.");
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Box>
                <Typography variant="h5" fontWeight="bold" mb={1}>
                    Membership Plans
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Update prices and set offer prices for each membership plan.
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",            // 1 col on mobile
                            sm: "1fr 1fr",        // 2 cols on tablet
                            md: "1fr 1fr",        // 2 cols on medium (sidebar takes space here)
                            lg: "repeat(4, 1fr)", // 4 cols only on large screens
                        },
                        gap: 2,
                    }}
                >
                    {plans.map((plan) => {
                        const hasOffer = plan.offer_price !== null && plan.offer_price !== "";
                        const discount = hasOffer
                            ? Math.round(((plan.price - plan.offer_price) / plan.price) * 100)
                            : 0;

                        return (
                            <Card
                                key={plan.id}
                                sx={{
                                    border: hasOffer ? "2px solid #22c55e" : "1px solid #e5e7eb",
                                    borderRadius: "16px",
                                    position: "relative",
                                    transition: "box-shadow 0.2s",
                                    width: "100%",
                                    boxSizing: "border-box",
                                    "&:hover": { boxShadow: "0 8px 30px rgba(0,0,0,0.1)" },
                                }}
                            >
                                {/* Offer Badge */}
                                {hasOffer && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 12,
                                            right: 12,
                                            bgcolor: "#22c55e",
                                            color: "white",
                                            fontSize: "11px",
                                            fontWeight: "bold",
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: "20px",
                                        }}
                                    >
                                        {discount}% OFF
                                    </Box>
                                )}

                                <CardContent sx={{ p: 2.5 }}>
                                    {/* Plan Name */}
                                    <Typography variant="h6" fontWeight="bold" mb={0.5}>
                                        {plan.plan_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {plan.duration_months} month{plan.duration_months > 1 ? "s" : ""} membership
                                    </Typography>

                                    <Divider sx={{ my: 1.5 }} />

                                    {/* Price Preview */}
                                    <Box sx={{ mb: 2, minHeight: 48 }}>
                                        {hasOffer ? (
                                            <>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        textDecoration: "line-through",
                                                        color: "text.secondary",
                                                    }}
                                                >
                                                    ₹{Number(plan.price).toLocaleString("en-IN")}
                                                </Typography>
                                                <Typography variant="h5" fontWeight="bold" color="#22c55e">
                                                    ₹{Number(plan.offer_price).toLocaleString("en-IN")}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography variant="h5" fontWeight="bold">
                                                ₹{Number(plan.price).toLocaleString("en-IN")}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Price Input */}
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Original Price"
                                        type="number"
                                        value={plan.price}
                                        onChange={(e) =>
                                            handlePriceChange(plan.id, "price", e.target.value)
                                        }
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">₹</InputAdornment>
                                            ),
                                        }}
                                        sx={{ mb: 1.5 }}
                                    />

                                    {/* Offer Price Input */}
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Offer Price (optional)"
                                        type="number"
                                        value={plan.offer_price ?? ""}
                                        onChange={(e) =>
                                            handlePriceChange(plan.id, "offer_price", e.target.value)
                                        }
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">₹</InputAdornment>
                                            ),
                                        }}
                                        placeholder="Leave empty for no offer"
                                        sx={{ mb: 1.5 }}
                                    />

                                    {/* Save Button */}
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        disabled={saving === plan.id}
                                        onClick={() => handleSave(plan)}
                                        sx={{
                                            bgcolor: "#111827",
                                            "&:hover": { bgcolor: "#374151" },
                                            mb: hasOffer ? 1 : 0,
                                            borderRadius: "8px",
                                        }}
                                    >
                                        {saving === plan.id ? "Saving..." : "Save Changes"}
                                    </Button>

                                    {/* Remove Offer Button */}
                                    {hasOffer && (
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="error"
                                            disabled={saving === plan.id}
                                            onClick={() => handleRemoveOffer(plan)}
                                            sx={{ borderRadius: "8px" }}
                                        >
                                            Remove Offer
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            </Box>

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

export default MembershipPlans;
