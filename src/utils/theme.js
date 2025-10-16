import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#000",
      hlt_main: "#4361EE",
      hlt_none: "#626262",
      hlt_light: "#E5F0FF",
      success: "#0b726e",
      icon: "#4895EF",
      label: "#007AFF",
      bg_head: "#AAD3FF",
    },
    secondary: {
      main: "#fff",
      error: "#E17189",
      light_error: "#FFECF0",
    },
    background: {
      default: "#F5F5F5",
    },
    text: {
      primary: "#000",
      secondary: "#767676",
      white: "#fff",
    },
  },
});

export default theme;
