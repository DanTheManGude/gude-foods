import admin from "firebase-admin";

async function sendNotification(fcmToken, displayName) {
  const serviceAccount = process.env.FIREBASE_ADMIN || "{}";

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
      databaseURL: "https://gude-foods.firebaseio.com",
    });
  }

  try {
    const messageResult = await admin.messaging.send({
      token: fcmToken,
      notification: {
        body: `${displayName} requested access.`,
        title: "New user!",
      },
    });

    console.log("messaging send result", messageResult);
    return true;
  } catch (error) {
    console.log("messaging send error", error);
    return false;
  }
}

export default async function (request, response) {
  const { fcmToken, displayName } = await request.body;

  const success = await sendNotification(fcmToken, displayName);

  if (success) {
    response.status(204).send();
  } else {
    response.status(500).send();
  }
}
