import admin from "firebase-admin";

async function calculateBadgeCount() {
  let badgeCount = "1";

  await admin
    .database()
    .ref(`requestedUsers`)
    .once("value", (data) => {
      if (data.exists()) {
        badgeCount = Object.keys(data.val()).length.toString();
      }
    });

  return badgeCount;
}

export default async function (request, response) {
  const { notification } = JSON.parse(request.body);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN)),
      databaseURL: "https://gude-foods.firebaseio.com",
    });
  }

  const badgeCount = await calculateBadgeCount();

  let fcmToken;

  await admin
    .database()
    .ref(`fcmToken`)
    .once("value", (data) => {
      if (data.exists()) {
        fcmToken = data.val();
      }
    });

  if (!fcmToken) {
    console.log("No fcmToken");
    response.status(500).send();
    return;
  }

  try {
    const messageResult = await admin.messaging().send({
      token: fcmToken,
      notification,
      data: { badgeCount },
    });

    console.log("messaging send result", messageResult);
    response.status(204).send();
  } catch (error) {
    console.log("messaging send error", error);
    response.status(500).send();
  }
}
