import { useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";

import {
  defaultColorKey,
  allColors,
  localStorageColorKey,
  standardComponentOverridesForTheme,
} from "../constants";
import { constructTheme, constructBackgroundStyleText } from "../utils/utility";
import { ColorKeyContext } from "./Contexts";
import { ColorKey } from "../types";

const withTheme =
  (Component: (...args: any[]) => JSX.Element) =>
  (props: { [key: string]: any }) => {
    const [colorKey, setColorKey] = useState<ColorKey>(defaultColorKey);

    const updateColors = (newColorKey: ColorKey) => {
      setColorKey(newColorKey);
      localStorage.setItem(localStorageColorKey, newColorKey);
    };

    const validColorKey = allColors.hasOwnProperty(colorKey)
      ? colorKey
      : defaultColorKey;

    const {
      palette,
      background,
      components = standardComponentOverridesForTheme,
    } = allColors[validColorKey];

    useEffect(() => {
      document
        .getElementsByName("theme-color")[0]
        .setAttribute("content", background[0].color);

      document.documentElement.style.background =
        constructBackgroundStyleText(background);
    }, [background]);

    return (
      <ThemeProvider theme={constructTheme(palette, components)}>
        <ColorKeyContext.Provider value={updateColors}>
          <Component {...props} />
        </ColorKeyContext.Provider>
      </ThemeProvider>
    );
  };

export default withTheme;
