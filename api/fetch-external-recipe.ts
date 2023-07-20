import type { VercelRequest, VercelResponse } from "@vercel/node";
import { JSDOM } from "jsdom";

const parseSiteForRecipe = (siteText) => {
  console.log(siteText);
  const document = new JSDOM(siteText).window.document;
  const nodes = document.querySelectorAll('script[type="application/ld+json"]');

  if (!nodes.length) {
    throw Error("Can not find nodes");
  }

  const elementTextContent = nodes[0].textContent;

  if (!elementTextContent) {
    throw Error("Element has no text content");
  }

  const data = JSON.parse(elementTextContent);

  if (data["@type"] === "Recipe") {
    return data;
  }

  if (!Array.isArray(data["@graph"])) {
    throw Error("Can not parse data");
  }

  const recipeData = data["@graph"].find(
    (entry) => entry["@type"] === "Recipe"
  );

  if (!recipeData) {
    throw Error("Can not find Recipe data");
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
