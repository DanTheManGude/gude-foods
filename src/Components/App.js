import { useEffect, useState, useRef } from "react";

import { Routes, Route, useLocation } from "react-router-dom";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Collapse from "@mui/material/Collapse";
import { TransitionGroup } from "react-transition-group";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, child, get } from "firebase/database";

import Home from "./Home";
import CookbookContainer from "./cookbook/CookbookContainer";
import ShoppingList from "./ShoppingList";
import Glossary from "./Glossary";

import NavBar from "./NavBar";

function App() {
  const [alertList, setAlertList] = useState([]);
  const [user, setUser] = useState();
  const [readOnly, setReadOnly] = useState(true);

  const [glossary, setGlossary] = useState();
  const [basicFoodTagAssociation, setBasicFoodTagAssociation] = useState();
  const [shoppingList, setShoppingList] = useState();
  const [cookbook, setCookbook] = useState();

  const prevUserRef = useRef();

  const addAlert = (alert, removalTime = 3001) => {
    setAlertList((prevList) => prevList.concat(alert));
    setTimeout(() => {
      setAlertList((prevList) => prevList.slice(1));
    }, removalTime);
  };

  useEffect(() => {
    onAuthStateChanged(getAuth(), setUser);
  }, []);

  useEffect(() => {
    addAlert({
      message: "Welcome to Gude Foods",
      alertProps: { severity: "info" },
    });
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const db = getDatabase();

    onValue(ref(db, "glossary"), (snapshot) => {
      setGlossary(snapshot.val());
    });

    onValue(ref(db, "basicFood-basicFoodTag"), (snapshot) => {
      setBasicFoodTagAssociation(snapshot.val());
    });

    onValue(ref(db, `shoppingList/${user.uid}`), (snapshot) => {
      setShoppingList(snapshot.val());
    });

    onValue(ref(db, `cookbook/${user.uid}`), (snapshot) => {
      setCookbook(snapshot.val());
    });
  }, [user]);

  useEffect(() => {
    if (user) {
      addAlert({
        message: "Succesfully logged in with Google",
        title: `Hello ${user.displayName}`,
        alertProps: { severity: "success" },
      });
    } else if (prevUserRef.current && !user) {
      addAlert({
        message: "Succesfully logged out.",
        title: "Farewell",
        alertProps: { severity: "success" },
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const dbRef = ref(getDatabase());
      get(child(dbRef, `users/${user.uid}`))
        .then((snapshot) => {
          if (snapshot.exists() && snapshot.val()) {
            setReadOnly(false);
          } else {
            setReadOnly(true);
          }
        })
        .catch((error) => {
          console.error(error);
          setReadOnly(true);
        });
    } else {
      setReadOnly(true);
    }
  }, [user]);

  const usePathname = () => {
    const location = useLocation();
    return location.pathname;
  };

  return (
    <div className="App">
      <List
        sx={{
          width: "100%",
          paddingTop: "5px",
          zIndex: 9000,
          position: "absolute",
        }}
        spacing={8}
      >
        <TransitionGroup>
          {alertList.map((alert, index) => {
            const { message, title, alertProps } = alert;
            return (
              <Collapse key={index}>
                <ListItem
                  sx={{
                    justifyContent: "center",
                  }}
                >
                  <Alert
                    sx={{ width: { xs: "85%", md: "60%" } }}
                    {...alertProps}
                  >
                    {title && <AlertTitle>{title}</AlertTitle>}
                    {message}
                  </Alert>
                </ListItem>
              </Collapse>
            );
          })}
        </TransitionGroup>
      </List>
      <NavBar pathname={usePathname()} addAlert={addAlert} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="cookbook" element={<CookbookContainer />} />
        <Route
          path="shoppingList"
          element={
            <ShoppingList
              glossary={glossary}
              basicFoodTagAssociation={basicFoodTagAssociation}
              shoppingList={shoppingList}
              cookbook={cookbook}
              updatePath={user ? `shoppingList/${user.uid}` : ""}
              addAlert={addAlert}
              readOnly={readOnly}
            />
          }
        />
        <Route
          path="glossary"
          element={
            <Glossary
              glossary={glossary}
              basicFoodTagAssociation={basicFoodTagAssociation}
              addAlert={addAlert}
              readOnly={readOnly}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
