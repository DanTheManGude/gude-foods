import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function (request: VercelRequest, response: VercelResponse) {
  const prompt = request.body.prompt;
  const openAIKey = process.env.OPEN_AI_KEY;

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAIKey}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt,
      temperature: 0,
      max_tokens: 1000,
    }),
  };

  fetch("https://api.openai.com/v1/completions", requestOptions)
    .then((r) => r.json())
    .then((resp) => {
      if (resp.choices) {
        const responseText = resp.choices[0].text;
        response.status(200).send(responseText);
        return;
      }
      if (resp.error) {
        throw resp.error.message;
      }
      throw resp;
    })
    .catch((error) => {
      response.status(500).send(error.toString());
    });
}
