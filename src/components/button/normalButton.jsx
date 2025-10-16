import React from "react";
import { Button } from "@mui/material";
import { FONT_SIZE } from "../../constant/lookUpConstant";

const NormalButton = ({ children, variant, onClick, sx = {}, ...rest }) => {
  return (
    <Button
      variant={variant || "outlined"}
      onClick={onClick}
      sx={{
        fontFamily: "regular",
        fontSize: sx.fontSize || FONT_SIZE.BODY,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default NormalButton;
