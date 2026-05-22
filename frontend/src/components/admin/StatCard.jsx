// src/components/admin/StatCard.jsx
import { Box, Card, CardContent, Typography } from "@mui/material";

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: "100%", boxShadow: 4, borderRadius: 3 }}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h4" fontWeight="bold">{value}</Typography>
        </Box>
        <Box sx={{ bgcolor: color, color: "#fff", p: 1.5, borderRadius: "50%" }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;
