import type { VercelRequest, VercelResponse } from "@vercel/node";
import { JSDOM } from "jsdom";

const parseSiteForRecipe = (siteText) => {
  console.log(siteText);
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

    const data = JSON.parse(elementTextContent);

    if (data["@type"] === "Recipe") {
      recipeData = data;
      return;
    }

    if (!Array.isArray(data["@graph"])) {
      return;
    }

    recipeData = data["@graph"].find((entry) => entry["@type"] === "Recipe");
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
