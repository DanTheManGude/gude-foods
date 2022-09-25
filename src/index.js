import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { ThemeProvider, createTheme } from "@mui/material/styles";

import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig.js";

import "./styles/index.css";
import App from "./Components/App";

const {
  initializeAppCheck,
  ReCaptchaV3Provider,
} = require("firebase/app-check");
const firebaseApp = initializeApp(firebaseConfig);
initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider("6LckpNMfAAAAAAQU4bt6WgEnUgFBHTzhDzQNPAmK"),
  isTokenAutoRefreshEnabled: true,
});

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ffad76" },
    secondary: { main: "#AF7ADB", contrastText: "#1e201e" },
    tertiary: { main: "#79B2A8", contrastText: "#000" },
    alt: { main: "#D6D365" },
  },
  typography: {
    fontFamily: [
      "Dosis",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      "Fira Sans",
      "Droid Sans",
      "Helvetica Neue",
      "sans-serif",
    ].join(","),
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
