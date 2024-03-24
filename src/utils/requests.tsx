import { getDatabase, ref, push, update } from "firebase/database";
import { User } from "firebase/auth";

import Typography from "@mui/material/Typography";

import { databasePaths } from "../constants";
import { transformRecipeForExport } from "./dataTransfer";
import { sendNotification } from "./utility";
import {
  AddAlert,
  ColorKey,
  Cookbook,
  DataPaths,
  FormattedDataFromCookBookImport,
  Glossary,
  IndividualShoppingListFoodInfo,
  Ingredients,
  Menu,
  Recipe,
  RecipeOrder,
  SharedRecipe,
  ShoppingList,
  SupplementalIngredientInfo,
} from "../types";
import { NavigateFunction } from "react-router-dom";

type Updates<V = any> = { [key in string]: V };

export const getCreateFullPath = (uid: string) => (pathName: string) =>
  `accounts/${uid}/${pathName}`;

export const updateRequest = (
  updates: Updates,
  onSuccess: AddAlert = () => {},
  onFailure?: AddAlert
) => {
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

export const deleteRequest = (
  deletePaths: string[] = [],
  onSuccess?: AddAlert,
  onFailure?: AddAlert
) => {
  const updates = deletePaths.reduce<Updates>(
    (acc, path) => ({ ...acc, [path]: null }),
    {}
  );
  updateRequest(updates, onSuccess, onFailure);
};

export const createKey = () => push(ref(getDatabase())).key;

const shoppingListDeletesByRecipe = (
  recipeId: string,
  shoppingList: ShoppingList,
  shoppingListPath: string
): { [key in string]: string } =>
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
  shoppingListDeleteFoodIds: string[],
  recipeId: string,
  shoppingListPath: string,
  shoppingList: ShoppingList
): { [key in string]: string } =>
  shoppingListDeleteFoodIds.reduce(
    (acc, foodId) => ({
      ...acc,
      [`${shoppingListPath}/${foodId}/list/${recipeId}`]:
        shoppingList[foodId].list[recipeId],
    }),
    {}
  );

export const addBasicFoodWithTag = (
  {
    glossaryPath,
    basicFoodTagAssociationPath,
  }: Pick<DataPaths, "glossaryPath" | "basicFoodTagAssociationPath">,
  name: string,
  tagId: string
) => {
  const foodId = createKey();
  const updates: Updates = {};
  updates[`${glossaryPath}/basicFoods/${foodId}`] = name;

  if (tagId) {
    updates[`${basicFoodTagAssociationPath}/${foodId}`] = tagId;
  }

  updateRequest(updates);
  return foodId;
};

export const addRecipeToShoppingList = (
  recipeId: string,
  count: number,
  ingredients: Ingredients = {},
  supplementalIngredientInfo: SupplementalIngredientInfo = {},
  { recipeOrder, menu: _menu }: { recipeOrder: RecipeOrder; menu: Menu },
  {
    shoppingListPath,
    recipeOrderPath,
    menuPath,
  }: Pick<DataPaths, "shoppingListPath" | "recipeOrderPath" | "menuPath">,
  addAlert: AddAlert
) => {
  const menu = _menu || {};

  updateRequest(
    {
      ...Object.keys(ingredients).reduce<
        Updates<IndividualShoppingListFoodInfo>
      >(
        (updates, foodId) => ({
          ...updates,
          [`${shoppingListPath}/${foodId}/list/${recipeId}`]: {
            amount: ingredients[foodId],
            ...(supplementalIngredientInfo[foodId] || {}),
          },
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
                ...Object.keys(ingredients).reduce<Updates>(
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

export const addRecipesToMenu = (
  recipeIdList: string[],
  menu: Menu,
  menuPath: string,
  addAlert: AddAlert
) => {
  updateRequest(
    {
      [menuPath]: {
        ...menu,
        ...recipeIdList.reduce<Updates>(
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
  recipeIdList: string[],
  menuPath: string,
  menu: Menu,
  addAlert: AddAlert
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
  recipeId: string,
  {
    shoppingList,
    cookbook,
    menu,
  }: { shoppingList: ShoppingList; cookbook: Cookbook; menu: Menu },
  {
    menuPath,
    shoppingListPath,
  }: Pick<DataPaths, "menuPath" | "shoppingListPath">,
  addAlert: AddAlert
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

export const updateRecipeMenuCount = (
  recipeId: string,
  count: number,
  menuPath: string
) => {
  updateRequest({ [`${menuPath}/${recipeId}`]: count });
};

export const updateFromCookbookImport = (
  transformedData: FormattedDataFromCookBookImport,
  {
    cookbookPath,
    glossaryPath,
    recipeOrderPath,
  }: Pick<DataPaths, "cookbookPath" | "glossaryPath" | "recipeOrderPath">,
  recipeOrder: RecipeOrder,
  addAlert: AddAlert,
  navigate: NavigateFunction
) => {
  const { formattedCookbook, newFoods, newTags } = transformedData;

  const cookbookUpdates: Updates = Object.keys(formattedCookbook).reduce(
    (acc, recipeId) => ({
      ...acc,
      [`${cookbookPath}/${recipeId}`]: formattedCookbook[recipeId],
    }),
    {}
  );

  const foodUpdates: Updates = Object.keys(newFoods).reduce(
    (acc, foodName) => ({
      ...acc,
      [`${glossaryPath}/basicFoods/${newFoods[foodName]}`]: foodName,
    }),
    {}
  );

  const tagUpdates: Updates = Object.keys(newTags).reduce(
    (acc, tagName) => ({
      ...acc,
      [`${glossaryPath}/recipeTags/${newTags[tagName]}`]: tagName,
    }),
    {}
  );

  const allUpdates: Updates = {
    ...cookbookUpdates,
    ...foodUpdates,
    ...tagUpdates,
    [recipeOrderPath]: [...Object.keys(formattedCookbook), ...recipeOrder],
  };

  const undo = () => {
    const undoCookbookUpdates: Updates = Object.keys(
      formattedCookbook
    ).reduce<Updates>(
      (acc, recipeId) => ({ ...acc, [`${cookbookPath}/${recipeId}`]: null }),
      {}
    );

    const undoFoodUpdates: Updates = Object.keys(newFoods).reduce<Updates>(
      (acc, foodName) => ({
        ...acc,
        [`${glossaryPath}/basicFoods/${newFoods[foodName]}`]: null,
      }),
      {}
    );

    const undoTagUpdates: Updates = Object.keys(newTags).reduce<Updates>(
      (acc, tagName) => ({
        ...acc,
        [`${glossaryPath}/recipeTags/${newTags[tagName]}`]: null,
      }),
      {}
    );

    const undoRequests: Updates = {
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

export const setAllData = (
  fileData: object,
  dataPaths: DataPaths,
  addAlert: AddAlert
) => {
  updateRequest(
    Object.keys(databasePaths).reduce<Updates>(
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
  recipeId: string,
  {
    shoppingList,
    recipeOrder,
    glossary,
  }: {
    shoppingList: ShoppingList;
    recipeOrder: RecipeOrder;
    glossary: Glossary;
  },
  {
    shoppingListPath,
    cookbookPath,
    menuPath,
    recipeOrderPath,
  }: Pick<
    DataPaths,
    "shoppingListPath" | "cookbookPath" | "menuPath" | "recipeOrderPath"
  >,
  addAlert: AddAlert,
  navigate: NavigateFunction,
  recipe: Recipe
) => {
  const shoppingListDeletes = shoppingListDeletesByRecipe(
    recipeId,
    shoppingList,
    shoppingListPath
  );

  const newRecipeOrder = recipeOrder.filter(
    (_recipeId) => recipeId !== _recipeId
  );

  updateRequest(
    [
      `${cookbookPath}/${recipeId}`,
      `${menuPath}/${recipeId}`,
      ...Object.values(shoppingListDeletes),
    ].reduce<Updates>((acc, deletePath) => ({ ...acc, [deletePath]: null }), {
      [recipeOrderPath]: newRecipeOrder,
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
              { recipeOrder: newRecipeOrder, glossary, shoppingList },
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
  { shoppingListPath }: Pick<DataPaths, "shoppingListPath">,
  { glossary }: { glossary: Glossary },
  basicFoodId: string,
  newChecked: boolean,
  addAlert: AddAlert
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
  recipe: Recipe,
  _recipeId: string,
  {
    cookbookPath,
    recipeOrderPath,
    shoppingListPath,
    menuPath,
  }: Pick<
    DataPaths,
    "shoppingListPath" | "cookbookPath" | "menuPath" | "recipeOrderPath"
  >,
  {
    recipeOrder,
    glossary,
    shoppingList,
  }: {
    recipeOrder: RecipeOrder;
    glossary: Glossary;
    shoppingList: ShoppingList;
  },
  addAlert: AddAlert,
  successHandler: () => void,
  navigate: NavigateFunction,
  maybeOldRecipe?: Recipe,
  maybeNotificationInfo?: { isAdmin: boolean; displayName: string }
) => {
  const {
    name,
    instructions,
    ingredients = {},
    shareId,
    supplementalIngredientInfo = {},
  } = recipe;
  const isCreating: boolean = !_recipeId;

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
    recipeId = createKey();
  }

  const refinedSupplementalIngredientInfo: SupplementalIngredientInfo =
    Object.entries(supplementalIngredientInfo).reduce(
      (acc, [ingredientId, individualInfo]) => {
        if (!ingredients.hasOwnProperty(ingredientId)) {
          return acc;
        }
        if (
          individualInfo.substitution ||
          supplementalIngredientInfo[ingredientId].isOptional
        ) {
          return { ...acc, [ingredientId]: individualInfo };
        }
        return acc;
      },
      {}
    );

  recipe.supplementalIngredientInfo = refinedSupplementalIngredientInfo;

  const updates: Updates = {
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

      if (
        maybeNotificationInfo &&
        !maybeNotificationInfo.isAdmin &&
        isCreating
      ) {
        sendNotification(
          {
            title: "New recipe!",
            body: `${maybeNotificationInfo.displayName} created ${name}.`,
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
  const newKey = createKey();

  updateRequest(
    { [`${pathRoot}/${newKey}`]: tagName },
    () => {
      successHandler(newKey);
    },
    console.error
  );
};

export const uploadColors = (
  colorsPath: string,
  colorKey: ColorKey,
  addAlert: AddAlert
) => {
  updateRequest({ [colorsPath]: colorKey }, addAlert, addAlert);
};

export const sendAuthorizationRequest = (user: User, addAlert: AddAlert) => {
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

export const removeUserFromRequestedUsers = (uid: string) => {
  deleteRequest([`requestedUsers/${uid}`]);
};

export const approveRequestedUser = (uid: string) => {
  removeUserFromRequestedUsers(uid);
  updateRequest({ [`users/${uid}`]: true });
};

export const updateAllowUnrestrictedUsers = (newValue: boolean) => {
  updateRequest({ [`allowUnrestrictedUsers`]: newValue });
};

export const setAuthorizationForUser = (uid: string, newValue: boolean) => {
  updateRequest({ [`users/${uid}`]: newValue });
};

export const createSharedRecipe = (
  shareId: string,
  sharedRecipe: SharedRecipe,
  recipePath: string,
  addAlert: AddAlert
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

export const removeSharedRecipe = (
  shareId: string,
  recipePath: string,
  addAlert: AddAlert
) => {
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

export const updateLastViewedSharedRecipe = (shareId: string) => {
  updateRequest(
    {
      [`shared/${shareId}/info/lastViewed`]: Date.now(),
    },
    () => {}
  );
};

export const shareRecipe = async (
  recipe: Recipe,
  glossary: Glossary,
  user: User,
  recipeId: string,
  cookbookPath: string,
  addAlert: AddAlert
) => {
  const shareId = createKey();

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

export const updateFcmToken = (fcmToken: string, addAlert: AddAlert) => {
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

export const swapSubstitutionInShoppingList = (
  shoppingListPath: string,
  basicFoodId: string,
  recipeId: string,
  foodInfo: IndividualShoppingListFoodInfo,
  onSuccess: () => void,
  onFailure: AddAlert
) => {
  const newFoodInfo: IndividualShoppingListFoodInfo = {
    amount: foodInfo.substitution.amount,
    substitution: { foodId: basicFoodId, amount: foodInfo.amount },
    ...(foodInfo.isOptional ? { isOptional: true } : {}),
  };
  updateRequest(
    {
      [`${shoppingListPath}/${basicFoodId}/list/${recipeId}`]: null,
      [`${shoppingListPath}/${foodInfo.substitution.foodId}/list/${recipeId}`]:
        newFoodInfo,
    },
    onSuccess,
    onFailure
  );
};

export const giveReadAccesForCollaboration = (
  uid: string,
  collaborationPath: string,
  onSuccess: () => void,
  onFailure: AddAlert
) => {
  updateRequest(
    {
      [`${collaborationPath}/${uid}/read`]: true,
    },
    onSuccess,
    onFailure
  );
};

export const revokeAccesForCollaboration = (
  uid: string,
  collaborationPath: string,
  onSuccess: () => void,
  onFailure: AddAlert
) => {
  updateRequest(
    {
      [`${collaborationPath}/${uid}`]: null,
    },
    onSuccess,
    () =>
      onFailure({
        alertProps: { severity: "error" },
        message: (
          <Typography>Was not able to remove access for {uid}</Typography>
        ),
      })
  );
};
