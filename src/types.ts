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

export type Recipe = any;

export type Database = any;
export type DataPaths = any;
