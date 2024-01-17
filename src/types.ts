import { ThemeOptions } from "@mui/material";
import { AlertProps } from "@mui/material/Alert";

export type Noop = () => void;

export type SetSubsriber = (newSubscriber: Noop) => void;

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
  dismissible?: boolean;
  undo?: Noop;
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

export type RecipeId = string;
export type BasicFoodId = string;
export type BasicFoodTagId = string;
export type RecipeTagId = string;

export type Ingredients = { [key in BasicFoodId]: string };
export type RecipeTagList = RecipeTagId[];

export type Recipe = {
  name: string;
  description?: string;
  ingredients: Ingredients;
  instructions: string[];
  notes?: string;
  tags?: RecipeTagList;
  isFavorite?: boolean;
  shareId?: string;
};
export type RecipeData = Recipe;
export type CookbookData = { [name in string]: RecipeData };

export type ShoppingListEntry = {
  isChecked?: boolean;
  collatedAmount?: string;
  list?: RecipeTagId[];
};

export type BasicFoodTags = { [key in BasicFoodTagId]: string };
export type BasicFoods = { [key in BasicFoodId]: string };
export type RecipeTags = { [key in RecipeTagId]: string };

export type Menu = { [key in RecipeId]: number };
export type Glossary = {
  basicFoodTags: BasicFoodTags;
  basicFoods: BasicFoods;
  recipeTags: RecipeTags;
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

export type RequestedUsers = { [uid in string]: string };
