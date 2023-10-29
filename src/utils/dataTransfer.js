import Typography from "@mui/material/Typography";
import { offlineCookbookKey } from "../constants";
import { createKey } from "./requests";

export const downloadData = (dataJSON, name = "download") => {
  const dataString = JSON.stringify(dataJSON, null, 2);

  const element = document.createElement("a");
  element.download = `gudefoods-${name}.json`;
  element.href = `data:text/json;charset=utf-8,${encodeURIComponent(
    dataString
  )}`;
  element.click();
};

export const transformRecipeForExport = (recipeEntry, glossary) => {
  const { basicFoods, recipeTags } = glossary;
  const { ingredients, tags = [] } = recipeEntry;

  const ingredientsAsNames = Object.keys(ingredients).reduce(
    (acc, ingredientKey) => ({
      ...acc,
      [basicFoods[ingredientKey]]: ingredients[ingredientKey],
    }),
    {}
  );

  const tagsAsNames = tags.map((tagKey) => recipeTags[tagKey], {});

  const recipeData = {
    ...recipeEntry,
    ingredients: ingredientsAsNames,
    tags: tagsAsNames,
  };

  return recipeData;
};

export const transformCookbookForExport = ({ cookbook, glossary }) =>
  Object.keys(cookbook).reduce((acc, recipeId) => {
    const recipeEntry = cookbook[recipeId];
    const recipeData = transformRecipeForExport(recipeEntry, glossary);

    return {
      ...acc,
      [recipeEntry.name]: recipeData,
    };
  }, {});

export const transformCookbookFromImport = (
  cookbookData,
  glossary,
  glossaryPath,
  cookbookPath
) => {
  const { basicFoods, recipeTags } = glossary;
  const newFoods = {};
  const newTags = {};

  const formattedCookbook = Object.values(cookbookData).reduce(
    (accumulator, recipeData) => {
      const { ingredients, tags = [], name, instructions } = recipeData;

      if (!name || !instructions || !ingredients) {
        throw Error("Some required fields missing on recipe");
      }

      const ingredientsAsKeys = Object.keys(ingredients).reduce(
        (acc, ingredientName) => {
          const basicFoodList = Object.keys(basicFoods);
          const foundFoodId =
            basicFoodList.find(
              (foodId) => basicFoods[foodId] === ingredientName
            ) || newFoods[ingredientName];

          let ingredientId = foundFoodId;
          if (!foundFoodId) {
            ingredientId = createKey(`${glossaryPath}/basicFoods`);
            newFoods[ingredientName] = ingredientId;
          }

          return {
            ...acc,
            [ingredientId]: ingredients[ingredientName],
          };
        },
        {}
      );

      const tagsAsKeys = tags.map((tagName) => {
        const recipeTagsList = Object.keys(recipeTags);
        const foundTagId =
          recipeTagsList.find((tagId) => recipeTags[tagId] === tagName) ||
          newTags[tagName];

        let tagId = foundTagId;
        if (!foundTagId) {
          tagId = createKey(`${glossaryPath}/recipeTags`);
          newTags[tagName] = tagId;
        }

        return tagId;
      });

      const recipeEntry = {
        ...recipeData,
        ingredients: ingredientsAsKeys,
        tags: tagsAsKeys,
      };

      const recipeId = createKey(cookbookPath);

      return { ...accumulator, [recipeId]: recipeEntry };
    },
    {}
  );

  return { formattedCookbook, newFoods, newTags };
};

export const saveCookbookToLocalStorage = (
  { cookbook, glossary },
  addAlert
) => {
  const cookbookData = transformCookbookForExport({ cookbook, glossary });

  try {
    localStorage.setItem(offlineCookbookKey, JSON.stringify(cookbookData));

    addAlert({
      message: (
        <Typography>Cookbook has been saved for offline use.</Typography>
      ),
      alertProps: { severity: "success" },
    });
  } catch (error) {
    console.error(error);
    addAlert({
      message: (
        <Typography>
          There was an error trying to save the cookbook for offline use.
        </Typography>
      ),
      alertProps: { severity: "error" },
    });
  }
};
