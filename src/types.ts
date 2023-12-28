import { AlertProps } from "@mui/material/Alert";

export type Noop = () => void;

export type ColorKey = "default" | "dark" | "light";

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

export type Recipe = any;

export type Database = any;
export type DataPaths = any;
