import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router";
import { ThemeProvider } from "@emotion/react";
import theme from "./utils/theme";
import { SnackbarProvider } from "./features/snackBar";
import { Provider } from "react-redux";
import { store } from "./app/store";
import "./App.css";
import "./sass/global.scss";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <SnackbarProvider>
            <AppRouter />
          </SnackbarProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
