export const emailConfig = JSON.parse(process.env.REACT_APP_EMAIL);

export const fontFamilies = [
  "Dosis",
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Roboto",
  "Oxygen",
  "Ubuntu",
  "Cantarell",
  "Fira Sans",
  "Droid Sans",
  "Helvetica Neue",
  "sans-serif",
];

export const defaultColorKey = "default";

export const allColors = {
  default: {
    palette: {
      mode: "dark",
      primary: { main: "#ffad76" },
      secondary: { main: "#AF7ADB", contrastText: "#1e201e" },
      tertiary: { main: "#79B2A8", contrastText: "#000" },
      alt: { main: "#D6D365" },
    },
    background: [
      { percent: 0, color: "#283868" },
      { percent: 75, color: "#102257" },
      { percent: 100, color: "#0e1f4e" },
    ],
  },
  dark: {
    palette: {
      mode: "dark",
      primary: { main: "#ffad76" },
      secondary: { main: "#AF7ADB", contrastText: "#1e201e" },
      tertiary: { main: "#79B2A8", contrastText: "#000" },
      alt: { main: "#D6D365" },
    },
    background: [
      { percent: 0, color: "#333333" },
      { percent: 75, color: "#111111" },
      { percent: 100, color: "#000000" },
    ],
  },
  light: {
    palette: {
      mode: "light",
      primary: { main: "#ffad76" },
      secondary: { main: "#AF7ADB", contrastText: "#1e201e" },
      tertiary: { main: "#79B2A8", contrastText: "#000" },
      alt: { main: "#D6D365" },
    },
    background: [
      { percent: 0, color: "#ffffff" },
      { percent: 25, color: "#dddddd" },
      { percent: 100, color: "#eeeeee" },
    ],
  },
};

const colorOptionNames = { default: "Default", dark: "Dark", light: "Light" };

export const colorOptions = Object.keys(allColors).map((colorKey) => ({
  key: colorKey,
  name: colorOptionNames[colorKey],
}));

export const databasePaths = {
  glossary: "glossary",
  basicFoodTagAssociation: "basicFood-basicFoodTag",
  basicFoodTagOrder: "basicFoodTagOrder",
  shoppingList: "shoppingList",
  cookbook: "cookbook",
  recipeOrder: "recipeOrder",
  menu: "menu",
  openAIKey: "openAIKey",
  colorKey: "colorKey",
};

export const UNKNOWN_TAG = "UNKNOWN_TAG";
export const unknownSectionName = "Unknown Section";

export const presentationNames = {
  glossary: "Glossary",
  shoppingList: "Shopping List",
  cookbook: "Cookbook",
  home: "Home",
  settings: "Settings",
};

export const pages = [
  "glossary",
  "shoppingList",
  "cookbook",
  "home",
  "settings",
];
