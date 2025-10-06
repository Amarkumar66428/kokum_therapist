import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const ChildDetailCard = ({ childData }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: "linear-gradient(to right, #EBFCFD, #EFF6FF)",
      }}
    >
      <Box sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: "#082878" }}>
            {childData?.name}
          </Typography>
          <Typography variant="body1" sx={{ color: "#082878" }}>
            {childData?.age} / {childData?.gender}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ height: 2, bgcolor: "#000" }} />
      <Box
        sx={{ px: 3, py: 2, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ color: "#082878", fontWeight: 500 }}>
            Caretaker Name
          </Typography>
          <Typography sx={{ color: "#082878" }}>
            {childData?.caretakerName || "N/A"}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ChildDetailCard;
