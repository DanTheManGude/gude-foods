import { createContext } from "react";

export const DatabaseContext = createContext({});
export const DataPathsContext = createContext({});
export const AddAlertContext = createContext(() => {});
export const ColorsUpdateContext = createContext([{}, () => {}]);
