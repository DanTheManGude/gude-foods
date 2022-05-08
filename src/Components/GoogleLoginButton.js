import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

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
  return (
    <button
      onClick={signInGoogle}
      className="googleLoginButton"
      style={{
        backgroundSize: "cover",
        backgroundImage: `${process.env.PUBLIC_URL}/media/googleLogin/signin_light_normal.png`,
        "&:hover": {
          backgroundImage: `${process.env.PUBLIC_URL}/media/googleLogin/signin_focus_normal.png`,
        },
        "&:active": {
          backgroundImage: `${process.env.PUBLIC_URL}/media/googleLogin/signin_pressed_normal.png`,
        },
      }}
    />
  );
}

export default GoogleLoginButton;
