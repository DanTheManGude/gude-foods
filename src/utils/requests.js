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

export const addRecipeToShoppingList = (
  ingredients,
  recipeId,
  { recipeOrder, shoppingList, menu: _menu },
  { shoppingListPath, recipeOrderPath, menuPath },
  addAlert
) => {
  const menu = _menu || {};
  updateRequest(
    {
      ...Object.keys(ingredients).reduce(
        (updates, foodId) => ({
          ...updates,
          [`${shoppingListPath}/${foodId}/list/${recipeId}`]:
            (shoppingList?.[foodId]?.list?.[recipeId] || 0) + 1,
          [`${shoppingListPath}/${foodId}/isChecked`]: false,
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
