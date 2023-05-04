import emailjs from "@emailjs/browser";

import { emailConfig } from "../constants";

export const generateRecipe = (openAIKey, prompt, onSuccess, onFailure) => {
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
      max_tokens: 500,
    }),
  };
  fetch("https://api.openai.com/v1/completions", requestOptions)
    .then((resp) => resp.json())
    .then((response) => {
      if (response.choices) {
        onSuccess(response.choices[0].text, response);
        return;
      }
      if (response.error) {
        throw response.error.message;
      }
      throw response;
    })
    .catch(onFailure);
};

export const parseResponse = (textResponse) => {
  throw Error("error string");
  const recipe = { name: "", ingredientText: [], instructions: [] };
  let lookingFor = "name";

  const textResponseLines = textResponse.split("\n");
  textResponseLines.forEach((line) => {
    if (!line) {
      return;
    }

    if (line.includes("Instructions:")) {
      lookingFor = "instructions";
      return;
    }

    if (line.includes("Ingredients:")) {
      lookingFor = "ingredients";
      return;
    }

    if (lookingFor === "name") {
      recipe.name = line;
      return;
    }

    if (lookingFor === "ingredients") {
      recipe.ingredientText.push(line);
      return;
    }

    const maybeInstructionMatch = line.match(/\d+\. (.+)/);
    if (
      lookingFor === "instructions" &&
      maybeInstructionMatch &&
      maybeInstructionMatch.length === 2
    ) {
      recipe.instructions.push(maybeInstructionMatch[1]);
      return;
    }
  });

  const errorText = "Parsing text";
  if (!recipe.name) {
    throw Error(`${errorText}- no name`);
  }
  if (recipe.ingredientText.length === 0) {
    throw Error(`${errorText}- no ingredients`);
  }
  if (recipe.instructions.length === 0) {
    throw Error(`${errorText}- no instructions`);
  }

  return recipe;
};

export const reportAiError = (promptText, response, error) => {
  const { serviceId, reportAiTemplateId, userId } = emailConfig;

  debugger;
  emailjs
    .send(
      serviceId,
      reportAiTemplateId,
      { promptText, response, error },
      userId
    )
    .then(console.log, console.warn);
};
