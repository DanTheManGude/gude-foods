import emailjs from "@emailjs/browser";
import Typography from "@mui/material/Typography";

import { emailConfig } from "../constants";
import { AddAlert, Recipe, ReportErrorValues } from "../types";
import { makeHeaders } from "./utility";

export const generateRecipe = async (
  params: { [key: string]: string | number | boolean },
  user: any,
  onSuccess: (responseText: string) => void,
  onFailure: (error: Error) => void
) => {
  const searchParamsText = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  try {
    const headers = await makeHeaders(user);

    fetch(`/api/generate-recipe?${searchParamsText}`, { headers })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }

        return response.text();
      })
      .then(onSuccess);
  } catch (error) {
    onFailure(error);
  }
};

export const parseResponse = (textResponse: string) => {
  type LookingFor = "name" | "instructions" | "ingredients";

  const recipe: Partial<Recipe> = {
    name: "",
    ingredientText: [],
    instructions: [],
  };
  let lookingFor: LookingFor = "name";

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

export const reportAiError = (
  addAlert: AddAlert,
  reportErrorValues: ReportErrorValues
) => {
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
