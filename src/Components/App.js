import { useEffect, useState } from "react";

import { Routes, Route } from "react-router-dom";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";

import Home from "./Home";
import CookbookContainer from "./cookbook/CookbookContainer";
import BasicFoodsContainer from "./basicFoods/BasicFoodsContainer";
import ShoppingListContainer from "./shoppingList/ShoppingListContainer";
import DictionaryContainer from "./dictionary/DictionaryContainer";

import NavBar from "./NavBar";

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
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cookbook" element={<CookbookContainer />} />
        <Route path="basicFoods" element={<BasicFoodsContainer />} />
        <Route path="shoppingList" element={<ShoppingListContainer />} />
        <Route path="dictionary" element={<DictionaryContainer />} />
      </Routes>
    </div>
  );
}

export default App;
