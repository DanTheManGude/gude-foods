import emailjs from "@emailjs/browser";
import Typography from "@mui/material/Typography";

import { emailConfig } from "../constants";

export const generateRecipe = async (
  params,
  uid,
  getAppCheckToken,
  onSuccess,
  onFailure
) => {
  const searchParamsText = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const appCheckToken = await getAppCheckToken().catch(onFailure);

  fetch(`/api/generate-recipe?${searchParamsText}`, {
    headers: { Authorization: uid, "X-Firebase-AppCheck": appCheckToken },
  })
    .then((response) => {
      const { ok, statusText, text } = response;

      if (!ok) {
        throw Error(statusText);
      }

      return text();
    })
    .then(onSuccess)
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
          title: <Typography>Thanks for sharing</Typography>,
          message: (
            <Typography>
              Succesfully reported the error. Thank you for helping make Gude
              Foods better.
            </Typography>
          ),
          alertProps: { severity: "success" },
        },
        5000
      );
    },
    () => {
      addAlert({
        message: (
          <Typography>An error occured when reporting the error</Typography>
        ),
        alertProps: { severity: "error" },
      });
    }
  );
};
