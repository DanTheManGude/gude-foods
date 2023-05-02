import { useEffect, useState, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";

import { updateRequest } from "../../utils/requests";
import { databasePaths } from "../../constants";

import Home from "../Pages/Home";
import Cookbook from "../Pages/Cookbook";
import Recipe from "../Pages/Recipe";
import Cooking from "../Pages/Cooking";
import ShoppingList from "../Pages/ShoppingList";
import Glossary from "../Pages/Glossary";
import Settings from "../Pages/Settings";
import AiRecipe from "../Pages/AiRecipe";

import {
  DatabaseContext,
  DataPathsContext,
  ColorsUpdateContext,
} from "../Contexts";

const getCreateFullPath = (user) => (pathName) =>
  `accounts/${user.uid}/${pathName}`;

function PagesContainer(props) {
  const { user } = props;

  const setColors = useContext(ColorsUpdateContext);

  const [database, setDatabase] = useState({});
  const [dataPaths, setDataPaths] = useState({});
  const [filteringOptions, setFilteringOptions] = useState();
  const [aiGeneratedRecipe, setAiGeneratedRecipe] = useState();

  useEffect(() => {
    if (!user || !setColors) {
      return;
    }
    const db = getDatabase();

    const createFullPath = getCreateFullPath(user);

    onValue(ref(db, createFullPath(databasePaths.colors)), (snapshot) => {
      const snapshotValue = snapshot.val();
      if (snapshotValue) {
        setColors(snapshotValue);
      }
    });

    Object.keys(databasePaths).forEach((key) => {
      const pathName = databasePaths[key];
      const fullPath = createFullPath(pathName);

      onValue(ref(db, fullPath), (snapshot) => {
        setDatabase((_database) => ({
          ..._database,
          [key]: snapshot.val(),
        }));
      });
      setDataPaths((_dataPaths) => ({
        ..._dataPaths,
        [`${key}Path`]: fullPath,
      }));
    });
    updateRequest({ [createFullPath("name")]: user.displayName });
  }, [user, setColors]);

  return (
    <DatabaseContext.Provider value={database}>
      <DataPathsContext.Provider value={dataPaths}>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route
            path="cookbook"
            element={
              <Cookbook
                filteringOptions={filteringOptions}
                setFilteringOptions={setFilteringOptions}
                setAiGeneratedRecipe={setAiGeneratedRecipe}
              />
            }
          />
          <Route path="recipe/:recipeId" element={<Recipe />} />
          <Route path="cooking/:recipeId" element={<Cooking />} />
          <Route path="shoppingList" element={<ShoppingList />} />
          <Route path="glossary" element={<Glossary />} />
          <Route path="settings" element={<Settings user={user} />} />
          {aiGeneratedRecipe && (
            <Route
              path="aiRecipe"
              element={<AiRecipe givenRecipe={aiGeneratedRecipe} />}
            />
          )}
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </DataPathsContext.Provider>
    </DatabaseContext.Provider>
  );
}

export default PagesContainer;
