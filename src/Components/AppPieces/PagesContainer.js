import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";

import { databasePaths } from "../../constants";

import Home from "../Pages/Home";
import Cookbook from "../Pages/Cookbook";
import Recipe from "../Pages/Recipe";
import ShoppingList from "../Pages/ShoppingList";
import Glossary from "../Pages/Glossary";
import Settings from "../Pages/Settings";

function PagesContainer(props) {
  const { user, addAlert } = props;

  const [database, setDatabase] = useState({});
  const [dataPaths, setDataPaths] = useState({});
  const [filteringOptions, setFilteringOptions] = useState();

  useEffect(() => {
    if (!user) {
      return;
    }
    const db = getDatabase();

    Object.keys(databasePaths).forEach((key) => {
      const pathRoot = databasePaths[key];
      const fullPath = `${pathRoot}/${user.uid}`;

      onValue(ref(db, fullPath), (snapshot) => {
        setDatabase((_database) => ({
          ..._database,
          [key]: snapshot.val(),
        }));
        setDataPaths((_dataPaths) => ({
          ..._dataPaths,
          [`${key}Path`]: fullPath,
        }));
      });
    });
  }, [user]);

  return (
    <Routes>
      <Route
        path="/*"
        element={<Home database={database} dataPaths={dataPaths} />}
      />
      <Route
        path="cookbook"
        element={
          <Cookbook
            database={database}
            dataPaths={dataPaths}
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
            database={database}
            dataPaths={dataPaths}
            addAlert={addAlert}
          />
        }
      />
      <Route
        path="shoppingList"
        element={
          <ShoppingList
            database={database}
            dataPaths={dataPaths}
            addAlert={addAlert}
          />
        }
      />
      <Route
        path="glossary"
        element={
          <Glossary
            database={database}
            dataPaths={dataPaths}
            addAlert={addAlert}
          />
        }
      />
      <Route
        path="settings"
        element={
          <Settings
            database={database}
            dataPaths={dataPaths}
            user={user}
            addAlert={addAlert}
          />
        }
      />
    </Routes>
  );
}

export default PagesContainer;
