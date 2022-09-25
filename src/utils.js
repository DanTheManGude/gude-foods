import { getDatabase, ref, child, push, update } from "firebase/database";

export const updateRequest = (updates, onSuccess = () => {}, onFailure) => {
  update(ref(getDatabase()), updates)
    .then(() => {
      onSuccess({
        message: <span>Succesfully completed updates.</span>,
        alertProps: { severity: "success" },
      });
    })
    .catch(() => {
      const errorHandler = onFailure || onSuccess;

      errorHandler({
        message: "The request did not go through.",
        title: "Error",
        alertProps: { severity: "error" },
      });
    });
};

export const deleteRequest = (deletePaths = [], onSuccess, onFailure) => {
  const updates = deletePaths.reduce(
    (acc, path) => ({ ...acc, [path]: null }),
    {}
  );
  updateRequest(updates, onSuccess, onFailure);
};

export const createKey = (path) => push(child(ref(getDatabase()), path)).key;

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
