import React from "react";
import { TextField } from "@mui/material";
import { FONT_SIZE } from "../../constant/lookUpConstant";

const NormalInput = ({ value, onChange, placeholder, sx = {}, ...rest }) => {
  return (
    <TextField
      fullWidth
      value={value || ""}
      placeholder={placeholder || "Enter text"}
      onChange={onChange}
      sx={{
        fontFamily: "regular",
        fontSize: FONT_SIZE.BODY,
        ...sx,
      }}
      {...rest}
    />
  );
};

export default NormalInput;
