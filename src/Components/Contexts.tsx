import { createContext } from "react";
import { User } from "firebase/auth";

import { AddAlert, ColorKey, DataPaths, Database } from "../types";
import { defaultColorKey, defaultDataPaths } from "../constants";

export const DatabaseContext = createContext<Database>({});
export const DataPathsContext = createContext<DataPaths>(defaultDataPaths);
export const AddAlertContext = createContext<AddAlert>(() => {});
export const ColorKeyContext = createContext<(colorKey: ColorKey) => void>(
  () => defaultColorKey
);
export const UserContext = createContext<User>(undefined);
export const AdminContext = createContext<boolean>(false);
