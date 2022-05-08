import { useEffect, useState } from "react";

import { Routes, Route, useLocation } from "react-router-dom";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Stack from "@mui/material/Stack";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";

import Home from "./Home";
import CookbookContainer from "./cookbook/CookbookContainer";
import BasicFoodsContainer from "./basicFoods/BasicFoodsContainer";
import ShoppingListContainer from "./shoppingList/ShoppingListContainer";
import GlossaryContainer from "./glossary/GlossaryContainer";

import NavBar from "./NavBar";

function App(p) {
  const [user, setUser] = useState();
  const [alertList, setAlertList] = useState([]);

  const addAlert = (alert, removalTime = 6001) => {
    setAlertList((prevList) => prevList.concat(alert));
    setTimeout(() => {
      setAlertList((prevList) => prevList.slice(1));
    }, removalTime);
  };

  const [cookbook, setCookbook] = useState();
  const [basicFoods, setBasicFoods] = useState();
  const [names, setNames] = useState();
  const [shoppingList, setShoppingList] = useState();

  useEffect(() => {
    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        addAlert({
          message: "Succesfully logged in with Google",
          title: `Hello ${user.displayName}`,
          alertProps: { severity: "success" },
        });
      } else {
        addAlert({
          message: "Succesfully logged out.",
          title: "Farewell",
          alertProps: { severity: "success" },
        });
      }
      setUser(user);
    });
  }, []);

  useEffect(() => {
    addAlert({
      message: "Welcome to Gude Foods",
      alertProps: { severity: "info" },
    });
  }, []);

  const usePathname = () => {
    const location = useLocation();
    return location.pathname;
  };

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
      <NavBar pathname={usePathname()} />
      <Stack
        sx={{ width: "100%", paddingTop: "10px" }}
        spacing={2}
        alignItems="center"
      >
        {alertList.map((alert, index) => {
          const { message, title, alertProps } = alert;
          return (
            <Alert
              key={index}
              sx={{ width: { xs: "85%", md: "70%" } }}
              {...alertProps}
            >
              {title && <AlertTitle>{title}</AlertTitle>}
              {message}
            </Alert>
          );
        })}
      </Stack>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cookbook" element={<CookbookContainer />} />
        <Route path="basicFoods" element={<BasicFoodsContainer />} />
        <Route path="shoppingList" element={<ShoppingListContainer />} />
        <Route path="glossary" element={<GlossaryContainer />} />
      </Routes>
    </div>
  );
}

export default App;
