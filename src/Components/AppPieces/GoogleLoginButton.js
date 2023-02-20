import { useState } from "react";

import { signInGoogle } from "../../utils/signIn";

const constructImageUrl = (type) => `/media/googleLogin/${type}.png`;
const imageSources = {
  NORMAL: constructImageUrl("normal"),
  PRESSED: constructImageUrl("pressed"),
};

function GoogleLoginButton(props) {
  const { addAlert } = props;

  const [buttonImageSource, setButtonImageSource] = useState(
    imageSources.NORMAL
  );

  return (
    <button
      onClick={() => {
        signInGoogle(addAlert);
      }}
      className="googleLoginButton"
      onMouseDown={() => {
        setButtonImageSource(imageSources.PRESSED);
      }}
      onMouseUp={() => {
        setButtonImageSource(imageSources.NORMAL);
      }}
    >
      <img width="180px" src={buttonImageSource} alt="Login with Google" />
    </button>
  );
}

export default GoogleLoginButton;
