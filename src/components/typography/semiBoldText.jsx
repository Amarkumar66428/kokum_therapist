import React from "react";
import { Typography } from "@mui/material";
import { FONT_SIZE } from "../../constant/lookUpConstant";
import { AppColors } from "../../constant/appColors";

const SemiBoldText = ({ children, sx = {}, ...rest }) => {
  return (
    <Typography
      color={rest.color || AppColors.TXT_MAIN}
      sx={{
        fontFamily: "semibold",
        fontSize: rest.fontSize || FONT_SIZE.TITLE,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Typography>
  );
};

export default SemiBoldText;
