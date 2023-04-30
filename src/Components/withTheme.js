import { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";

import { defaultPalette } from "../constants";
import { constructTheme } from "../utils/values";
import { PaletteContext } from "./Contexts";

const withTheme = (Component) => (props) => {
  const paletteValue = useState(defaultPalette);
  return (
    <ThemeProvider theme={constructTheme(paletteValue[0])}>
      <PaletteContext.Provider value={paletteValue}>
        <Component {...props} />
      </PaletteContext.Provider>
    </ThemeProvider>
  );
};

export default withTheme;
