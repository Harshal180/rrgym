import { Box, Container, Typography } from "@mui/material";

export default function HomePage() {
    return (
        <Box sx={{ backgroundColor: "#0f0f0f", color: "#ffffff" }}>

            {/* ================= BANNER SECTION ================= */}
            <Box sx={{ py: 10 }}>
                <Container maxWidth="xl">

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(12, 1fr)",
                            gridTemplateRows: "repeat(20, 40px)",
                            position: "relative",
                        }}
                    >
                        {/* CENTER TITLE */}
                        <Box
                            sx={{
                                gridColumn: "2 / 12",
                                gridRow: "8 / 14",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 3,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: "5rem",
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    textAlign: "center",
                                    color: "#ffffff",
                                }}
                            >
                                RR <br /> Power And Wellness GYM.
                            </Typography>
                        </Box>

                        {/* LEFT IMAGE */}
                        <Box
                            sx={{
                                gridColumn: "1 / 6",
                                gridRow: "1 / 16",
                                zIndex: 2,
                                display: { xs: "none", lg: "block" },
                                opacity: "30%"
                            }}
                        >
                            <Box
                                component="img"
                                src="../assets/img1.jpeg"
                                alt="Gym Left"
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </Box>

                        {/* RIGHT IMAGE */}
                        <Box
                            sx={{
                                gridColumn: "9 / 13",
                                gridRow: "8 / 21",
                                zIndex: 2,
                                display: { xs: "none", lg: "block" },
                                opacity: "30%"
                            }}
                        >
                            <Box
                                component="img"
                                src="../assets/img2.jpeg"
                                alt="Gym Right"
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </Box>

                    </Box>
                </Container>
            </Box>

            {/* ================= PHILOSOPHY SECTION ================= */}
            <Box sx={{ py: 12, backgroundColor: "#121212" }}>
                <Container maxWidth="lg">

                    <Typography variant="body2" sx={{ mb: 2, color: "#bbbbbb" }}>
                        ⎯ OUR PHILOSOPHY
                    </Typography>

                    <Typography
                        variant="h3"
                        sx={{ mb: 4, fontWeight: 600, color: "#ffffff" }}
                    >
                        Innovative training <br /> meets personal growth
                    </Typography>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(12, 1fr)",
                            gap: 4,
                        }}
                    >
                        <Box sx={{ gridColumn: "3 / 7" }}>
                            <Typography sx={{ color: "#e0e0e0" }}>
                                Fitness Innovation meets community in our family-run gym, where
                                every program blends cutting-edge techniques with supportive
                                usability. Our commitment is to deliver experiences that enhance
                                your fitness journey with motivation and results.
                            </Typography>
                        </Box>

                        <Box sx={{ gridColumn: "8 / 12" }}>
                            <Typography sx={{ color: "#e0e0e0" }}>
                                With a rich heritage in fitness and wellness, we bring together
                                innovative training methods and everyday functionality. Our
                                focus is on creating an environment that supports your fitness
                                goals and overall well-being.
                            </Typography>
                        </Box>
                    </Box>

                </Container>
            </Box>
        </Box>
    );
}
