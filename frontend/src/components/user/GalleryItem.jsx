import AddIcon from "@mui/icons-material/Add";
export default function GalleryItem({ src, sx }) {
    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 3,
                cursor: "pointer",
                ...sx,
            }}
        >
            {/* IMAGE */}
            <Box
                component="img"
                src={src}
                alt="gallery"
                sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                }}
            />

            {/* OVERLAY */}
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.25)",
                    opacity: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "opacity 0.4s ease",
                    "& svg": {
                        backgroundColor: "#fff",
                        color: "#000",
                        borderRadius: "50%",
                        padding: "12px",
                        fontSize: 40,
                    },
                    "&:hover": {
                        opacity: 1,
                    },
                    "&:hover img": {
                        transform: "scale(1.1)",
                    },
                }}
            >
                <AddIcon />
            </Box>
        </Box>
    );
}