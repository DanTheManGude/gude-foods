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
import Users from "../Pages/Users";
import AiRecipe from "../Pages/AiRecipe";

import {
  DatabaseContext,
  DataPathsContext,
  ColorKeyContext,
} from "../Contexts";

const getCreateFullPath = (user) => (pathName) =>
  `accounts/${user.uid}/${pathName}`;

function PagesContainer(props) {
  const { user, isAdmin, requestedUsers, allowUnrestrictedUsers } = props;

  const setColorKey = useContext(ColorKeyContext);

  const [database, setDatabase] = useState({});
  const [dataPaths, setDataPaths] = useState({});
  const [filteringOptions, setFilteringOptions] = useState();
  const [aiGeneratedRecipe, setAiGeneratedRecipe] = useState();
  const [actingUser, setActingUser] = useState();
  const [userList, setUserList] = useState([]);

  const clearActingUser = () => {
    setActingUser();
  };

  useEffect(() => {
    if (!user || !setColorKey) {
      return;
    }
    const db = getDatabase();

    const createFullPath = getCreateFullPath(user);

    onValue(ref(db, createFullPath(databasePaths.colorKey)), (snapshot) => {
      const snapshotValue = snapshot.val();
      if (snapshotValue) {
        setColorKey(snapshotValue);
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
  }, [user, setColorKey]);

  useEffect(() => {
    if (!user) {
      return;
    }
    const db = getDatabase();

    onValue(ref(db, "users"), (snapshot) => {
      const users = snapshot.val();
      onValue(ref(db, "accounts"), (snapshot) => {
        const accounts = snapshot.val();
        setUserList(
          Object.keys(accounts).map((userUid) => ({
            uid: userUid,
            displayName: accounts[userUid].name,
            isAuthorized: !!users[userUid],
            basicFoodsCount:
              accounts[userUid].glossary &&
              accounts[userUid].glossary.basicFoods
                ? Object.entries(accounts[userUid].glossary.basicFoods).length
                : 0,
            recipeCount: accounts[userUid].cookbook
              ? Object.entries(accounts[userUid].cookbook).length
              : 0,
          }))
        );
      });
    });
  }, [user]);

  return (
    <DatabaseContext.Provider value={database}>
      <DataPathsContext.Provider value={dataPaths}>
        <Routes>
          <Route
            path="/home"
            element={
              <Home requestedUsers={isAdmin ? requestedUsers : undefined} />
            }
          />
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
          <Route
            path="settings"
            element={
              <Settings
                user={user}
                actingUser={actingUser}
                clearActingUser={clearActingUser}
                isAdmin={isAdmin}
                allowUnrestrictedUsers={allowUnrestrictedUsers}
              />
            }
          />
          {isAdmin && (
            <Route
              path="users"
              element={
                <Users
                  user={user}
                  userList={userList}
                  actingUser={actingUser}
                  clearActingUser={clearActingUser}
                  setActingUser={setActingUser}
                />
              }
            />
          )}
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
