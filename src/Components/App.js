import { useEffect, useState, useRef } from "react";

import { Routes, Route, useLocation } from "react-router-dom";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Stack from "@mui/material/Stack";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";

import Home from "./Home";
import CookbookContainer from "./cookbook/CookbookContainer";
import ShoppingList from "./ShoppingList";
import Glossary from "./Glossary";

import NavBar from "./NavBar";

function App() {
  const [alertList, setAlertList] = useState([]);
  const [user, setUser] = useState();
  const prevUserRef = useRef();

  const addAlert = (alert, removalTime = 6001) => {
    setAlertList((prevList) => prevList.concat(alert));
    setTimeout(() => {
      setAlertList((prevList) => prevList.slice(1));
    }, removalTime);
  };

  const [glossary, setGlossary] = useState();

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
    onValue(ref(getDatabase(), "glossary"), (snapshot) => {
      setGlossary(snapshot.val());
    });
  }, []);

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

  const usePathname = () => {
    const location = useLocation();
    return location.pathname;
  };

  return (
    <div className="App">
      <NavBar pathname={usePathname()} addAlert={addAlert} />
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
        <Route path="cookbook" element={<CookbookContainer />} />
        <Route
          path="shoppingList"
          element={<ShoppingList glossary={glossary} addAlert={addAlert} />}
        />
        <Route
          path="glossary"
          element={<Glossary glossary={glossary} addAlert={addAlert} />}
        />
      </Routes>
    </div>
  );
}

export default App;
