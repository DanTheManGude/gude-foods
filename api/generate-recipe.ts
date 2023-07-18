import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function (request: VercelRequest, response: VercelResponse) {
  const prompt = request.body.prompt;
  console.log(prompt);

  const openAIKey = process.env.OPEN_AI_KEY;
  console.log(openAIKey);

  // const requestOptions = {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${openAIKey}`,
  //   },
  //   body: JSON.stringify({
  //     model: "text-davinci-003",
  //     prompt,
  //     temperature: 0,
  //     max_tokens: 500,
  //   }),
  // };

  // fetch("https://api.openai.com/v1/completions", requestOptions)
  //   .then((resp) => resp.json())
  //   .then((response) => {
  //     if (response.choices) {
  //       const responseText = response.choices[0].text;
  //       return;
  //     }
  //     if (response.error) {
  //       throw response.error.message;
  //     }
  //     throw response;
  //   })
  //   .catch((error) => {
  //     console.warn(error);
  //   });

  response.send(request.body.prompt);
}
