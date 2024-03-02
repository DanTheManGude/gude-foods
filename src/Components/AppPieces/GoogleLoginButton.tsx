import { useState, useEffect } from "react";

import { Theme, useTheme } from "@mui/material/styles";

import { signInGoogle } from "../../utils/googleAuth";
import { AddAlert } from "../../types";

type ButtonType = "normal" | "pressed";

const constructImageUrl = (theme: Theme, type: ButtonType) =>
  `/media/googleLogin/${theme.palette.mode}-${type}.png`;

function GoogleLoginButton(props: { addAlert: AddAlert }) {
  const { addAlert } = props;
  const theme = useTheme();

  const [buttonImageSource, setButtonImageSource] = useState(
    constructImageUrl(theme, "normal")
  );
  const updateButtonImageSource = (type: ButtonType) =>
    setButtonImageSource(constructImageUrl(theme, type));

  useEffect(() => {
    setButtonImageSource(constructImageUrl(theme, "normal"));
  }, [theme]);

  return (
    <button
      onClick={() => {
        signInGoogle(addAlert);
      }}
      className="googleLoginButton"
      onMouseDown={() => {
        updateButtonImageSource("pressed");
      }}
      onMouseUp={() => {
        updateButtonImageSource("normal");
      }}
    >
      <img width="180px" src={buttonImageSource} alt="Login with Google" />
    </button>
  );
}

export default GoogleLoginButton;
