export const captchaSiteKey = "6LckpNMfAAAAAAQU4bt6WgEnUgFBHTzhDzQNPAmK";

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
    background: [{ percent: 0, color: "#000000" }],
  },
  light: {
    palette: {
      mode: "light",
      primary: { main: "#ffad76" },
      secondary: { main: "#AF7ADB", contrastText: "#1e201e" },
      tertiary: { main: "#79B2A8", contrastText: "#000" },
      alt: { main: "#D6D365" },
    },
    background: [{ percent: 0, color: "#ffffff" }],
  },
};

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

export const emailConfig = {
  serviceId: "service_sbv0ia4",
  templateId: "template_214p9la",
  userId: "user_2K4sBJkaEW2m7T8CPrYhp",
};

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
