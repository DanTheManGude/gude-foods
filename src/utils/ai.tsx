import emailjs from "@emailjs/browser";
import Typography from "@mui/material/Typography";

import { emailConfig } from "../constants";
import { AddAlert, Recipe, ReportErrorValues } from "../types";

export const generateRecipe = async (
  params: { [key: string]: string | number | boolean },
  user: any,
  onSuccess: (responseText: string) => void,
  onFailure: (error: Error) => void
) => {
  const searchParamsText = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const appCheckTokenResponse =
    await user.auth.appCheckServiceProvider.instances
      .get("[DEFAULT]")
      .getToken(false)
      .catch(onFailure);

  const authorization = btoa(`${user.uid}:${user.accessToken}`);

  fetch(`/api/generate-recipe?${searchParamsText}`, {
    headers: {
      Authorization: authorization,
      "X-Firebase-AppCheck": appCheckTokenResponse.token,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }

      return response.text();
    })
    .then(onSuccess)
    .catch(onFailure);
};

export const parseResponse = (textResponse: string) => {
  const openedBracketIndex = textResponse.indexOf("{");
  if (openedBracketIndex === -1) {
    throw Error("Parsing text - no opening bracket found");
  }
  const closedBracketIndex = textResponse.lastIndexOf("}");
  if (closedBracketIndex === -1) {
    throw Error("Parsing text - no closing bracket found");
  }
  const jsonString = textResponse.substring(
    openedBracketIndex,
    closedBracketIndex + 1
  );
  if (!jsonString) {
    throw Error("Parsing text - no JSON string found");
  }

  const recipe: Recipe = JSON.parse(jsonString);

  const errorText = "Parsing text";
  if (Object.keys(recipe.ingredients).length === 0) {
    throw Error(`${errorText}- no ingredients`);
  }
  if (recipe.instructions.length === 0) {
    throw Error(`${errorText}- no instructions`);
  }
  if (!recipe.name) {
    throw Error(`${errorText}- no name`);
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
