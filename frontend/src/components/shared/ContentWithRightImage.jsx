import { Box, Container, Grid, Typography } from "@mui/material";

export default function ContentWithRightImage({
    heading,
    description,
    imageSrc,
    imageAlt = "Image",
    reverse = false
}) {
    return (
        <Box
            sx={{
                py: { xs: 6, md: 8 },
                backgroundColor: "#ffffff",
            }}
        >
            <Container maxWidth="lg">
                <Grid
                    container
                    spacing={4}
                    alignItems="center"
                    wrap="nowrap"
                    direction={reverse ? "row-reverse" : "row"}
                >
                    {/* LEFT TEXT */}
                    <Grid
                        item
                        sx={{ flex: "0 0 50%" }}
                    >
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            gutterBottom
                        >
                            {heading}
                        </Typography>

                        {/* 🔥 FIXED HERE */}
                        <Box
                            sx={{
                                color: "text.secondary",
                                fontSize: "1rem",
                            }}
                        >
                            {description}
                        </Box>
                    </Grid>

                    {/* RIGHT IMAGE */}
                    <Grid
                        item
                        sx={{
                            flex: "0 0 50%",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Box
                            component="img"
                            src={imageSrc}
                            alt={imageAlt}
                            sx={{
                                width: "450px",
                                maxWidth: 700,
                                borderRadius: 2,
                            }}
                        />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
