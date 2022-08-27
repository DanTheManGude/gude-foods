import { getDatabase, ref, child, push, update } from "firebase/database";

const presentationNames = {
  cookbook: "Cookbook",
  basicFoods: "Basic Foods",
  shoppingList: "Shopping List",
  glossary: "Glossary",
  basicFoodTags: "Basic Food Tags",
  recipeTags: "Recipe Tags",
};

export const getPresentationName = (key) => presentationNames[key];

export const updateRequest = (updates, addAlert = () => {}) => {
  update(ref(getDatabase()), updates)
    .then(() => {
      addAlert({
        message: <span>Succesfully completed updates.</span>,
        alertProps: { severity: "success" },
      });
    })
    .catch(() => {
      addAlert({
        message: "The request did not go through.",
        title: "Error",
        alertProps: { severity: "error" },
      });
    });
};

export const deleteRequest = (deletePaths = [], addAlert) => {
  const updates = deletePaths.reduce(
    (acc, path) => ({ ...acc, [path]: null }),
    {}
  );
  updateRequest(updates, addAlert);
};

export const createKey = (path) => push(child(ref(getDatabase()), path)).key;
