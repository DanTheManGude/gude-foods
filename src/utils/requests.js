import { getDatabase, ref, child, get, push, update } from "firebase/database";

import Typography from "@mui/material/Typography";

import { databasePaths } from "../constants";
import { transformRecipeForExport } from "./dataTransfer";
import { sendNotification } from "./utility";

export const updateRequest = (updates, onSuccess = () => {}, onFailure) => {
  update(ref(getDatabase()), updates)
    .then(() => {
      onSuccess({
        message: <Typography>Succesfully completed updates.</Typography>,
        alertProps: { severity: "success" },
      });
    })
    .catch(() => {
      const errorHandler = onFailure || onSuccess;

      errorHandler({
        message: <Typography>The request did not go through.</Typography>,
        title: <Typography>Error</Typography>,
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

const shoppingListDeletesByRecipe = (
  recipeId,
  shoppingList,
  shoppingListPath
) =>
  shoppingList
    ? Object.keys(shoppingList)
        .filter((foodId) => {
          const foodEntry = shoppingList[foodId];
          return foodEntry.list && foodEntry.list.hasOwnProperty(recipeId);
        })
        .reduce(
          (acc, foodId) => ({
            ...acc,
            [foodId]: `${shoppingListPath}/${foodId}/list/${recipeId}`,
          }),
          {}
        )
    : {};

const shoppingListDeleteUndos = (
  shoppingListDeleteFoodIds,
  recipeId,
  shoppingListPath,
  shoppingList
) =>
  shoppingListDeleteFoodIds.reduce(
    (acc, foodId) => ({
      ...acc,
      [`${shoppingListPath}/${foodId}/list/${recipeId}`]:
        shoppingList[foodId].list[recipeId],
    }),
    {}
  );

export const addBasicFoodWithTag = (
  { glossaryPath, basicFoodTagAssociationPath },
  name,
  tagId
) => {
  const foodId = createKey(`${glossaryPath}/basicFoods`);
  const updates = {};
  updates[`${glossaryPath}/basicFoods/${foodId}`] = name;

  if (tagId) {
    updates[`${basicFoodTagAssociationPath}/${foodId}`] = tagId;
  }

  updateRequest(updates);
  return foodId;
};

export const addRecipeToShoppingList = (
  recipeId,
  count,
  ingredients = {},
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
          [`${shoppingListPath}/${foodId}/list/${recipeId}`]:
            ingredients[foodId],
        }),
        {}
      ),
      [recipeOrderPath]: [
        recipeId,
        ...recipeOrder.filter((_recipeId) => recipeId !== _recipeId),
      ],
      [menuPath]: {
        ...menu,
        [recipeId]: menu.hasOwnProperty(recipeId)
          ? menu[recipeId] + count
          : count,
      },
    },
    (successAlert) => {
      addAlert(
        {
          ...successAlert,
          message: (
            <Typography>
              Succesfully added ingredients to Shopping List and recipe to Menu.
            </Typography>
          ),
          undo: () => {
            updateRequest(
              {
                ...Object.keys(ingredients).reduce(
                  (updates, foodId) => ({
                    ...updates,
                    [`${shoppingListPath}/${foodId}/list/${recipeId}`]: null,
                  }),
                  {}
                ),
                [recipeOrderPath]: recipeOrder,
                [menuPath]: menu,
              },
              (undoSuccessAlert) => {
                addAlert({
                  ...undoSuccessAlert,
                  message: (
                    <Typography>
                      Succesfully undid adding ingredients to Shopping List and
                      recipe to Menu.
                    </Typography>
                  ),
                });
              },
              addAlert
            );
          },
        },
        5000
      );
    },
    addAlert
  );
};

export const addRecipesToMenu = (recipeIdList, menu, menuPath, addAlert) => {
  updateRequest(
    {
      [menuPath]: {
        ...menu,
        ...recipeIdList.reduce(
          (updates, recipeId) => ({
            ...updates,
            [recipeId]: menu.hasOwnProperty(recipeId) ? menu[recipeId] : 1,
          }),
          {}
        ),
      },
    },
    (successAlert) => {
      addAlert(
        {
          ...successAlert,
          message: <Typography>Succesfully added recipes to Menu.</Typography>,
          undo: () => {
            updateRequest(
              { [menuPath]: Boolean(menu) ? menu : null },
              (undoSuccessAlert) => {
                addAlert({
                  ...undoSuccessAlert,
                  message: (
                    <Typography>
                      Succesfully removed back recipes from Menu.
                    </Typography>
                  ),
                });
              },
              addAlert
            );
          },
        },
        5000
      );
    },
    addAlert
  );
};

export const removeRecipesFromMenu = (
  recipeIdList,
  menuPath,
  menu,
  addAlert
) => {
  deleteRequest(
    recipeIdList.map((recipeId) => `${menuPath}/${recipeId}`),
    (successAlert) => {
      addAlert(
        {
          ...successAlert,
          message: (
            <Typography>Succesfully removed recipes from Menu.</Typography>
          ),
          undo: () => {
            updateRequest(
              { [menuPath]: Boolean(menu) ? menu : null },
              (undoSuccessAlert) => {
                addAlert({
                  ...undoSuccessAlert,
                  message: (
                    <Typography>
                      Succesfully added back recipes to Menu.
                    </Typography>
                  ),
                });
              },
              addAlert
            );
          },
        },
        5000
      );
    },
    addAlert
  );
};

export const removeRecipeFromMenuAndShoppingList = (
  recipeId,
  { shoppingList, cookbook, menu },
  { menuPath, shoppingListPath },
  addAlert
) => {
  const recipeName = cookbook[recipeId].name;
  const shoppingListDeletes = shoppingListDeletesByRecipe(
    recipeId,
    shoppingList,
    shoppingListPath
  );

  deleteRequest(
    [...Object.values(shoppingListDeletes), `${menuPath}/${recipeId}`],
    (successAlert) => {
      addAlert(
        {
          ...successAlert,
          message: (
            <Typography>
              {`Succesfully removed recipe ${recipeName} from Menu and Shopping List.`}
            </Typography>
          ),
          undo: () => {
            updateRequest(
              {
                ...shoppingListDeleteUndos(
                  Object.keys(shoppingListDeletes),
                  recipeId,
                  shoppingListPath,
                  shoppingList
                ),
                [`${menuPath}/${recipeId}`]: menu[recipeId],
              },
              (undoSuccessAlert) => {
                addAlert({
                  ...undoSuccessAlert,
                  message: (
                    <Typography>
                      {`Succesfully added back recipe ${recipeName} to Menu/ Shopping List.`}
                    </Typography>
                  ),
                });
              },
              addAlert
            );
          },
        },
        5000
      );
    },
    addAlert
  );
};

export const updateRecipeMenuCount = (recipeId, count, menuPath) => {
  updateRequest({ [`${menuPath}/${recipeId}`]: count });
};

export const updateFromCookbookImport = (
  transformedData,
  { cookbookPath, glossaryPath, recipeOrderPath },
  recipeOrder,
  addAlert,
  navigate
) => {
  const { formattedCookbook, newFoods, newTags } = transformedData;

  const cookbookUpdates = Object.keys(formattedCookbook).reduce(
    (acc, recipeId) => ({
      ...acc,
      [`${cookbookPath}/${recipeId}`]: formattedCookbook[recipeId],
    }),
    {}
  );

  const foodUpdates = Object.keys(newFoods).reduce(
    (acc, foodName) => ({
      ...acc,
      [`${glossaryPath}/basicFoods/${newFoods[foodName]}`]: foodName,
    }),
    {}
  );

  const tagUpdates = Object.keys(newTags).reduce(
    (acc, tagName) => ({
      ...acc,
      [`${glossaryPath}/recipeTags/${newTags[tagName]}`]: tagName,
    }),
    {}
  );

  const allUpdates = {
    ...cookbookUpdates,
    ...foodUpdates,
    ...tagUpdates,
    [recipeOrderPath]: [...Object.keys(formattedCookbook), ...recipeOrder],
  };

  const undo = () => {
    const undoCookbookUpdates = Object.keys(formattedCookbook).reduce(
      (acc, recipeId) => ({ ...acc, [`${cookbookPath}/${recipeId}`]: null }),
      {}
    );

    const undoFoodUpdates = Object.keys(newFoods).reduce(
      (acc, foodName) => ({
        ...acc,
        [`${glossaryPath}/basicFoods/${newFoods[foodName]}`]: null,
      }),
      {}
    );

    const undoTagUpdates = Object.keys(newTags).reduce(
      (acc, tagName) => ({
        ...acc,
        [`${glossaryPath}/recipeTags/${newTags[tagName]}`]: null,
      }),
      {}
    );

    const undoRequests = {
      ...undoCookbookUpdates,
      ...undoFoodUpdates,
      ...undoTagUpdates,
      [recipeOrderPath]: recipeOrder,
    };

    updateRequest(
      undoRequests,
      (successAlert) => {
        if (Object.keys(formattedCookbook).length === 1) {
          navigate(`/cookbook`);
        }
        addAlert(
          {
            ...successAlert,
            message: <Typography>Succesfully undid import.</Typography>,
            undo: makeUpdates,
          },
          5000
        );
      },
      addAlert
    );
  };

  const makeUpdates = () => {
    updateRequest(
      allUpdates,
      (successAlert) => {
        addAlert(
          {
            ...successAlert,
            message: (
              <Typography>
                {`Succesfully imported ${
                  Object.keys(cookbookUpdates).length
                } recipes and added its ingredients & tags.`}
              </Typography>
            ),
            undo,
          },
          5000
        );
        if (Object.keys(formattedCookbook).length === 1) {
          navigate(`/recipe/${Object.keys(formattedCookbook)[0]}`);
        }
      },
      addAlert
    );
  };

  makeUpdates();
};

export const setAllData = (fileData, dataPaths, addAlert) => {
  updateRequest(
    Object.keys(databasePaths).reduce(
      (acc, databaseEntryName) => ({
        ...acc,
        ...(fileData.hasOwnProperty(databaseEntryName)
          ? {
              [dataPaths[`${databaseEntryName}Path`]]:
                fileData[databaseEntryName],
            }
          : {}),
      }),
      {}
    ),
    addAlert
  );
};

export const deleteRecipe = (
  recipeId,
  { shoppingList, recipeOrder, glossary },
  { shoppingListPath, cookbookPath, menuPath, recipeOrderPath },
  addAlert,
  navigate,
  recipe
) => {
  const shoppingListDeletes = shoppingListDeletesByRecipe(
    recipeId,
    shoppingList,
    shoppingListPath
  );

  updateRequest(
    [
      `${cookbookPath}/${recipeId}`,
      `${menuPath}/${recipeId}`,
      ...Object.values(shoppingListDeletes),
    ].reduce((acc, deletePath) => ({ ...acc, [deletePath]: null }), {
      [recipeOrderPath]: recipeOrder.filter(
        (_recipeId) => recipeId !== _recipeId
      ),
    }),
    (successAlert) => {
      addAlert(
        {
          ...successAlert,
          message: <Typography>Succesfully deleted recipe.</Typography>,
          undo: () => {
            saveRecipe(
              recipe,
              undefined,
              { cookbookPath, recipeOrderPath, shoppingListPath, menuPath },
              { recipeOrder, glossary, shoppingList },
              addAlert,
              () => {},
              navigate
            );
          },
        },
        5000
      );
      navigate(`/cookbook`);
    },
    addAlert
  );
};

export const changeCheckFood = (
  { shoppingListPath },
  { glossary },
  basicFoodId,
  newChecked,
  addAlert
) => {
  updateRequest(
    {
      [`${shoppingListPath}/${basicFoodId}/isChecked`]: newChecked,
    },
    (successAlert) => {
      addAlert(
        {
          ...successAlert,
          message: (
            <Typography>{`${newChecked ? "Checked" : "Unchecked"} food ${
              glossary.basicFoods[basicFoodId]
            }`}</Typography>
          ),
          undo: () => {
            changeCheckFood(
              { shoppingListPath },
              { glossary },
              basicFoodId,
              !newChecked,
              addAlert
            );
          },
        },
        1800
      );
    },
    addAlert
  );
};

export const saveRecipe = (
  recipe,
  _recipeId,
  { cookbookPath, recipeOrderPath, shoppingListPath, menuPath },
  { recipeOrder, glossary, shoppingList },
  addAlert,
  successHandler,
  navigate,
  maybeOldRecipe,
  { isAdmin, displayName }
) => {
  const { name, instructions, ingredients = {}, shareId } = recipe;
  const isCreating = !_recipeId;

  if (
    !(
      !!name.length &&
      !!instructions.length &&
      !!Object.keys(ingredients).length
    )
  ) {
    addAlert({
      message: <Typography>Please fill out the required fields.</Typography>,
      alertProps: { severity: "warning" },
    });
    return;
  }

  let recipeId = _recipeId;
  if (isCreating) {
    recipeId = createKey(cookbookPath);
  }

  const updates = {
    [`${cookbookPath}/${recipeId}`]: recipe,
  };

  if (shareId) {
    updates[`shared/${shareId}/recipeData`] = transformRecipeForExport(
      recipe,
      glossary
    );
  }

  if (isCreating) {
    updates[recipeOrderPath] = [recipeId, ...recipeOrder];
  }

  updateRequest(
    updates,
    (successAlert) => {
      successHandler();
      navigate(`/recipe/${recipeId}`);
      addAlert(
        {
          ...successAlert,
          undo: () => {
            if (isCreating) {
              deleteRecipe(
                recipeId,
                { shoppingList, recipeOrder, glossary },
                { shoppingListPath, cookbookPath, menuPath, recipeOrderPath },
                addAlert,
                navigate,
                recipe
              );
            } else {
              saveRecipe(
                maybeOldRecipe,
                recipeId,
                { cookbookPath, recipeOrderPath, shoppingListPath, menuPath },
                { recipeOrder, glossary, shoppingList },
                addAlert,
                successHandler,
                navigate,
                recipe
              );
            }
          },
          message: (
            <Typography>
              Succesfully {isCreating ? "created" : "updated"} recipe.
            </Typography>
          ),
        },
        5000
      );
      if (!isAdmin && isCreating) {
        sendNotification(
          {
            title: "New recipe!",
            body: `${displayName} created ${name}.`,
          },
          () => {}
        );
      }
    },
    addAlert
  );
};

export const createRecipeTag = (glossaryPath, successHandler, tagName) => {
  const pathRoot = `${glossaryPath}/recipeTags`;
  const newKey = createKey(pathRoot);

  updateRequest(
    { [`${pathRoot}/${newKey}`]: tagName },
    () => {
      successHandler(newKey);
    },
    console.error
  );
};

export const uploadColors = (colorsPath, colorKey, addAlert) => {
  updateRequest({ [colorsPath]: colorKey }, addAlert, addAlert);
};

export const sendAuthorizationRequest = (user, addAlert) => {
  const { displayName, uid } = user;

  updateRequest({ [`requestedUsers/${uid}`]: displayName });

  try {
    sendNotification(
      {
        title: "New user!",
        body: `${displayName} requested access.`,
      },
      () => {
        addAlert(
          {
            message: (
              <Typography>Succesfully sent authorization request.</Typography>
            ),
            alertProps: { severity: "success" },
          },
          5000
        );
      }
    );
  } catch (error) {
    console.error(error);
  }
};

export const removeUserFromRequestedUsers = (uid) => {
  deleteRequest([`requestedUsers/${uid}`]);
};

export const approveRequestedUser = (uid) => {
  removeUserFromRequestedUsers(uid);
  updateRequest({ [`users/${uid}`]: true });
};

export const updateAllowUnrestrictedUsers = (newValue) => {
  updateRequest({ [`allowUnrestrictedUsers`]: newValue });
};

export const setAuthorizationForUser = (uid, newValue) => {
  updateRequest({ [`users/${uid}`]: newValue });
};

export const createSharedRecipe = (
  shareId,
  sharedRecipe,
  recipePath,
  addAlert
) => {
  updateRequest(
    {
      [`shared/${shareId}`]: sharedRecipe,
      [`${recipePath}/shareId`]: shareId,
    },
    () => {
      addAlert({
        message: <Typography>Recipe has been shared with link</Typography>,
        alertProps: { severity: "success" },
      });
    },
    () => {
      addAlert({
        message: <Typography>Error trying to share the recipe</Typography>,
        alertProps: { severity: "error" },
      });
    }
  );
};

export const removeSharedRecipe = (shareId, recipePath, addAlert) => {
  deleteRequest(
    [`shared/${shareId}`, `${recipePath}/shareId`],
    () => {
      addAlert({
        message: <Typography>Succesfully stopped sharing from link</Typography>,
        alertProps: { severity: "success" },
      });
    },
    () => {
      addAlert({
        message: <Typography>Error when trying to stop sharing</Typography>,
        alertProps: { severity: "error" },
      });
    }
  );
};

export const updateLastViewedSharedRecipe = (shareId) => {
  updateRequest(
    {
      [`shared/${shareId}/info/lastViewed`]: Date.now(),
    },
    () => {}
  );
};

export const shareRecipe = async (
  recipe,
  glossary,
  user,
  recipeId,
  cookbookPath,
  addAlert
) => {
  const shareId = createKey("shared");

  const recipeData = transformRecipeForExport(recipe, glossary);
  const userId = user.uid;
  const shareDate = Date.now();

  createSharedRecipe(
    shareId,
    {
      recipeData,
      info: { userId, recipeId, shareDate, lastViewed: 0 },
    },
    `${cookbookPath}/${recipeId}`,
    addAlert
  );
};

export const updateFcmToken = (fcmToken, addAlert) => {
  updateRequest(
    { fcmToken },
    () => {
      addAlert({
        message: <Typography>Saved FCM token</Typography>,
        alertProps: { severity: "success" },
      });
    },
    () => {
      addAlert({
        message: <Typography>Error trying to save FCM token</Typography>,
        alertProps: { severity: "error" },
      });
    }
  );
};
