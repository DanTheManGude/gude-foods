import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { initializeApp } from "firebase/app";
import firebaseConfig from "./firebaseConfig.json";

import "./styles/index.css";
import { captchaSiteKey } from "./constants";
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
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
