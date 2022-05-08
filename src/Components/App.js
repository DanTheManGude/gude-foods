import { useEffect, useState } from "react";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";

import GoogleLoginButton from "./GoogleLoginButton.js";

function App() {
  const [user, setUser] = useState();
  const [cookbook, setCookbook] = useState();
  const [basicFoods, setBasicFoods] = useState();
  const [names, setNames] = useState();
  const [shoppingList, setShoppingList] = useState();

  useEffect(() => {
    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        console.log(user.displayName);
      } else {
        console.log("log out");
      }
      setUser(user);
    });
  }, []);

  useEffect(() => {
    const database = getDatabase();

    onValue(ref(database, "cookbook"), (snapshot) => {
      setCookbook(snapshot.val());
    });

    onValue(ref(database, "basicFoods"), (snapshot) => {
      setBasicFoods(snapshot.val());
    });

    onValue(ref(database, "names"), (snapshot) => {
      setNames(snapshot.val());
    });

    onValue(ref(database, "shoppingList"), (snapshot) => {
      setShoppingList(snapshot.val());
    });
  }, []);

  return (
    <div className="App">
      <h1>Gude Foods</h1>
      <p>Something amazing I guess</p>
      <GoogleLoginButton />
    </div>
  );
}

export default App;
