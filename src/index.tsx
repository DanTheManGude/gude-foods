import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

import { Analytics } from "@vercel/analytics/react";

import "./styles/index.css";

import { SetSubsriber } from "./types";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import App from "./Components/App";

const firebaseApp = initializeApp({
  apiKey: "AIzaSyAPVomtOQIEG2Gb0YuaSu6gcnv7fK3sPFU",
  authDomain: "gude-foods.firebaseapp.com",
  databaseURL: "https://gude-foods.firebaseio.com",
  projectId: "gude-foods",
  storageBucket: "gude-foods.appspot.com",
  messagingSenderId: "274231175123",
  appId: "1:274231175123:web:229727ace473d98c24b126",
});

const captchaSiteKey = process.env.REACT_APP_CAPTCHA || "";
initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider(captchaSiteKey),
  isTokenAutoRefreshEnabled: true,
});

let cacheSubscriber: () => void = () => {};
const setSubscriber: SetSubsriber = (newSubscriber) => {
  cacheSubscriber = newSubscriber;
};

const notifySubscriber: () => void = () => {
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
      <Analytics />
    </React.StrictMode>
  );
}

// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({ onUpdate: notifySubscriber });
