import { offlineCookbookKey } from "../constants";
import {
  BasicFoodTags,
  BasicFoods,
  Cookbook,
  FormattedDataFromCookBookImport,
  Glossary,
  IndividualSupplementalIngredientInfo,
  Ingredients,
  Recipe,
  RecipeTagList,
  RecipeTags,
  SupplementalIngredientInfo,
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
): Recipe => {
  const { basicFoods, recipeTags } = glossary;
  const {
    ingredients = {},
    tags = [],
    supplementalIngredientInfo = {},
  } = recipe;

  const ingredientsAsNames = Object.keys(ingredients).reduce<{
    [key in string]: string;
  }>(
    (acc, ingredientKey) => ({
      ...acc,
      [basicFoods[ingredientKey]]: ingredients[ingredientKey],
    }),
    {}
  );

  const tagsAsNames = tags.map((tagKey) => recipeTags[tagKey]);

  const supplementalIngredientInfoAsNames = Object.entries(
    supplementalIngredientInfo
  ).reduce<SupplementalIngredientInfo>(
    (acc, [ingredientKey, individualInfo]) => {
      let individualInfoAsNames: IndividualSupplementalIngredientInfo =
        individualInfo.isOptional ? { isOptional: true } : {};

      if (individualInfo.substitution) {
        individualInfoAsNames.substitution = {
          amount: individualInfo.substitution.amount,
          foodId: basicFoods[individualInfo.substitution.foodId],
        };
      }
      return { ...acc, [basicFoods[ingredientKey]]: individualInfoAsNames };
    },
    {}
  );

  const recipeData: Recipe = {
    ...recipe,
    ingredients: ingredientsAsNames,
    tags: tagsAsNames,
    ...(Object.entries(supplementalIngredientInfoAsNames).length
      ? { supplementalIngredientInfo: supplementalIngredientInfoAsNames }
      : {}),
  };

  return recipeData;
};

export const transformCookbookForExport = ({
  cookbook,
  glossary,
}: {
  cookbook: Cookbook;
  glossary: Glossary;
}): Cookbook =>
  Object.keys(cookbook).reduce<Cookbook>((acc, recipeId) => {
    const recipe = cookbook[recipeId];
    const recipeData = transformRecipeForExport(recipe, glossary);

    return {
      ...acc,
      [recipe.name]: recipeData,
    };
  }, {});

export const transformCookbookFromImport = (
  cookbookData: Cookbook,
  glossary: Glossary
): FormattedDataFromCookBookImport => {
  const { basicFoods, recipeTags } = glossary;
  const newFoods: BasicFoods = {};
  const newTags: RecipeTags = {};

  const basicFoodList = Object.keys(basicFoods);
  const recipeTagsList = Object.keys(recipeTags);

  const findAndMaybeCreateFood = (foodName: string): string => {
    const foundFoodId =
      basicFoodList.find((foodId) => basicFoods[foodId] === foodName) ||
      newFoods[foodName];

    let foodId = foundFoodId;
    if (!foundFoodId) {
      foodId = createKey();
      newFoods[foodName] = foodId;
    }

    return foodId;
  };

  const findAndMaybeCreateTag = (tagName: string): string => {
    const foundTagId =
      recipeTagsList.find((tagId) => recipeTags[tagId] === tagName) ||
      newTags[tagName];

    let tagId = foundTagId;
    if (!foundTagId) {
      tagId = createKey();
      newTags[tagName] = tagId;
    }

    return tagId;
  };

  const formattedCookbook = Object.values(cookbookData).reduce<Cookbook>(
    (accumulator, recipeData) => {
      const {
        ingredients = {},
        tags = [],
        name,
        instructions,
        supplementalIngredientInfo = {},
      } = recipeData;

      if (!name || !instructions || !ingredients) {
        throw Error("Some required fields missing on recipe");
      }

      const ingredientsAsKeys = Object.keys(ingredients).reduce<Ingredients>(
        (acc, ingredientName) => ({
          ...acc,
          [findAndMaybeCreateFood(ingredientName)]: ingredients[ingredientName],
        }),
        {}
      );

      const tagsAsKeys: RecipeTagList = tags.map(findAndMaybeCreateTag);

      const supplementalInfoAsKeys: SupplementalIngredientInfo = Object.entries(
        supplementalIngredientInfo
      ).reduce<SupplementalIngredientInfo>(
        (acc, [ingredientName, individualInfoAsNames]) => {
          let individualInfoAsKeys: IndividualSupplementalIngredientInfo =
            individualInfoAsNames.isOptional ? { isOptional: true } : {};

          if (individualInfoAsNames.substitution) {
            individualInfoAsKeys.substitution = {
              amount: individualInfoAsNames.substitution.amount,
              foodId: findAndMaybeCreateFood(
                individualInfoAsNames.substitution.foodId
              ),
            };
          }

          return {
            ...acc,
            [findAndMaybeCreateFood(ingredientName)]: individualInfoAsKeys,
          };
        },
        {}
      );

      const recipe: Recipe = {
        ...recipeData,
        ingredients: ingredientsAsKeys,
        tags: tagsAsKeys,
        ...(Object.entries(supplementalInfoAsKeys).length
          ? { supplementalIngredientInfo: supplementalInfoAsKeys }
          : {}),
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
