import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

import "./styles/index.css";

import { Noop } from "./types";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import App from "./Components/App";

const firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE || "");
const firebaseApp = initializeApp(firebaseConfig);

const captchaSiteKey = process.env.REACT_APP_CAPTCHA || "";
initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider(captchaSiteKey),
  isTokenAutoRefreshEnabled: true,
});

let cacheSubscriber: Noop = () => {};
const setSubscriber = (newSubscriber: Noop) => {
  cacheSubscriber = newSubscriber;
};

const notifySubscriber: Noop = () => {
  cacheSubscriber();
};

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App setSubscriber={setSubscriber} />
      </BrowserRouter>
    </React.StrictMode>
  );
}

// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({ onUpdate: notifySubscriber });
