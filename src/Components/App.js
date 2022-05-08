import { useEffect, useState } from "react";

import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";

import GoogleLoginButton from "./GoogleLoginButton.js";

const signInGoogle = () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
};

function App(props) {
  const { firebaseApp } = props;

  const [user, setUser] = useState(null);
  const [database, setDatabase] = useState(null);
  const [cookboox, setCookbook] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        setUser(user);
      } else {
        console.log("out");
      }
    });
  }, []);

  useEffect(() => {
    const database = getDatabase();

    const cookbookRef = ref(database, "cookbook");
    onValue(cookbookRef, (snapshot) => {
      const data = snapshot.val();
      setCookbook(data);
      console.log(data);
    });
  }, []);

  return (
    <div className="App">
      <h1>Gude Foods</h1>
      <p>Something amazing I guess</p>
      <GoogleLoginButton handleClick={signInGoogle} />
    </div>
  );
}

export default App;
