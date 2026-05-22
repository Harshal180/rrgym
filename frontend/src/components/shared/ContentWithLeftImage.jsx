import { Box, Container, Grid, Typography } from "@mui/material";

export default function ContentWithLeftImage({
    heading,
    description,
    imageSrc,
    imageAlt = "Image",
    reverse = false,
}) {
    return (
        <Box
            sx={{
                py: 6,
                backgroundColor: "#fff",
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
                    {/* IMAGE */}
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
                                width: "650px",
                                maxWidth: 700,
                                borderRadius: 2,
                            }}
                        />
                    </Grid>

                    {/* CONTENT */}
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

                        {/* 🔥 FIX HERE */}
                        <Box
                            sx={{
                                color: "text.secondary",
                                fontSize: "1rem",
                            }}
                        >
                            {description}
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
