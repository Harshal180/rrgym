import { Container, Typography } from "@mui/material";
export default function HeadingSubheading({ heading, subHeading = "" }) {
    return (<Container style={{ padding: "2%" }}>
        {/* Heading */}
        < Typography variant="h4" align="center" gutterBottom >
            <strong>{heading}</strong>
        </Typography >

        {/* Optional Subheading */}
        {
            subHeading && (
                <Typography variant="h6" align="center" gutterBottom>
                    {subHeading}
                </Typography>
            )
        }
    </Container>
    );
}