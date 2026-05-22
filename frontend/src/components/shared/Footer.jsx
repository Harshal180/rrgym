import {
    Box,
    Container,
    Divider,
    Grid,
    IconButton,
    Link,
    Typography
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import InstagramIcon from "@mui/icons-material/Instagram";
import GYM_CONFIG from "../../config/gymConfig";

const Footer = () => {
    return (
        <Box sx={{ backgroundColor: "#f2f2f2", mt: 5 }}>
            <Container maxWidth="lg">
                <Grid container spacing={4} py={5}>

                    {/* Helpful Links */}
                    <Grid item xs={12} lg={3}>
                        <Typography variant="h6" gutterBottom>
                            Helpful Links
                        </Typography>
                        <Link href="/" display="block">Home</Link>
                        <Link href="/aboutus" display="block">About Us</Link>
                        <Link href="/pricing" display="block">
                            PricingPlans
                        </Link>
                        <Link href="/services" display="block">Services</Link>
                        <Link href="/gallery" display="block">Gallery</Link>
                        <Link href="/contact" display="block">
                            Contact us
                        </Link>
                    </Grid>

                    {/* About Us */}
                    <Grid item xs={12} lg={5}>
                        <Typography variant="h6" gutterBottom>
                            About Us
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            We are a team of passionate fitness enthusiasts whose goal is Too <br />
                            enhance everyone&apos;s health and well-being through innovative
                            fitness solutions.
                            <br /><br />
                            Our programs are designed for individuals and groups looking to
                            achieve their fitness goals.
                        </Typography>
                    </Grid>

                    {/* Follow Us */}
                    <Grid item xs={12} lg={4}>
                        <Typography variant="h6" gutterBottom>
                            Follow Us
                        </Typography>

                        <Typography variant="body2">📧 gangurderoshan8208@gmail.com</Typography>
                        <Typography variant="body2">📞 +91 8208728607</Typography>
                        <Typography variant="body2">📍 Kashidara Road,Near Mahadev Temple</Typography>
                        <Typography variant="body2">    Sakri, Maharashtra 424304</Typography>

                        <Box mt={2}>
                            <IconButton color="primary" href="https://www.instagram.com/_roshan_gangurde_?igsh=MTFvaDZjcGQ3NjZleA%3D%3D&utm_source=qr"><InstagramIcon /></IconButton>
                            <IconButton color="primary" href="/"><HomeIcon /></IconButton>
                        </Box>
                    </Grid>

                </Grid>
            </Container>

            <Divider />

            <Box sx={{ backgroundColor: "#c5c2c2", py: 2 }}>
                <Typography align="center" variant="body2" color="text.secondary">
                    © {new Date().getFullYear()} {GYM_CONFIG.name}
                </Typography>
            </Box>
        </Box>
    );
};

export default Footer;
