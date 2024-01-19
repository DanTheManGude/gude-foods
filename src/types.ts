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

export type SpecificPathKey<Key extends DatabasePathKey> = `${Key}Path`;
export type DataPathKey = SpecificPathKey<DatabasePathKey>;
export type DataPaths = { [key in DataPathKey]: string };

export type Ingredients = { [key in string]: string };
export type RecipeTagList = string[];

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
export type ShoppingListEntry = {
  isChecked?: boolean;
  collatedAmount?: string;
  list?: string[];
};

export type BasicFoodTags = { [key in string]: string };
export type BasicFoods = { [key in string]: string };
export type RecipeTags = { [key in string]: string };

export type Menu = { [key in string]: string };
export type Glossary = {
  basicFoodTags: BasicFoodTags;
  basicFoods: BasicFoods;
  recipeTags: RecipeTags;
};
export type BasicFoodTagOrder = string[];
export type ShoppingList = { [key in string]: ShoppingListEntry };
export type Cookbook = { [key in string]: Recipe };
export type RecipeOrder = string[];
export type BasicFoodTagAssociation = { [key in string]: string };

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
  [key in string]: { [key in string]: ShoppingListEntry };
};

export type ShoppingMap = {
  checked: ShoppingMapChecked;
  unchecked: ShoppingMapUnchecked;
};

export type FormattedDataFromCookBookImport = {
  formattedCookbook: Cookbook;
  newFoods: BasicFoods;
  newTags: BasicFoodTags;
};

export type RequestedUsers = { [uid in string]: string };

export type SharedRecipe = any;
