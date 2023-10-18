export const config = {
  runtime: "edge",
};

async function verifyUser(
  uid: string,
  accessToken: string,
  appCheckToken: string
) {
  const url = `https://gude-foods.firebaseio.com/users/${uid}.json?auth=${accessToken}`;

  try {
    const response = await fetch(url, {
      headers: { "X-Firebase-AppCheck": appCheckToken },
    });

    if (!response.ok) {
      throw Error();
    }

    const value = await response.json();

    return value;
  } catch (error) {
    return false;
  }
}

async function sendPrompt(searchParams: URLSearchParams) {
  const openAIKey = process.env.OPENAI_KEY;

  const { promptText, length: maxTokens = "600" } = Object.fromEntries(
    searchParams.entries()
  );

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAIKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo-instruct",
      prompt: promptText,
      temperature: 0,
      max_tokens: Number(maxTokens),
    }),
  };

  try {
    const resp = await fetch(
      "https://api.openai.com/v1/completions",
      requestOptions
    ).then((r) => r.json());

    if (resp.choices) {
      const responseText: string = resp.choices[0].text;
      return new Response(responseText, { status: 200 });
    }
    if (resp.error) {
      throw resp.error.message;
    }
    throw resp;
  } catch (error) {
    return new Response(error.toString(), { status: 500 });
  }
}

export default async (request: Request) => {
  const appCheckToken = request.headers.get("X-Firebase-AppCheck") || "";

  const authorization = request.headers.get("Authorization") || "";
  const [uid, accessToken] = atob(authorization).split(":");

  const isValidUid = await verifyUser(uid, accessToken, appCheckToken);
  if (!isValidUid) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  return await sendPrompt(searchParams);
};
