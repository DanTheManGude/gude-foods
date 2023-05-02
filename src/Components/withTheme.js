import { useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";

import { defaultColors } from "../constants";
import { constructTheme, constructBackgroundStyleText } from "../utils/utility";
import { ColorsUpdateContext } from "./Contexts";

const withTheme = (Component) => (props) => {
  const [colors, setColors] = useState(defaultColors);
  const { palette, background } = colors;

  useEffect(() => {
    document.documentElement.style.background =
      constructBackgroundStyleText(background);
    document.documentElement.style.backgroundColor = background[0].color;
    document.documentElement.style.backgroundAttachment = "fixed";
  }, [background]);

  return (
    <ThemeProvider theme={constructTheme(palette)}>
      <ColorsUpdateContext.Provider value={setColors}>
        <Component {...props} />
      </ColorsUpdateContext.Provider>
    </ThemeProvider>
  );
};

export default withTheme;
