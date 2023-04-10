import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";

import { databasePaths } from "../../constants";

import Home from "../Pages/Home";
import Cookbook from "../Pages/Cookbook";
import Recipe from "../Pages/Recipe";
import Cooking from "../Pages/Cooking";
import ShoppingList from "../Pages/ShoppingList";
import Glossary from "../Pages/Glossary";
import Settings from "../Pages/Settings";
import AiRecipe from "../Pages/AiRecipe";

function PagesContainer(props) {
  const { user, addAlert } = props;

  const [database, setDatabase] = useState({});
  const [dataPaths, setDataPaths] = useState({});
  const [filteringOptions, setFilteringOptions] = useState();
  const [aiGeneratedRecipe, setAiGeneratedRecipe] = useState();
  const [openAIKey, setOpenAIKey] = useState();

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

    onValue(ref(db, "openAIKey"), (snapshot) => {
      setOpenAIKey(snapshot.val());
    });
  }, [user]);

  return (
    <Routes>
      <Route
        path="/home"
        element={
          <Home database={database} dataPaths={dataPaths} addAlert={addAlert} />
        }
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
            setAiGeneratedRecipe={setAiGeneratedRecipe}
            openAIKey={openAIKey}
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
        path="cooking/:recipeId"
        element={<Cooking database={database} />}
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
      {aiGeneratedRecipe && (
        <Route
          path="aiRecipe"
          element={
            <AiRecipe
              database={database}
              dataPaths={dataPaths}
              addAlert={addAlert}
              givenRecipe={aiGeneratedRecipe}
            />
          }
        />
      )}
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
}

export default PagesContainer;
