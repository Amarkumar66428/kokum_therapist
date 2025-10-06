// theme.js or theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#042f8a",
      success: "#0b726e",
    },
    secondary: {
      main: "#ff5a82",
      sub: "#5b0219",
    },
    background: {
      default: "#f4f6f8",
    },
    text: {
      primary: "#000",
    },
    grey: {
      50: "#f9f9f9",
      100: "#f4f4f4",
      200: "#e9e9e9",
      300: "#e0e0e0",
      400: "#c4c4c4",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
    error: {
      main: "#d32f2f",
      50: "#ffebee",
      100: "#ffcdd2",
      200: "#ef9a9a",
      300: "#e57373",
      400: "#ef5350",
      500: "#f44336",
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

export default theme;
