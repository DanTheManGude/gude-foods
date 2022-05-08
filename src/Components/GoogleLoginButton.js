import { useState } from "react";

import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const constructImageUrl = (type) =>
  `/media/googleLogin/signin_light_${type}.png`;
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

function GoogleLoginButton() {
  const [imageSource, setImageSource] = useState(imageSources.NORMAL);

  return (
    <button
      onClick={signInGoogle}
      className="googleLoginButton"
      onMouseDown={() => {
        setImageSource(imageSources.PRESSED);
      }}
      onMouseUp={() => {
        setImageSource(imageSources.NORMAL);
      }}
    >
      <img src={imageSource} />
    </button>
  );
}

export default GoogleLoginButton;
