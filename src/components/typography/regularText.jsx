import React from "react";
import { Typography } from "@mui/material";
import { FONT_SIZE } from "../../constant/lookUpConstant";
import { AppColors } from "../../constant/appColors";

const RegularText = ({ children, sx = {}, ...rest }) => {
  return (
    <Typography
      color={rest.color || AppColors.TXT_MAIN}
      sx={{
        fontFamily: "regular",
        fontSize: rest.fontSize || FONT_SIZE.BODY,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Typography>
  );
};

export default RegularText;
