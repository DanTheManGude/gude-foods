import { AlertProps } from "@mui/material/Alert";

export type ColorKey = "default" | "dark" | "light";

export type Alert = {
  message: JSX.Element;
  title?: JSX.Element;
  alertProps: Partial<AlertProps>;
};
export type AddAlert = (alert: Alert, time?: number) => void;
