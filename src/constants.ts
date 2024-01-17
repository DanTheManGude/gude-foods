import { ThemeOptions } from "@mui/material/styles";
import { AllColors, ColorKey, Page, DatabasePathKey } from "./types";

export const emailConfig: {
  serviceId: string;
  reportAiTemplateId: string;
  userId: string;
} = process.env.REACT_APP_EMAIL ? JSON.parse(process.env.REACT_APP_EMAIL) : {};

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

const colorOptionNames: { [key in ColorKey]: string } = {
  default: "Default",
  dark: "Dark",
  light: "Light",
};

export const localStorageColorKey = "gude-foods-color";
export const defaultColorKey: ColorKey =
  (localStorage.getItem(localStorageColorKey) as ColorKey) || "default";

export const standardComponentOverridesForTheme: ThemeOptions["components"] = {
  MuiAccordion: {
    defaultProps: {
      disableGutters: true,
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: {
        "&.Mui-expanded": {
          margin: 0,
        },
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        cursor: "pointer",
      },
    },
  },
};

export const allColors: AllColors = {
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
      primary: { main: "#5797db", contrastText: "#1e201e" },
      secondary: { main: "#c86434", contrastText: "#1e201e" },
      tertiary: { main: "#5fb89e", contrastText: "#000" },
      alt: { main: "#FFB800" },
    },
    background: [
      { percent: 0, color: "#151816" },
      { percent: 75, color: "#111513" },
      { percent: 100, color: "#0e110f" },
    ],
  },
  light: {
    palette: {
      mode: "light",
      primary: { main: "#43A7FA", contrastText: "#1e201e" },
      secondary: { main: "#8783D1 ", contrastText: "#1e201e" },
      tertiary: { main: "#77CBB9", contrastText: "#1e201e" },
      alt: { main: "#FFC145" },
    },
    background: [
      { percent: 0, color: "#ffffff" },
      { percent: 25, color: "#f1f1f1" },
      { percent: 100, color: "#ececf1" },
    ],
    components: {
      ...standardComponentOverridesForTheme,
      MuiAccordion: {
        ...(standardComponentOverridesForTheme.hasOwnProperty("MuiAccordion")
          ? standardComponentOverridesForTheme.MuiAccordion
          : {}),
        styleOverrides: {
          root: {
            backgroundColor: "#f2f4f0",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: "#f0eced",
          },
        },
      },
    },
  },
};

export const colorOptions = Object.keys(allColors).map((colorKey) => ({
  key: colorKey,
  name: colorOptionNames[colorKey],
}));

export const databasePaths: { [key in DatabasePathKey]: string } = {
  glossary: "glossary",
  basicFoodTagAssociation: "basicFood-basicFoodTag",
  basicFoodTagOrder: "basicFoodTagOrder",
  shoppingList: "shoppingList",
  cookbook: "cookbook",
  recipeOrder: "recipeOrder",
  menu: "menu",
  colorKey: "colorKey",
};

export const UNKNOWN_TAG = "UNKNOWN_TAG";
export const unknownSectionName = "Unknown Section";

export const pages: Page[] = [
  "home",
  "shoppingList",
  "cookbook",
  "glossary",
  "settings",
];

export const presentationNames: { [key in Page]: string } = {
  glossary: "Glossary",
  shoppingList: "Shopping List",
  cookbook: "Cookbook",
  home: "Home",
  settings: "Settings",
};

export const longestEntryPathDelimiter = "___/___";

export const aboutText = `Gude Foods is a website for you to keep your recipes in an online cookbook. Create and edit your own recipes with your own words.\n\nGude Foods also easily builds a shopping list for you. Select which recipes you want to make, and those ingredients will be added to your shopping list. The shopping list is grouped and orded by the departments that you decide.\n\nStumped thinking of recipe ideas? Gude Foods integrates with modern AI tools to create recipes with your personalized description. The AI integration is completely free to use. Gude Foods also supports importing recipes from the various websites on the web that feature a recipe.`;

export const offlineCookbookKey = "offline-cookbook";
export const hasLoggedInBeforeKey = "hasLoggedInBefore";
