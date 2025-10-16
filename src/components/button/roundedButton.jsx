import React from "react";
import { Button } from "@mui/material";
import { FONT_SIZE } from "../../constant/lookUpConstant";

const RoundedButton = ({ 
  children, 
  onClick, 
  sx = {}, 
  ...rest 
}) => {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      sx={{
        width: sx.width || "100%",
        height: sx.height || 48,
        color: sx.color || "common.white",
        bgcolor: sx.bgcolor || "primary.label",
        borderRadius: sx.borderRadius || 10,
        fontSize: sx.fontSize || FONT_SIZE.BODY,
        textAlign: sx.textAlign || "center",
        textTransform: "none",
        boxShadow: sx.boxShadow || "none",
        ...sx, // allow override at the end
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default RoundedButton;
