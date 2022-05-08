import { useState } from "react";

import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const constructImageUrl = (type) => `/media/googleLogin/${type}.png`;
const imageSources = {
  NORMAL: constructImageUrl("normal"),
  PRESSED: constructImageUrl("pressed"),
};

const signInGoogle = () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
    .then((result) => {
      console.log(`login in ${result.user.displayName}`);
    })
    .catch(console.error);
};

function GoogleLoginButton(props) {
  const [buttonImageSource, setButtonImageSource] = useState(
    imageSources.NORMAL
  );

  return (
    <button
      onClick={signInGoogle}
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
