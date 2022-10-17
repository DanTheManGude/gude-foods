import { getDatabase, ref, child, push, update } from "firebase/database";
import { createTheme } from "@mui/material/styles";
import { fontFamilies } from "./constants";

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

export const constructTheme = () =>
  createTheme({
    palette: {
      mode: "dark",
      primary: { main: "#ffad76" },
      secondary: { main: "#AF7ADB", contrastText: "#1e201e" },
      tertiary: { main: "#79B2A8", contrastText: "#000" },
      alt: { main: "#D6D365" },
    },
    typography: {
      fontFamily: fontFamilies.join(","),
    },
  });

export const getEmailLink = ({ displayName, email }) =>
  `mailto:dgude31@outlook.com?subject=Gude%20Foods%20Authirization&body=Hello%2C%0D%0A%0D%0AI%20would%20like%20to%20have%20access%20to%20the%20Gude%20Foods%20website%20functionality%2C%20but%20the%20request%20button%20did%20not%20work.%20My%20name%20is%2C%20${displayName}%2C%20and%20my%20email%20is%2C%20${email}.%0D%0A%0D%0AThhank%20you!`;
