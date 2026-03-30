import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import theme from "./theme";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          a: { color: "inherit", textDecoration: "none" },
          "*": { boxSizing: "border-box" },
        }}
      />
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
