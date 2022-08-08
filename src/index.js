import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { ThemeProvider, createTheme } from "@mui/material/styles";

import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig.js";

import "./index.css";
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
