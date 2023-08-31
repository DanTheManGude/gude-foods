import type { VercelRequest, VercelResponse } from "@vercel/node";
import { JSDOM } from "jsdom";

const parseSiteForRecipe = (siteText) => {
  const document = new JSDOM(siteText).window.document;
  const nodes = document.querySelectorAll('script[type="application/ld+json"]');

  let recipeData;

  nodes.forEach((node) => {
    if (recipeData) {
      return;
    }

    const elementTextContent = node.textContent;

    if (!elementTextContent) {
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.innerHTML = elementTextContent;
    const text = textarea.value;

    let workingData = JSON.parse(text);

    if (Array.isArray(workingData)) {
      workingData = workingData[0];
    }

    if (workingData["@type"] === "Recipe") {
      recipeData = workingData;
      return;
    }

    if (!Array.isArray(workingData["@graph"])) {
      return;
    }

    recipeData = workingData["@graph"].find(
      (entry) => entry["@type"] === "Recipe"
    );
  });

  if (!recipeData) {
    throw Error("Website has no recipes");
  }

  return recipeData;
};

export default async function (
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const externalUrlParam = request.query.externalUrl;

    const externalUrl = Array.isArray(externalUrlParam)
      ? externalUrlParam[0]
      : externalUrlParam;

    const responseText = await fetch(externalUrl).then((response) =>
      response.text()
    );

    const recipeData = parseSiteForRecipe(responseText);

    response.status(200).json(recipeData);
    return;
  } catch (error) {
    response.status(500).send(error.toString());
  }
}
