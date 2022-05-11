import { useEffect, useState, useRef } from "react";

import { Routes, Route, useLocation } from "react-router-dom";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Stack from "@mui/material/Stack";

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

  const prevUserRef = useRef();

  const addAlert = (alert, removalTime = 6001) => {
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
      <Stack
        sx={{
          width: "100%",
          paddingTop: "5px",
          zIndex: 9000,
          position: "absolute",
        }}
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
      <NavBar pathname={usePathname()} addAlert={addAlert} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="cookbook" element={<CookbookContainer />} />
        <Route
          path="shoppingList"
          element={<ShoppingList glossary={glossary} addAlert={addAlert} />}
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
