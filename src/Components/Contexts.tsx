import { createContext } from "react";
import { User } from "firebase/auth";

import { AddAlert, ColorKey, DataPaths, Database } from "../types";
import { defaultColorKey } from "../constants";

export const DatabaseContext = createContext<Database>({});
export const DataPathsContext = createContext<DataPaths>({});
export const AddAlertContext = createContext<AddAlert>(() => {});
export const ColorKeyContext = createContext<() => ColorKey>(
  () => defaultColorKey
);
export const UserContext = createContext<User>(undefined);
