import { useEffect, useState, useContext } from "react";
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

import { DatabaseContext, DataPathsContext } from "../Contexts";

function PagesContainer(props) {
  const { user } = props;

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
    <DatabaseContext.Provider value={database}>
      <DataPathsContext.Provider value={dataPaths}>
        <Routes>
          <Route
            path="/home"
            element={<Home database={database} dataPaths={dataPaths} />}
          />
          <Route
            path="cookbook"
            element={
              <Cookbook
                filteringOptions={filteringOptions}
                setFilteringOptions={setFilteringOptions}
                setAiGeneratedRecipe={setAiGeneratedRecipe}
                openAIKey={openAIKey}
              />
            }
          />
          <Route
            path="recipe/:recipeId"
            element={<Recipe database={database} dataPaths={dataPaths} />}
          />
          <Route
            path="cooking/:recipeId"
            element={<Cooking database={database} />}
          />
          <Route
            path="shoppingList"
            element={<ShoppingList database={database} dataPaths={dataPaths} />}
          />
          <Route
            path="glossary"
            element={<Glossary database={database} dataPaths={dataPaths} />}
          />
          <Route
            path="settings"
            element={
              <Settings database={database} dataPaths={dataPaths} user={user} />
            }
          />
          {aiGeneratedRecipe && (
            <Route
              path="aiRecipe"
              element={
                <AiRecipe
                  database={database}
                  dataPaths={dataPaths}
                  givenRecipe={aiGeneratedRecipe}
                />
              }
            />
          )}
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </DataPathsContext.Provider>
    </DatabaseContext.Provider>
  );
}

export default PagesContainer;
