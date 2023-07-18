import emailjs from "@emailjs/browser";

import { emailConfig } from "../constants";

export const generateRecipe = (prompt, onSuccess, onFailure) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  };
  fetch("/api/generate-recipe", requestOptions)
    .then((response) => response.text())
    .then((responseText) => {
      console.log(responseText);
      onSuccess(responseText);
    })
    .catch(onFailure);
};

export const parseResponse = (textResponse) => {
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
  if (recipe.ingredientText.length === 0) {
    throw Error(`${errorText}- no ingredients`);
  }
  if (recipe.instructions.length === 0) {
    throw Error(`${errorText}- no instructions`);
  }

  return recipe;
};

export const reportAiError = (addAlert, reportErrorValues) => {
  const { serviceId, reportAiTemplateId, userId } = emailConfig;

  emailjs.send(serviceId, reportAiTemplateId, reportErrorValues, userId).then(
    () => {
      addAlert(
        {
          title: <span>Thanks for sharing</span>,
          message: (
            <span>
              Succesfully reported the error. Thank you for helping make Gude
              Foods better.
            </span>
          ),
          alertProps: { severity: "success" },
        },
        5000
      );
    },
    () => {
      addAlert({
        message: <span>An error occured when reporting the error</span>,
        alertProps: { severity: "error" },
      });
    }
  );
};
