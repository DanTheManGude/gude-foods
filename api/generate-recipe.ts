export const config = {
  runtime: "edge",
};

export default async (request: Request) => {
  const host = request.headers.get("host");

  console.log("header host", host);
  console.log("request url", new URL(request.url).host);
  return;

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
      model: "text-davinci-003",
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
