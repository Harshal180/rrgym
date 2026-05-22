import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    InputAdornment,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";

import { useEffect, useState } from "react";
import AlertModal from "../../components/ui/AlertModal";

import useAlert from "../../hooks/useAlert";
import api from "../../services/api";

// ─── Reusable plan card grid ──────────────────────────────────────────────────
function PlanCardGrid({ plans, onPriceChange, onSave, onRemoveOffer, saving }) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    lg: "repeat(4, 1fr)",
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
                            "&:hover": { boxShadow: "0 8px 30px rgba(0,0,0,0.1)" },
                        }}
                    >
                        {hasOffer && (
                            <Box
                                sx={{
                                    position: "absolute", top: 12, right: 12,
                                    bgcolor: "#22c55e", color: "white",
                                    fontSize: "11px", fontWeight: "bold",
                                    px: 1.5, py: 0.5, borderRadius: "20px",
                                }}
                            >
                                {discount}% OFF
                            </Box>
                        )}

                        <CardContent sx={{ p: 2.5 }}>
                            <Typography variant="h6" fontWeight="bold" mb={0.5}>
                                {plan.plan_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {plan.duration_months} month{plan.duration_months > 1 ? "s" : ""} plan
                            </Typography>

                            <Divider sx={{ my: 1.5 }} />

                            <Box sx={{ mb: 2, minHeight: 48 }}>
                                {hasOffer ? (
                                    <>
                                        <Typography
                                            variant="body2"
                                            sx={{ textDecoration: "line-through", color: "text.secondary" }}
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

                            <TextField
                                fullWidth size="small" label="Original Price" type="number"
                                value={plan.price}
                                onChange={(e) => onPriceChange(plan.id, "price", e.target.value)}
                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                sx={{ mb: 1.5 }}
                            />

                            <TextField
                                fullWidth size="small" label="Offer Price (optional)" type="number"
                                value={plan.offer_price ?? ""}
                                onChange={(e) => onPriceChange(plan.id, "offer_price", e.target.value)}
                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                placeholder="Leave empty for no offer"
                                sx={{ mb: 1.5 }}
                            />

                            <Button
                                fullWidth variant="contained"
                                disabled={saving === plan.id}
                                onClick={() => onSave(plan)}
                                sx={{
                                    bgcolor: "#111827", "&:hover": { bgcolor: "#374151" },
                                    mb: hasOffer ? 1 : 0, borderRadius: "8px",
                                }}
                            >
                                {saving === plan.id ? "Saving..." : "Save Changes"}
                            </Button>

                            {hasOffer && (
                                <Button
                                    fullWidth variant="outlined" color="error"
                                    disabled={saving === plan.id}
                                    onClick={() => onRemoveOffer(plan)}
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
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
const MembershipPlans = () => {
    const [tab, setTab] = useState(0);

    const [membershipPlans, setMembershipPlans] = useState([]);
    const [ptPlans, setPTPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const { alert, showAlert, closeAlert } = useAlert();

    const fetchAll = async () => {
        try {
            const [mRes, ptRes] = await Promise.all([
                api.get(`/api/plans`),
                api.get(`/api/personal-training-plans`),
            ]);
            setMembershipPlans(mRes.data);
            setPTPlans(ptRes.data);
        } catch (err) {
            console.error(err);
            showAlert("error", "Fetch Failed", "Could not load plans.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handlePriceChange = (setter) => (id, field, value) => {
        setter((prev) =>
            prev.map((plan) => plan.id === id ? { ...plan, [field]: value } : plan)
        );
    };

    const handleSave = (apiPath, refetch) => async (plan) => {
        if (!plan.price || isNaN(plan.price) || Number(plan.price) <= 0) {
            showAlert("warning", "Invalid Price", `Please enter a valid price for ${plan.plan_name}.`);
            return;
        }
        if (plan.offer_price !== "" && plan.offer_price !== null) {
            if (isNaN(plan.offer_price) || Number(plan.offer_price) <= 0) {
                showAlert("warning", "Invalid Offer Price", `Offer price must be a valid number.`);
                return;
            }
            if (Number(plan.offer_price) >= Number(plan.price)) {
                showAlert("warning", "Invalid Offer Price", `Offer price must be less than ₹${plan.price}.`);
                return;
            }
        }
        setSaving(plan.id);
        try {
            await api.put(`${apiPath}/${plan.id}`, {
                price: Number(plan.price),
                offer_price: plan.offer_price !== "" && plan.offer_price !== null ? Number(plan.offer_price) : null,
            });
            showAlert("success", "Plan Updated!", `${plan.plan_name} updated successfully.`);
            refetch();
        } catch (err) {
            showAlert("error", "Update Failed", `Could not update ${plan.plan_name}.`);
        } finally {
            setSaving(null);
        }
    };

    const handleRemoveOffer = (apiPath, refetch) => async (plan) => {
        setSaving(plan.id);
        try {
            await api.put(`${apiPath}/${plan.id}`, { price: Number(plan.price), offer_price: null });
            showAlert("success", "Offer Removed!", `Offer for ${plan.plan_name} removed.`);
            refetch();
        } catch (err) {
            showAlert("error", "Failed", "Could not remove offer.");
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
                    Membership & Personal Training Plans
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Update prices and set offer prices for each plan.
                </Typography>

                {/* Tabs */}
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{ mb: 3, borderBottom: "1px solid #e5e7eb" }}
                >
                    <Tab label="🏋️ Gym Membership" />
                    <Tab label="🎯 Personal Training" />
                </Tabs>

                {tab === 0 && (
                    <PlanCardGrid
                        plans={membershipPlans}
                        onPriceChange={handlePriceChange(setMembershipPlans)}
                        onSave={handleSave("/api/plans", fetchAll)}
                        onRemoveOffer={handleRemoveOffer("/api/plans", fetchAll)}
                        saving={saving}
                    />
                )}

                {tab === 1 && (
                    <>
                        <Box mb={3} p={2} bgcolor="#f0fdf4" borderRadius="12px" border="1px solid #bbf7d0">
                            <Typography variant="body2" color="#166534" fontWeight={600}>
                                💪 Personal Training Plans — Prices shown: 1 Month ₹5,000 | 3 Months ₹7,000 | 6 Months ₹10,000 | 1 Year ₹15,000
                            </Typography>
                        </Box>
                        <PlanCardGrid
                            plans={ptPlans}
                            onPriceChange={handlePriceChange(setPTPlans)}
                            onSave={handleSave("/api/personal-training-plans", fetchAll)}
                            onRemoveOffer={handleRemoveOffer("/api/personal-training-plans", fetchAll)}
                            saving={saving}
                        />
                    </>
                )}
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
