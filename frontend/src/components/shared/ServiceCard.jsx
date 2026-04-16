import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

export default function ServiceCard({
    image, heading, description
}) {
    return (

        <Card sx={{
            width: 450,
            height: 400,
            transition: "transform 0.3s,box-shadow 0.3s",
            marginInline: 3,
            "&:hover": {
                boxShadow: 6,
                transform: "translateY(-5px)",
            },
        }}>
            <CardMedia
                sx={{ height: 170 }}
                image={image}
                title="green iguana"
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {heading}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {description}
                </Typography>
            </CardContent>
        </Card>
    );
}
