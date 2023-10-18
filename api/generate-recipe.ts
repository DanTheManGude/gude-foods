export const config = {
  runtime: "edge",
};

async function verifyUid(uid: string | null, appCheckToken: string) {
  const url = `https://gude-foods.firebaseio.com/users/${uid}.json`;

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

export default async (request: Request) => {
  const uid = request.headers.get("Authorization");
  const appCheckToken = request.headers.get("X-Firebase-AppCheck") || "";

  const isValidUid = await verifyUid(uid, appCheckToken);
  console.log("isValidUid", isValidUid);
  if (!isValidUid) {
    return new Response("Unauthorized", { status: 401 });
  }

  const openAIKey = process.env.OPENAI_KEY;

  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);

  const { promptText, length: maxTokens = "600" } = Object.fromEntries(
    search.entries()
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
};
