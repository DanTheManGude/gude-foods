import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";

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

export const signOutGoogle = (addAlert) => {
  const auth = getAuth();
  const userId = auth.currentUser.uid;
  signOut(auth)
    .then(() => {
      console.log(`logout ${userId}`);
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
