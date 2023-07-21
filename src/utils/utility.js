import { createTheme } from "@mui/material/styles";
import { fontFamilies, longestEntryPathDelimiter } from "../constants";

export const isDevelopment = () =>
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export const waitForElm = (selector) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

export const constructTheme = (palette) =>
  createTheme({
    palette,
    typography: {
      fontFamily: fontFamilies.join(","),
    },
    components: {
      MuiAccordion: {
        defaultProps: {
          disableGutters: true,
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            "&.Mui-expanded": {
              margin: 0,
            },
          },
        },
      },
    },
  });

export const constructBackgroundStyleText = (backgroundList) =>
  `linear-gradient(180deg, ${backgroundList
    .map((entry) => `${entry.color} ${entry.percent}%`)
    .join(", ")}) fixed ${backgroundList[0].color}`;

export const getEmailLink = ({ displayName, email }) =>
  `mailto:dgude31@outlook.com?subject=Gude%20Foods%20Authirization&body=Hello%2C%0D%0A%0D%0AI%20would%20like%20to%20have%20access%20to%20the%20Gude%20Foods%20website%20functionality%2C%20but%20the%20request%20button%20did%20not%20work.%20My%20name%20is%2C%20${displayName}%2C%20and%20my%20email%20is%2C%20${email}.%0D%0A%0D%0AThhank%20you!`;

export const findLongestEntry = (item) => {
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

export const parseRecipeData = (recipeData) => {
  const {
    name = "",
    description = "",
    recipeIngredient: ingredientText = "",
    recipeInstructions: instructionsData = [],
  } = recipeData;
  const urlId = recipeData["@id"];

  const notes = `${urlId}\n${description}\n\n${ingredientText.join(`\n`)}`;

  let instructions = [];

  if (typeof instructionsData === "string") {
    instructions = instructionsData.split(". ");
  } else {
    const parseSteps = (step) => {
      const type = step["@type"];
      if (type === "HowToStep") {
        instructions.push(step.text);
      } else if (type === "HowToStep") {
        step.itemListElement.forEach(parseSteps);
      }
    };

    instructionsData.forEach(parseSteps);
  }

  const recipe = {
    name,
    description: "",
    instructions,
    tags: [],
    ingredients: {},
    notes,
    ingredientText,
  };

  return recipe;
};

export async function fetchRecipeFromUrl(externalUrl) {
  const response = await fetch(
    `/api/fetch-external-recipe?externalUrl=${encodeURIComponent(externalUrl)}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw errorText;
  }

  const recipeData = await response.json();
  const recipe = parseRecipeData(recipeData);

  return recipe;
}
