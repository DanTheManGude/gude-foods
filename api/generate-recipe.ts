import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: request.body.prompt,
      temperature: 0,
      max_tokens: 1000,
    });

    const responseText = completion.data.choices[0].text;
    response.status(200).send(responseText);
    return;
  } catch (error) {
    response.status(500).send(error.toString());
  }
}
