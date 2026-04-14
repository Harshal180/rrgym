import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Grid,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import { useState } from "react";

export default function CalculateBMI() {
    const [heightUnit, setHeightUnit] = useState("cm"); // cm | ft
    const [weightUnit, setWeightUnit] = useState("kg"); // kg | lbs

    const [heightCm, setHeightCm] = useState("");
    const [heightFt, setHeightFt] = useState("");
    const [heightIn, setHeightIn] = useState("");

    const [weight, setWeight] = useState("");
    const [bmi, setBmi] = useState(null);
    const [category, setCategory] = useState("");

    const calculateBMI = () => {
        let heightInMeters = 0;
        let weightInKg = 0;

        // HEIGHT conversion
        if (heightUnit === "cm") {
            if (!heightCm) return;
            heightInMeters = heightCm / 100;
        } else {
            if (!heightFt) return;
            const totalInches =
                parseFloat(heightFt || 0) * 12 + parseFloat(heightIn || 0);
            heightInMeters = totalInches * 0.0254;
        }

        // WEIGHT conversion
        if (!weight) return;
        weightInKg =
            weightUnit === "kg" ? weight : weight * 0.453592;

        const bmiValue = (weightInKg / (heightInMeters ** 2)).toFixed(1);
        setBmi(bmiValue);

        if (bmiValue < 18.5) setCategory("Underweight");
        else if (bmiValue < 24.9) setCategory("Normal weight");
        else if (bmiValue < 29.9) setCategory("Overweight");
        else setCategory("Obese");
    };

    return (
        <>
            <Box sx={{ px: { xs: 2, md: 6 }, py: 5 }}>
                <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
                    BMI Calculator
                </Typography>

                <Grid container justifyContent="center">
                    <Grid item xs={12} md={6}>
                        <Card sx={{ p: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Enter Your Details
                                </Typography>

                                <Divider sx={{ mb: 3 }} />

                                <Grid container spacing={3}>
                                    {/* Height Unit */}
                                    <Grid item xs={12}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Height Unit"
                                            value={heightUnit}
                                            onChange={(e) => setHeightUnit(e.target.value)}
                                        >
                                            <MenuItem value="cm">Centimeters (cm)</MenuItem>
                                            <MenuItem value="ft">Feet / Inches</MenuItem>
                                        </TextField>
                                    </Grid>

                                    {/* Height Inputs */}
                                    {heightUnit === "cm" ? (
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Height (cm)"
                                                type="number"
                                                value={heightCm}
                                                onChange={(e) => setHeightCm(e.target.value)}
                                            />
                                        </Grid>
                                    ) : (
                                        <>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Feet"
                                                    type="number"
                                                    value={heightFt}
                                                    onChange={(e) => setHeightFt(e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Inches"
                                                    type="number"
                                                    value={heightIn}
                                                    onChange={(e) => setHeightIn(e.target.value)}
                                                />
                                            </Grid>
                                        </>
                                    )}

                                    {/* Weight Unit */}
                                    <Grid item xs={12}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Weight Unit"
                                            value={weightUnit}
                                            onChange={(e) => setWeightUnit(e.target.value)}
                                        >
                                            <MenuItem value="kg">Kilograms (kg)</MenuItem>
                                            <MenuItem value="lbs">Pounds (lbs)</MenuItem>
                                        </TextField>
                                    </Grid>

                                    {/* Weight Input */}
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={`Weight (${weightUnit})`}
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                        />
                                    </Grid>

                                    {/* Button */}
                                    <Grid item xs={12}>
                                        <Button
                                            fullWidth
                                            size="large"
                                            variant="contained"
                                            sx={{
                                                bgcolor: "#000",
                                                "&:hover": { bgcolor: "#222" }
                                            }}
                                            onClick={calculateBMI}
                                        >
                                            Calculate BMI
                                        </Button>
                                    </Grid>
                                </Grid>

                                {/* Result */}
                                {bmi && (
                                    <>
                                        <Divider sx={{ my: 3 }} />
                                        <Box textAlign="center">
                                            <Typography variant="h5" fontWeight="bold">
                                                Your BMI: {bmi}
                                            </Typography>
                                            <Typography variant="h6" color="text.secondary">
                                                Category: {category}
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>


        </>
    );
}
