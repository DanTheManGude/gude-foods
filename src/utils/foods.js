import { UNKNOWN_TAG } from "../constants";

export const getCalculateFoodSectionForOptions =
  (glossary, basicFoodTagAssociation, unknownSectionName) => (option) =>
    (glossary &&
      basicFoodTagAssociation &&
      glossary.basicFoodTags[basicFoodTagAssociation[option]]) ||
    unknownSectionName;

export const constructBasicFoodOptions = (
  glossary,
  basicFoodTagNamesOrder,
  unknownSectionName,
  calculateFoodSectionForOptions
) => {
  if (!glossary || !glossary.basicFoods) {
    return [];
  }

  const organizedFoods = Object.keys(glossary.basicFoods).reduce(
    (acc, foodId) => {
      const foodSectionForOptions = calculateFoodSectionForOptions(foodId);
      if (acc.hasOwnProperty(foodSectionForOptions)) {
        acc[foodSectionForOptions].push(foodId);
      } else {
        acc[foodSectionForOptions] = [foodId];
      }
      return acc;
    },
    {}
  );

  return basicFoodTagNamesOrder
    .reduce(
      (acc, tagId) =>
        acc.concat(organizedFoods[glossary.basicFoodTags[tagId]] || []),
      []
    )
    .concat(organizedFoods[unknownSectionName] || [])
    .map((foodId) => ({ foodId, title: glossary.basicFoods[foodId] }));
};

export const constructTextFromShoppingMap = (
  unchecked,
  { glossary, cookbook, basicFoodTagOrder }
) =>
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
