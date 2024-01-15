export const config = {
  runtime: "edge",
};

async function verifyUser(uid, accessToken, appCheckToken) {
  const url = `https://gude-foods.firebaseio.com/users/${uid}.json?auth=${accessToken}`;

  try {
    const response = await fetch(url, {
      headers: { "X-Firebase-AppCheck": appCheckToken },
    });

    if (!response.ok) {
      throw Error();
    }

    const value = await response.json();

    return value !== undefined;
  } catch (error) {
    return false;
  }
}

async function sendNotification(fcmToken, displayName) {
  try {
    const messageResult = await messaging.send({
      token: fcmToken,
      notification: {
        body: `${displayName} requested access.`,
        title: "New user!",
      },
    });

    console.log("messaging send result", messageResult);
    return new Response("No content", { status: 204 });
  } catch (error) {
    console.log("messaging send error", error);
    return new Response(undefined, { status: 500 });
  }
}

export default async (request) => {
  const appCheckToken = request.headers.get("X-Firebase-AppCheck") || "";

  const authorization = request.headers.get("Authorization") || "";
  const [uid, accessToken] = atob(authorization).split(":");

  const isValidUid = await verifyUser(uid, accessToken, appCheckToken);
  if (!isValidUid) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { fcmToken, displayName } = await request.json();

  return await sendNotification(fcmToken, displayName);
};
