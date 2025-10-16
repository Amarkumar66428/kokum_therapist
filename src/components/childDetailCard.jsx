import React from "react";
import { Box, Card } from "@mui/material";
import SemiBoldText from "./typography/semiBoldText";
import { BORDER_RADIUS, ELEVATION } from "../constant/lookUpConstant";

const ChildDetailCard = ({ childData }) => {
  return (
    <Card
      elevation={ELEVATION.LOW}
      sx={{
        borderRadius: BORDER_RADIUS.SM,
        overflow: "hidden",
        background: "secondary.main",
      }}
    >
      <Box sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <SemiBoldText>{childData?.name}</SemiBoldText>
          <SemiBoldText>
            {childData?.age || "--"} / {childData?.gender || "--"}
          </SemiBoldText>
        </Box>
      </Box>
      <Box sx={{ height: 2, bgcolor: "#000" }} />
      <Box
        sx={{ px: 3, py: 2, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <SemiBoldText>Caretaker Name</SemiBoldText>
          <SemiBoldText>{childData?.caretakerName || "N/A"}</SemiBoldText>
        </Box>
      </Box>
    </Card>
  );
};

export default ChildDetailCard;
