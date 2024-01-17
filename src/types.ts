import { ThemeOptions } from "@mui/material";
import { AlertProps } from "@mui/material/Alert";

export type Noop = () => void;

export type ColorKey = "default" | "dark" | "light";

export type Theme = {
  palette: ThemeOptions["palette"] & {
    tertiary: ThemeOptions["palette"]["secondary"];
    alt: ThemeOptions["palette"]["secondary"];
  };
  background: { percent: number; color: `#${string}` }[];
  components?: ThemeOptions["components"];
};

export type AllColors = {
  [key in ColorKey]: Theme;
};

export type Alert = {
  message: JSX.Element;
  title?: JSX.Element;
  alertProps: Partial<AlertProps>;
};
export type AddAlert = (alert: Alert, time?: number) => void;

export type ReportErrorValues = {
  promptText: string;
  response: string;
  error: string;
  who: string;
};

export type Page =
  | "glossary"
  | "shoppingList"
  | "cookbook"
  | "home"
  | "settings";

export type DatabasePathKey =
  | "menu"
  | "glossary"
  | "basicFoodTagOrder"
  | "shoppingList"
  | "cookbook"
  | "recipeOrder"
  | "colorKey"
  | "basicFoodTagAssociation";

export type DataPathKey = `${DatabasePathKey}Path`;
export type DataPaths = { [key in DataPathKey]: string };

type RecipeId = string;
type BasicFoodId = string;
type BasicFoodTagId = string;
type RecipeTagId = string;

export type Recipe = {
  name: string;
  description?: string;
  ingredients: { [key in BasicFoodId]: string };
  instructions: string[];
  notes?: string;
  tags?: RecipeTagId[];
  isFavorite?: boolean;
  shareId?: string;
};

export type ShoppingListEntry = {
  isChecked?: boolean;
  collatedAmount?: string;
  list?: RecipeTagId[];
};

export type Menu = { [key in RecipeId]: number };
export type Glossary = {
  basicFoodTags: { [key in BasicFoodTagId]: string };
  basicFoods: { [key in BasicFoodId]: string };
  recipeTags: { [key in RecipeTagId]: string };
};
export type BasicFoodTagOrder = BasicFoodTagId[];
export type ShoppingList = { [key in BasicFoodId]: ShoppingListEntry };
export type Cookbook = { [key in RecipeId]: Recipe };
export type RecipeOrder = RecipeId[];
export type BasicFoodTagAssociation = { [key in BasicFoodId]: BasicFoodTagId };

export type Database = {
  menu?: Menu;
  glossary?: Glossary;
  basicFoodTagOrder?: BasicFoodTagOrder;
  shoppingList?: ShoppingList;
  cookbook?: Cookbook;
  recipeOrder?: RecipeOrder;
  colorKey?: ColorKey;
  basicFoodTagAssociation?: BasicFoodTagAssociation;
};

export type ExternalRecipe = Recipe & { ingredientText: string[] };

export type ShoppingMapChecked = any;
export type ShoppingMapUnchecked = {
  [basicFoodTagId in BasicFoodTagId]: {
    [key in BasicFoodId]: ShoppingListEntry;
  };
};

export type ShoppingMap = {
  checked: ShoppingMapChecked;
  unchecked: ShoppingMapUnchecked;
};
