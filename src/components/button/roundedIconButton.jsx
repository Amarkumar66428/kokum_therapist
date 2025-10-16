import React from "react";
import { IconButton, useTheme } from "@mui/material";

const RoundedIconButton = ({ children, onClick, sx = {}, ...rest }) => {
  const theme = useTheme();

  return (
    <IconButton
      onClick={onClick}
      sx={{
        border: `1px solid ${theme.palette.primary.main}`,
        backgroundColor: theme.palette.secondary.main,
        alignItems: "center",
        justifyContent: "center",
        "&:hover": {
          opacity: 0.8,
          backgroundColor: theme.palette.secondary.main,
        },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </IconButton>
  );
};

export default RoundedIconButton;
