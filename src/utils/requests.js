import { getDatabase, ref, child, push, update } from "firebase/database";
import emailjs from "@emailjs/browser";
import Typography from "@mui/material/Typography";

import { databasePaths, emailConfig } from "../constants";
import { getEmailLink } from "./utility";
import { transformRecipeForExport } from "./dataTransfer";

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

export const shoppingListDeletesByRecipe = (
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
        .map((foodId) => `${shoppingListPath}/${foodId}/list/${recipeId}`)
    : [];

export const addRecipeToShoppingList = (
  recipeId,
  ingredients,
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
        [recipeId]: menu.hasOwnProperty(recipeId) ? menu[recipeId] + 1 : 1,
      },
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
    addAlert
  );
};

export const removeRecipesFromMenu = (recipeIdList, menuPath, addAlert) => {
  deleteRequest(
    recipeIdList.map((recipeId) => `${menuPath}/${recipeId}`),
    addAlert
  );
};

export const removeRecipeFromMenuAndShoppingList = (
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

export const updateFromCookbookImport = (
  transformedData,
  { cookbookPath, glossaryPath, recipeOrderPath },
  recipeOrder,
  addAlert
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

  updateRequest(
    {
      ...cookbookUpdates,
      ...foodUpdates,
      ...tagUpdates,
      [recipeOrderPath]: [...Object.keys(formattedCookbook), ...recipeOrder],
    },
    addAlert
  );
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

export const saveRecipe = (
  recipe,
  _recipeId,
  { cookbookPath, recipeOrderPath },
  { recipeOrder, glossary },
  addAlert,
  successHandler,
  navigate
) => {
  const { name, instructions, ingredients, shareId } = recipe;
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
      addAlert(successAlert);
      navigate(`/recipe/${recipeId}`);
    },
    addAlert
  );
};

export const createRecipeTag = (glossaryPath, successHandler, tagName) => {
  const pathRoot = `${glossaryPath}/recipeTags`;
  const newKey = createKey(pathRoot);

  updateRequest(
    { [`${pathRoot}/${newKey}`]: tagName },
    (successAlert) => {
      successHandler(newKey);
    },
    console.error
  );
};

export const uploadColors = (colorsPath, colorKey, addAlert) => {
  updateRequest(
    { [colorsPath]: colorKey },
    (successAlert) => {
      addAlert(successAlert);
    },
    addAlert
  );
};

const sendAuthorizationEmail = (userInfo, addAlert) => {
  const { serviceId, authorizationEmailTemplateId, userId } = emailConfig;

  emailjs.send(serviceId, authorizationEmailTemplateId, userInfo, userId).then(
    (response) => {
      addAlert(
        {
          message: (
            <Typography>
              Succesfully sent authorization request. You should recieve a
              confirmation email shortly (be sure to check your junk folder).
            </Typography>
          ),
          alertProps: { severity: "success" },
        },
        5000
      );
    },
    (error) => {
      addAlert(
        {
          message: (
            <Typography>
              An error occured when sending authorization request. You can reach
              out to&nbsp;
              <a href={getEmailLink(userInfo)}>dgude31@outlook.com</a>
              &nbsp;directly.
            </Typography>
          ),
          alertProps: { severity: "error" },
        },
        7000
      );
    }
  );
};

export const sendAuthorizationRequest = (user, addAlert) => {
  const { displayName, email, uid } = user;
  const userInfo = { displayName, email };

  updateRequest({ [`requestedUsers/${uid}`]: displayName });

  sendAuthorizationEmail(userInfo, addAlert);
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
