import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";

import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig.js";

import "./styles/index.css";
import { captchaSiteKey } from "./constants";
import { constructTheme } from "./utils";
import App from "./Components/App";

const {
  initializeAppCheck,
  ReCaptchaV3Provider,
} = require("firebase/app-check");

const firebaseApp = initializeApp(firebaseConfig);
initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider(captchaSiteKey),
  isTokenAutoRefreshEnabled: true,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={constructTheme()}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
