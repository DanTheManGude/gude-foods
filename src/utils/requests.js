import { getDatabase, ref, child, push, update } from "firebase/database";
import emailjs from "@emailjs/browser";

import { databasePaths, emailConfig } from "../constants";
import { getEmailLink } from "./utility";

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
  recipeId,
  { recipeOrder, menu: _menu, cookbook },
  { shoppingListPath, recipeOrderPath, menuPath },
  addAlert
) => {
  const menu = _menu || {};
  const ingredients = cookbook[recipeId];

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
  recipeOrder,
  addAlert,
  successHandler,
  navigate
) => {
  const { name, instructions, ingredients } = recipe;
  const isCreating = !_recipeId;

  if (
    !(
      !!name.length &&
      !!instructions.length &&
      !!Object.keys(ingredients).length
    )
  ) {
    addAlert({
      message: <span>Please fill out the required fields.</span>,
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
            <span>
              Succesfully sent authorization request. You should recieve a
              confirmation email shortly (be sure to check your junk folder).
            </span>
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
            <span>
              An error occured when sending authorization request. You can reach
              out to&nbsp;
              <a href={getEmailLink(userInfo)}>dgude31@outlook.com</a>
              &nbsp;directly.
            </span>
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
