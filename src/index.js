import React from "react";
import ReactDOM from "react-dom/client";

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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
