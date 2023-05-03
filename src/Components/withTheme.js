import { useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";

import { defaultColorKey, allColors } from "../constants";
import { constructTheme, constructBackgroundStyleText } from "../utils/utility";
import { ColorKeyContext } from "./Contexts";

const withTheme = (Component) => (props) => {
  const [colorKey, setColorKey] = useState(defaultColorKey);

  const validColorKey = allColors.hasOwnProperty(colorKey)
    ? colorKey
    : defaultColorKey;

  const { palette, background } = allColors[validColorKey];

  useEffect(() => {
    document
      .getElementsByName("theme-color")[0]
      .setAttribute("content", background[0].color);

    document.documentElement.style.background =
      constructBackgroundStyleText(background);
  }, [background]);

  return (
    <ThemeProvider theme={constructTheme(palette)}>
      <ColorKeyContext.Provider value={setColorKey}>
        <Component {...props} />
      </ColorKeyContext.Provider>
    </ThemeProvider>
  );
};

export default withTheme;
