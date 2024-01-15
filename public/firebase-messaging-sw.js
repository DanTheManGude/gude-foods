importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAPVomtOQIEG2Gb0YuaSu6gcnv7fK3sPFU",
  authDomain: "gude-foods.firebaseapp.com",
  databaseURL: "https://gude-foods.firebaseio.com",
  projectId: "gude-foods",
  storageBucket: "gude-foods.appspot.com",
  messagingSenderId: "274231175123",
  appId: "1:274231175123:web:229727ace473d98c24b126",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  navigator.setAppBadge(payload.data.badgeCount);
});
