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
