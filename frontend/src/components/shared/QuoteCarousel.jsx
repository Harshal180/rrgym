import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import {
    Avatar,
    Box,
    IconButton,
    Stack,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";

const quotes = [
    {
        quote: "Our gym is modern and equipped with the latest fitness technology!",
        author: "Roshan",
        avatar: "/assets/roshan1.jpeg",
    },
    {
        quote: "The gym is both inspiring and super welcoming!",
        author: "Deepak",
        avatar: "/assets/raj1.jpeg",
    },
];

export default function QuoteCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);


    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) =>
                prev === quotes.length - 1 ? 0 : prev + 1
            );
        }, 7000);
        return () => clearInterval(timer); // cleanup on unmount
    }, []);

    const handlePrev = () => {
        setActiveIndex((prev) =>
            prev === 0 ? quotes.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setActiveIndex((prev) =>
            prev === quotes.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <Box
            sx={{
                position: "relative",
                py: 10,
                px: 2,
                backgroundColor: "#ffffff",
                textAlign: "center",
                overflow: "hidden",
            }}
        >
            {/* Slide */}
            <Box
                key={activeIndex}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    width: "100%",
                    px: { xs: 6, md: 10 },
                    animation: "fadeIn 0.5s ease-in-out",
                    "@keyframes fadeIn": {
                        from: { opacity: 0, transform: "translateY(10px)" },
                        to: { opacity: 1, transform: "translateY(0)" },
                    },
                }}
            >
                {/* Quote icon */}
                <Box
                    sx={{
                        width: 50,
                        height: 60,
                        backgroundColor: "#000000",
                        borderRadius: "20%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                    }}
                >
                    <FormatQuoteIcon sx={{ fontSize: 40 }} />
                </Box>

                {/* Quote text */}
                <Typography variant="h6" sx={{ maxWidth: 600, mx: "auto" }}>
                    "{quotes[activeIndex].quote}"
                </Typography>

                {/* Author */}
                <Stack direction="column" spacing={1} alignItems="center">
                    <Avatar
                        src={quotes[activeIndex].avatar}
                        alt={quotes[activeIndex].author}
                        sx={{ width: 80, height: 80 }}
                    />
                    <Typography variant="body1">
                        <strong>{quotes[activeIndex].author}</strong>
                    </Typography>
                </Stack>
            </Box>

            {/* Dot indicators */}
            <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                sx={{ mt: 4 }}
            >
                {quotes.map((_, i) => (
                    <Box
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        sx={{
                            width: i === activeIndex ? 24 : 10,
                            height: 10,
                            borderRadius: "5px",
                            backgroundColor: i === activeIndex ? "#000" : "#ccc",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                        }}
                    />
                ))}
            </Stack>

            {/* Left Arrow */}
            <IconButton
                onClick={handlePrev}
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: 16,
                    transform: "translateY(-50%)",
                    color: "#000000",
                }}
            >
                <ArrowBackIosIcon />
            </IconButton>

            {/* Right Arrow */}
            <IconButton
                onClick={handleNext}
                sx={{
                    position: "absolute",
                    top: "50%",
                    right: 16,
                    transform: "translateY(-50%)",
                    color: "#000000",
                }}
            >
                <ArrowForwardIosIcon />
            </IconButton>
        </Box>
    );
}