import { useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";

import { defaultColors } from "../constants";
import { constructTheme, constructBackgroundStyleText } from "../utils/utility";
import { ColorsContext } from "./Contexts";

const withTheme = (Component) => (props) => {
  const colorsValue = useState(defaultColors);
  const { palette, background } = colorsValue[0];

  useEffect(() => {
    document.documentElement.style.background =
      constructBackgroundStyleText(background);
    document.documentElement.style.backgroundColor = background[0].color;
    document.documentElement.style.backgroundAttachment = "fixed";
  }, [background]);

  return (
    <ThemeProvider theme={constructTheme(palette)}>
      <ColorsContext.Provider value={colorsValue}>
        <Component {...props} />
      </ColorsContext.Provider>
    </ThemeProvider>
  );
};

export default withTheme;
