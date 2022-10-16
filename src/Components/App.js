import { useEffect, useState, useRef } from "react";

import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Collapse from "@mui/material/Collapse";
import { TransitionGroup } from "react-transition-group";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, child, get } from "firebase/database";

import Home from "./Home";
import Cookbook from "./Cookbook";
import Recipe from "./Recipe";
import ShoppingList from "./ShoppingList";
import Glossary from "./Glossary";
import Settings from "./Settings";

import NavBar from "./NavBar";
import UnauthorizedUser from "./UnauthorizedUser";

function App() {
  const [alertList, setAlertList] = useState([]);
  const [user, setUser] = useState();
  const [isAuthorizedUser, setIsAuthorizedUser] = useState(false);

  const [glossary, setGlossary] = useState();
  const [basicFoodTagAssociation, setBasicFoodTagAssociation] = useState();
  const [basicFoodTagOrder, setBasicFoodTagOrder] = useState();
  const [shoppingList, setShoppingList] = useState();
  const [cookbook, setCookbook] = useState();
  const [recipeOrder, setRecipeOrder] = useState();

  const [filteringOptions, setFilteringOptions] = useState();

  const prevUserRef = useRef();

  let navigate = useNavigate();

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
    if (prevUserRef.current && prevUserRef.current !== user) {
      navigate("/home");
    }
    prevUserRef.current = user;
  }, [user, navigate]);

  useEffect(() => {
    if (!user) {
      setIsAuthorizedUser(false);
      return;
    }

    const db = getDatabase();

    const dbRef = ref(db);
    get(child(dbRef, `users/${user.uid}`))
      .then((snapshot) => {
        setIsAuthorizedUser(snapshot.exists() && snapshot.val());
      })
      .catch((error) => {
        console.error(error);
        setIsAuthorizedUser(false);
      });

    onValue(ref(db, `glossary/${user.uid}`), (snapshot) => {
      setGlossary(snapshot.val());
    });

    onValue(ref(db, `basicFood-basicFoodTag/${user.uid}`), (snapshot) => {
      setBasicFoodTagAssociation(snapshot.val());
    });

    onValue(ref(db, `basicFoodTagOrder/${user.uid}`), (snapshot) => {
      setBasicFoodTagOrder(snapshot.val());
    });

    onValue(ref(db, `shoppingList/${user.uid}`), (snapshot) => {
      setShoppingList(snapshot.val());
    });

    onValue(ref(db, `cookbook/${user.uid}`), (snapshot) => {
      setCookbook(snapshot.val());
    });

    onValue(ref(db, `recipeOrder/${user.uid}`), (snapshot) => {
      setRecipeOrder(snapshot.val());
    });

    addAlert({
      message: "Succesfully logged in with Google",
      title: `Hello ${user.displayName}`,
      alertProps: { severity: "success" },
    });
  }, [user]);

  const usePathname = () => {
    const location = useLocation();
    return location.pathname;
  };

  const renderMessages = () => (
    <List
      sx={{
        width: "100%",
        zIndex: 9000,
        top: "55px",
        position: "fixed",
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
                <Alert sx={{ width: { xs: "85%", md: "60%" } }} {...alertProps}>
                  {title && <AlertTitle>{title}</AlertTitle>}
                  {message}
                </Alert>
              </ListItem>
            </Collapse>
          );
        })}
      </TransitionGroup>
    </List>
  );

  const renderRoutes = () => (
    <Routes>
      <Route
        path="/*"
        element={
          <Home
            glossary={glossary}
            basicFoodTagAssociation={basicFoodTagAssociation}
            shoppingList={shoppingList}
            cookbook={cookbook}
          />
        }
      />
      <Route
        path="cookbook"
        element={
          <Cookbook
            glossary={glossary}
            cookbook={cookbook}
            recipeOrder={recipeOrder}
            recipeOrderPath={user ? `recipeOrder/${user.uid}` : ""}
            shoppingListPath={user ? `shoppingList/${user.uid}` : ""}
            addAlert={addAlert}
            filteringOptions={filteringOptions}
            setFilteringOptions={setFilteringOptions}
          />
        }
      />
      <Route
        path="recipe/:recipeId"
        element={
          <Recipe
            glossary={glossary}
            basicFoodTagAssociation={basicFoodTagAssociation}
            cookbook={cookbook}
            recipeOrder={recipeOrder}
            shoppingList={shoppingList}
            basicFoodTagOrder={basicFoodTagOrder}
            cookbookPath={user ? `cookbook/${user.uid}` : ""}
            recipeOrderPath={user ? `recipeOrder/${user.uid}` : ""}
            shoppingListPath={user ? `shoppingList/${user.uid}` : ""}
            glossaryPath={user ? `glossary/${user.uid}` : ""}
            basicFoodTagAssociationPath={
              user ? `basicFood-basicFoodTag/${user.uid}` : ""
            }
            addAlert={addAlert}
          />
        }
      />
      <Route
        path="shoppingList"
        element={
          <ShoppingList
            glossary={glossary}
            basicFoodTagAssociation={basicFoodTagAssociation}
            shoppingList={shoppingList}
            cookbook={cookbook}
            basicFoodTagOrder={basicFoodTagOrder}
            shoppingListPath={user ? `shoppingList/${user.uid}` : ""}
            glossaryPath={user ? `glossary/${user.uid}` : ""}
            basicFoodTagAssociationPath={
              user ? `basicFood-basicFoodTag/${user.uid}` : ""
            }
            addAlert={addAlert}
          />
        }
      />
      <Route
        path="glossary"
        element={
          <Glossary
            glossary={glossary}
            shoppingList={shoppingList}
            cookbook={cookbook}
            basicFoodTagAssociation={basicFoodTagAssociation}
            basicFoodTagOrder={basicFoodTagOrder}
            glossaryPath={user ? `glossary/${user.uid}` : ""}
            basicFoodTagAssociationPath={
              user ? `basicFood-basicFoodTag/${user.uid}` : ""
            }
            basicFoodTagOrderPath={user ? `basicFoodTagOrder/${user.uid}` : ""}
            shoppingListPath={user ? `shoppingList/${user.uid}` : ""}
            cookbookPath={user ? `cookbook/${user.uid}` : ""}
            addAlert={addAlert}
          />
        }
      />
      <Route
        path="settings"
        element={
          <Settings
            glossary={glossary}
            basicFoodTagAssociation={basicFoodTagAssociation}
            basicFoodTagOrder={basicFoodTagOrder}
            shoppingList={shoppingList}
            cookbook={cookbook}
            user={user}
            glossaryPath={user ? `glossary/${user.uid}` : ""}
            basicFoodTagAssociationPath={
              user ? `basicFood-basicFoodTag/${user.uid}` : ""
            }
            basicFoodTagOrderPath={user ? `basicFoodTagOrder/${user.uid}` : ""}
            shoppingListPath={user ? `shoppingList/${user.uid}` : ""}
            cookbookPath={user ? `cookbook/${user.uid}` : ""}
            addAlert={addAlert}
          />
        }
      />
    </Routes>
  );

  return (
    <div className="App">
      {renderMessages()}
      <NavBar pathname={usePathname()} addAlert={addAlert} />
      {isAuthorizedUser ? (
        renderRoutes()
      ) : (
        <UnauthorizedUser user={user} addAlert={addAlert} />
      )}
    </div>
  );
}

export default App;
