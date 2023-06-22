import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

import firebaseConfig from "./firebaseConfig.json";

import "./styles/index.css";
import App from "./Components/App";

const firebaseApp = initializeApp(firebaseConfig);

const captchaSiteKey = process.env.REACT_APP_CAPTCHA;

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
