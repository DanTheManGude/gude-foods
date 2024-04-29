import { ThemeOptions } from "@mui/material";
import { AlertProps } from "@mui/material/Alert";
import { collaborationEditKeys } from "./constants";

export type GenericEntries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type SetSubsriber = (newSubscriber: () => void) => void;

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
  undo?: () => void;
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
  | "basicFoodTagAssociation"
  | "collaboration";

export type SpecificPathKey<Key extends DatabasePathKey> = `${Key}Path`;
export type DataPathKey = SpecificPathKey<DatabasePathKey>;
export type DataPaths = { [key in DataPathKey]: string };

export type Ingredients = { [key in string]: string };
export type RecipeTagList = string[];
export type IndividualSupplementalIngredientInfo = {
  isOptional?: boolean;
  substitution?: { foodId: string; amount: string };
};
export type SupplementalIngredientInfo = {
  [key in string]?: IndividualSupplementalIngredientInfo;
};

export type Recipe = {
  name: string;
  description?: string;
  ingredients: Ingredients;
  instructions: string[];
  notes?: string;
  tags?: RecipeTagList;
  isFavorite?: boolean;
  shareId?: string;
  supplementalIngredientInfo?: SupplementalIngredientInfo;
};

export type IndividualShoppingListFoodInfo = {
  amount: string;
} & IndividualSupplementalIngredientInfo;

export type ShoppingListEntry = {
  isChecked?: boolean;
  collatedAmount?: string;
  list?: {
    [key in string]: IndividualShoppingListFoodInfo;
  };
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

export type CollaborationEditKey = (typeof collaborationEditKeys)[number];
export type CollaborationEdits = {
  [key in CollaborationEditKey]?: boolean;
};
export type CollaborationEntry = { read: boolean; edit?: CollaborationEdits };
export type CollaborationMap = { [uid in string]: CollaborationEntry };
export type Collaboration = {
  givesAccessTo?: CollaborationMap;
  hasAccessTo?: CollaborationMap;
  names?: { [key: string]: string };
};

export type Database = {
  menu?: Menu;
  glossary?: Glossary;
  basicFoodTagOrder?: BasicFoodTagOrder;
  shoppingList?: ShoppingList;
  cookbook?: Cookbook;
  recipeOrder?: RecipeOrder;
  colorKey?: ColorKey;
  basicFoodTagAssociation?: BasicFoodTagAssociation;
  collaboration?: Collaboration;
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

export type SharedRecipeInfo = {
  lastViewed: number;
  recipeId: string;
  shareDate: number;
  userId: string;
};
export type SharedRecipe = { info: SharedRecipeInfo; recipeData: Recipe };

export type SharedRecipes = { [id in string]: SharedRecipe };

export type FilteringOptions = Partial<{
  searchTerm: string;
  ingredientsList: string[];
  tagsList: string[];
  isFavoriteFilter: boolean;
}>;

export type ActingUser = {
  uid: string;
  displayName: string;
  isAuthorized: boolean;
  basicFoodsCount: number;
  recipeCount: number;
};

export type Accounts = {
  [uid in string]: {
    ["basicFood-basicFoodTag"]?: BasicFoodTagAssociation;
    basicFoodTagOrder?: BasicFoodTagOrder;
    colorKey?: ColorKey;
    cookbook?: Cookbook;
    glossary?: Glossary;
    menu?: Menu;
    name: string;
    recipeOrder?: RecipeOrder;
    shoppingList?: ShoppingList;
  };
};
