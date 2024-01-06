import { createTheme } from "@mui/material/styles";
import {
  fontFamilies,
  longestEntryPathDelimiter,
  hasLoggedInBeforeKey,
} from "../constants";
import { Recipe, Theme } from "../types";

export const isDevelopment = () =>
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export const waitForElm = (selector: string): Promise<HTMLElement> => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector<HTMLElement>(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector<HTMLElement>(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

export const constructTheme = (
  palette: Theme["palette"],
  components: Theme["components"]
) =>
  createTheme({
    palette,
    typography: {
      fontFamily: fontFamilies.join(","),
    },
    components,
  });

export const constructBackgroundStyleText = (
  backgroundList: Theme["background"]
) =>
  `linear-gradient(180deg, ${backgroundList
    .map((entry) => `${entry.color} ${entry.percent}%`)
    .join(", ")}) fixed ${backgroundList[0].color}`;

export const getEmailLink = ({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) =>
  `mailto:dgude31@outlook.com?subject=Gude%20Foods%20Authirization&body=Hello%2C%0D%0A%0D%0AI%20would%20like%20to%20have%20access%20to%20the%20Gude%20Foods%20website%20functionality%2C%20but%20the%20request%20button%20did%20not%20work.%20My%20name%20is%2C%20${displayName}%2C%20and%20my%20email%20is%2C%20${email}.%0D%0A%0D%0AThhank%20you!`;

type Item = { [key: string]: Item } | string;
export const findLongestEntry = (
  item: Item
): { length: number; path: string } => {
  switch (typeof item) {
    case "object":
      const obj = { ...item };
      return Object.entries(obj).reduce(
        (prev, [key, value]) => {
          const { length, path } = findLongestEntry(value);
          const { length: prevLength } = prev;

          if (length > prevLength) {
            return {
              length,
              path: `${key}${longestEntryPathDelimiter}${path}`,
            };
          }
          return prev;
        },
        { length: -1, path: "" }
      );
    case "string":
    default:
      const stringItem = item.toString();
      return { length: stringItem.length, path: stringItem };
  }
};

export const parseRecipeData = (recipeData: any, sourceUrl: string) => {
  const {
    name = "",
    description: givenDescription = "",
    recipeYield: yieldText = "",
    recipeIngredient: ingredientText = "",
    recipeInstructions: instructionsData = ["Step 1"],
  } = recipeData;
  const notes = `${sourceUrl}\n\n${ingredientText.join(`\n`)}`;
  const description = `${givenDescription}${yieldText && `- ${yieldText}`}`;

  let instructions = [];

  if (typeof instructionsData === "string") {
    instructions = instructionsData.split(". ");
  } else if (Array.isArray(instructionsData)) {
    const parseSteps = (step) => {
      const type = step["@type"];
      if (type === "HowToStep") {
        instructions.push(step.text);
      } else if (type === "HowToSection") {
        step.itemListElement.forEach(parseSteps);
      }
    };

    instructionsData.forEach(parseSteps);
  }

  const recipe = {
    name,
    description,
    instructions,
    tags: [],
    ingredients: {},
    notes,
    ingredientText,
  };

  return recipe;
};

export async function fetchRecipeFromUrl(externalUrl: string): Promise<Recipe> {
  const response = await fetch(
    `/api/fetch-external-recipe?externalUrl=${encodeURIComponent(externalUrl)}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw errorText;
  }

  const recipeData = await response.json();
  const recipe = parseRecipeData(recipeData, externalUrl);

  return recipe;
}

export const constructShareRecipePath = (shareId: string, name: string) => {
  const encodedName = encodeURIComponent(name);

  const path = `share/${shareId}?name=${encodedName}`;
  return path;
};

export const constructShareRecipeLink = (shareId: string, name: string) => {
  const urlBase = window.location.origin;

  const path = constructShareRecipePath(shareId, name);

  const link = `${urlBase}/${path}`;
  return link;
};

export const getHasLoggedInBefore = () => {
  Boolean(localStorage.getItem(hasLoggedInBeforeKey));
};

export const setHasLoggedInBefore = () => {
  localStorage.setItem(hasLoggedInBeforeKey, "true");
};