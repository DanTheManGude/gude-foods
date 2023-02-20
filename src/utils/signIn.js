import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export const signInGoogle = (addAlert) => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
    .then((result) => {
      console.log(`login ${result.user.uid}`);
    })
    .catch((error) => {
      const { name, code } = error;
      addAlert({
        message: code,
        title: name,
        alertProps: { severity: "error" },
      });
    });
};
