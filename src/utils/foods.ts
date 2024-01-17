import { UNKNOWN_TAG, unknownSectionName } from "../constants";
import {
  Glossary,
  BasicFoodTagAssociation,
  BasicFoodTagOrder,
  Database,
  ShoppingMapUnchecked,
  Cookbook,
} from "../types";

export const getCalculateFoodSectionForOptions =
  (
    glossary: Glossary | undefined,
    basicFoodTagAssociation: BasicFoodTagAssociation | undefined
  ) =>
  (option: string): string =>
    (glossary &&
      basicFoodTagAssociation &&
      glossary.basicFoodTags[basicFoodTagAssociation[option]]) ||
    unknownSectionName;

export const constructBasicFoodOptions = (
  glossary: Glossary | undefined,
  basicFoodTagOrder: BasicFoodTagOrder,
  calculateFoodSectionForOptions: ReturnType<
    typeof getCalculateFoodSectionForOptions
  >
): { foodId: string; title: string }[] => {
  if (!glossary || !glossary.basicFoods) {
    return [];
  }

  const organizedFoods = Object.keys(glossary.basicFoods).reduce<{
    [key in string]: string[];
  }>((acc, foodId) => {
    const foodSectionForOptions = calculateFoodSectionForOptions(foodId);
    if (acc.hasOwnProperty(foodSectionForOptions)) {
      acc[foodSectionForOptions].push(foodId);
    } else {
      acc[foodSectionForOptions] = [foodId];
    }
    return acc;
  }, {});

  return basicFoodTagOrder
    .reduce<string[]>(
      (acc, tagId) =>
        acc.concat(organizedFoods[glossary.basicFoodTags[tagId]] || []),
      []
    )
    .concat(organizedFoods[unknownSectionName] || [])
    .map((foodId) => ({ foodId, title: glossary.basicFoods[foodId] }));
};

export const constructTextFromShoppingMap = (
  unchecked: ShoppingMapUnchecked,
  {
    glossary,
    cookbook,
    basicFoodTagOrder,
  }: {
    glossary: Glossary;
    cookbook: Cookbook;
    basicFoodTagOrder: BasicFoodTagOrder;
  }
): string =>
  (basicFoodTagOrder || [])
    .concat(UNKNOWN_TAG)
    .filter((tagId) => unchecked.hasOwnProperty(tagId))
    .map((tagId) =>
      Object.entries(unchecked[tagId]).reduce(
        (fromFood, [foodId, { list = {}, collatedAmount }]) =>
          `${fromFood}${glossary.basicFoods[foodId]}- ${
            collatedAmount ||
            Object.entries(list)
              .map(
                ([recipeId, recipeAmount]) =>
                  `[${recipeAmount}: ${cookbook[recipeId].name}]`
              )
              .join(" & ")
          }\n`,
        ""
      )
    )
    .join("");
