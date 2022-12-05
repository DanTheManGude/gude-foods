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

export const shoppingListDeletesByRecipe = (
  recipeId,
  shoppingList,
  shoppingListPath
) =>
  shoppingList
    ? Object.keys(shoppingList)
        .filter((foodId) => {
          const foodEntry = shoppingList[foodId];
          return foodEntry.list && foodEntry.list[recipeId];
        })
        .map((foodId) => `${shoppingListPath}/${foodId}/list/${recipeId}`)
    : [];

export const addRecipeToShoppingList = (
  ingredients,
  recipeId,
  { recipeOrder, menu: _menu },
  { shoppingListPath, recipeOrderPath, menuPath },
  addAlert
) => {
  const menu = _menu || {};
  updateRequest(
    {
      ...Object.keys(ingredients).reduce(
        (updates, foodId) => ({
          ...updates,
          [`${shoppingListPath}/${foodId}/list/${recipeId}`]: true,
        }),
        {}
      ),
      [recipeOrderPath]: [
        recipeId,
        ...recipeOrder.filter((_recipeId) => recipeId !== _recipeId),
      ],
      [menuPath]: {
        ...menu,
        [recipeId]: menu.hasOwnProperty(recipeId) ? menu[recipeId] + 1 : 1,
      },
    },
    addAlert
  );
};

export const removeRecipeFromMenu = (
  recipeId,
  shoppingList,
  { menuPath, shoppingListPath },
  addAlert
) => {
  deleteRequest(
    [
      ...shoppingListDeletesByRecipe(recipeId, shoppingList, shoppingListPath),
      `${menuPath}/${recipeId}`,
    ],
    addAlert
  );
};

export const updateRecipeMenuCount = (recipeId, count, menuPath) => {
  updateRequest({ [`${menuPath}/${recipeId}`]: count });
};
