import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

import "./styles/index.css";
import App from "./Components/App";

const firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE);
const firebaseApp = initializeApp(firebaseConfig);

const captchaSiteKey = process.env.REACT_APP_CAPTCHA;
initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider(captchaSiteKey),
  isTokenAutoRefreshEnabled: true,
});

let cacheSubscriber = () => {};
const setSubscriber = (newSubscriber) => {
  cacheSubscriber = newSubscriber;
};

const notifySubscriber = () => {
  cacheSubscriber();
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App setSubscriber={setSubscriber} />
    </BrowserRouter>
  </React.StrictMode>
);

// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({ onUpdate: notifySubscriber });
