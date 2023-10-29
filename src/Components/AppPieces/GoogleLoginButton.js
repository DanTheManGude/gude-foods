import { useState, useEffect } from "react";

import { useTheme } from "@mui/material/styles";

import { signInGoogle } from "../../utils/googleAuth";

const constructImageUrl = (theme, type) =>
  `/media/googleLogin/${theme.palette.mode}-${type}.png`;

function GoogleLoginButton(props) {
  const { addAlert } = props;
  const theme = useTheme();

  const [buttonImageSource, setButtonImageSource] = useState(
    constructImageUrl(theme, "normal")
  );
  const updateButtonImageSource = (type) =>
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
