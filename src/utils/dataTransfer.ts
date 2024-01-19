import { offlineCookbookKey } from "../constants";
import {
  BasicFoodId,
  BasicFoodTags,
  BasicFoods,
  Cookbook,
  CookbookData,
  FormattedDataFromCookBookImport,
  Glossary,
  Ingredients,
  Recipe,
  RecipeData,
  RecipeTagList,
} from "../types";
import { createKey } from "./requests";

export const downloadData = (dataJSON: any, name: string = "download") => {
  const dataString = JSON.stringify(dataJSON, null, 2);

  const element = document.createElement("a");
  element.download = `gudefoods-${name}.json`;
  element.href = `data:text/json;charset=utf-8,${encodeURIComponent(
    dataString
  )}`;
  element.click();
};

export const transformRecipeForExport = (
  recipe: Recipe,
  glossary: Glossary
): RecipeData => {
  const { basicFoods, recipeTags } = glossary;
  const { ingredients = {}, tags = [] } = recipe;

  const ingredientsAsNames = Object.keys(ingredients).reduce<{
    [key in BasicFoodId]: string;
  }>(
    (acc, ingredientKey) => ({
      ...acc,
      [basicFoods[ingredientKey]]: ingredients[ingredientKey],
    }),
    {}
  );

  const tagsAsNames = tags.map((tagKey) => recipeTags[tagKey]);

  // TODO Substitute ingredient needs to be transformed
  const recipeData: RecipeData = {
    ...recipe,
    ingredients: ingredientsAsNames,
    tags: tagsAsNames,
  };

  return recipeData;
};

export const transformCookbookForExport = ({
  cookbook,
  glossary,
}: {
  cookbook: Cookbook;
  glossary: Glossary;
}) =>
  Object.keys(cookbook).reduce<CookbookData>((acc, recipeId) => {
    const recipe = cookbook[recipeId];
    const recipeData = transformRecipeForExport(recipe, glossary);

    return {
      ...acc,
      [recipe.name]: recipeData,
    };
  }, {});

export const transformCookbookFromImport = (
  cookbookData: CookbookData,
  glossary: Glossary
): FormattedDataFromCookBookImport => {
  const { basicFoods, recipeTags } = glossary;
  const newFoods: BasicFoods = {};
  const newTags: BasicFoodTags = {};

  const formattedCookbook = Object.values(cookbookData).reduce<Cookbook>(
    (accumulator, recipeData) => {
      const { ingredients = {}, tags = [], name, instructions } = recipeData;

      if (!name || !instructions || !ingredients) {
        throw Error("Some required fields missing on recipe");
      }

      const ingredientsAsKeys = Object.keys(ingredients).reduce<Ingredients>(
        (acc, ingredientName) => {
          // TODO optimimize this
          const basicFoodList = Object.keys(basicFoods);
          const foundFoodId =
            basicFoodList.find(
              (foodId) => basicFoods[foodId] === ingredientName
            ) || newFoods[ingredientName];

          let ingredientId = foundFoodId;
          if (!foundFoodId) {
            ingredientId = createKey();
            newFoods[ingredientName] = ingredientId;
          }

          return {
            ...acc,
            [ingredientId]: ingredients[ingredientName],
          };
        },
        {}
      );

      const tagsAsKeys: RecipeTagList = tags.map((tagName) => {
        // TODO Optimize this
        const recipeTagsList = Object.keys(recipeTags);
        const foundTagId =
          recipeTagsList.find((tagId) => recipeTags[tagId] === tagName) ||
          newTags[tagName];

        let tagId = foundTagId;
        if (!foundTagId) {
          tagId = createKey();
          newTags[tagName] = tagId;
        }

        return tagId;
      });

      const recipe: Recipe = {
        ...recipeData,
        ingredients: ingredientsAsKeys,
        tags: tagsAsKeys,
      };

      const recipeId = createKey();

      return { ...accumulator, [recipeId]: recipe };
    },
    {}
  );

  return { formattedCookbook, newFoods, newTags };
};

export const saveCookbookToLocalStorage = (
  {
    cookbook,
    glossary,
  }: {
    cookbook: Cookbook;
    glossary: Glossary;
  },
  onSuccess: () => void,
  onFailure: (error: any) => void
) => {
  const cookbookData = transformCookbookForExport({ cookbook, glossary });

  try {
    localStorage.setItem(offlineCookbookKey, JSON.stringify(cookbookData));

    onSuccess();
  } catch (error) {
    onFailure(error);
    console.error(error);
  }
};
