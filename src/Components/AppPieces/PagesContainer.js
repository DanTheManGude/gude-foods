import { useEffect, useState, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";

import { updateRequest } from "../../utils/requests";
import { databasePaths } from "../../constants";

import OfflineCookbookUpdater from "../Offline/OfflineCookbookUpdater";

import Home from "../Pages/Home";
import Cookbook from "../Pages/Cookbook";
import Recipe from "../Pages/Recipe";
import Cooking from "../Pages/Cooking";
import ShoppingList from "../Pages/ShoppingList";
import Glossary from "../Pages/Glossary";
import Settings from "../Pages/Settings";
import Admin from "../Pages/Admin";
import Users from "../Pages/Users";
import ExternalRecipe from "../Pages/ExternalRecipe";
import ShareRecipe from "../Pages/ShareRecipe";
import SharedRecipes from "../Pages/SharedRecipes";

import {
  DatabaseContext,
  DataPathsContext,
  ColorKeyContext,
  UserContext,
} from "../Contexts";

const getCreateFullPath = (user) => (pathName) =>
  `accounts/${user.uid}/${pathName}`;

function PagesContainer(props) {
  const {
    isAdmin,
    requestedUsers,
    allowUnrestrictedUsers,
    enableUsingOffline,
  } = props;

  const user = useContext(UserContext);
  const setColorKey = useContext(ColorKeyContext);

  const [database, setDatabase] = useState({});
  const [dataPaths, setDataPaths] = useState({});
  const [filteringOptions, setFilteringOptions] = useState();
  const [externalRecipe, setExternalRecipe] = useState();
  const [actingUser, setActingUser] = useState();
  const [userList, setUserList] = useState([]);
  const [accounts, setAccounts] = useState();
  const [sharedRecipes, setSharedRecipes] = useState();

  const [themeIsNotSet, setThemeIsNotSet] = useState(false);

  const setActingUserByUid = (uid) => {
    const newUser = userList.find((userEntry) => userEntry.uid === uid);
    if (newUser) {
      setActingUser(newUser);
    }
  };

  const clearActingUser = () => {
    setActingUser();
  };

  useEffect(() => {
    if (!user || !setColorKey) {
      return () => {};
    }
    const db = getDatabase();

    const createFullPath = getCreateFullPath(actingUser || user);

    const onValueListerRemovers = [];

    const colorKeyListerRemover = onValue(
      ref(db, createFullPath(databasePaths.colorKey)),
      (snapshot) => {
        const snapshotValue = snapshot.val();
        if (snapshotValue) {
          setColorKey(snapshotValue);
        } else {
          setThemeIsNotSet(true);
        }
      }
    );
    onValueListerRemovers.push(colorKeyListerRemover);

    Object.keys(databasePaths).forEach((key) => {
      const pathName = databasePaths[key];
      const fullPath = createFullPath(pathName);

      const individualDbListerRemover = onValue(
        ref(db, fullPath),
        (snapshot) => {
          const value = snapshot.val();
          setDatabase((_database) => ({
            ..._database,
            [key]: value,
          }));
        }
      );
      onValueListerRemovers.push(individualDbListerRemover);

      setDataPaths((_dataPaths) => ({
        ..._dataPaths,
        [`${key}Path`]: fullPath,
      }));
    });

    if (!actingUser) {
      updateRequest({ [createFullPath("name")]: user.displayName });
    }

    return () => {
      onValueListerRemovers.forEach((listerRemover) => {
        listerRemover();
      });
    };
  }, [user, actingUser, setColorKey]);

  useEffect(() => {
    if (!user) {
      return;
    }
    const db = getDatabase();

    onValue(ref(db, "users"), (snapshot) => {
      const users = snapshot.val();
      onValue(ref(db, "accounts"), (snapshot) => {
        const accountsSnapshot = snapshot.val();
        setAccounts(accountsSnapshot);
        setUserList(
          Object.keys(accountsSnapshot).map((userUid) => ({
            uid: userUid,
            displayName: accountsSnapshot[userUid].name,
            isAuthorized: !!users[userUid],
            basicFoodsCount:
              accountsSnapshot[userUid].glossary &&
              accountsSnapshot[userUid].glossary.basicFoods
                ? Object.entries(accountsSnapshot[userUid].glossary.basicFoods)
                    .length
                : 0,
            recipeCount: accountsSnapshot[userUid].cookbook
              ? Object.entries(accountsSnapshot[userUid].cookbook).length
              : 0,
          }))
        );
      });
    });
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;

    const db = getDatabase();

    onValue(ref(db, "shared"), (snapshot) => {
      const sharedRecipesSnapshot = snapshot.val();
      setSharedRecipes(sharedRecipesSnapshot);
    });
  }, [isAdmin]);

  return (
    <DatabaseContext.Provider value={database}>
      <DataPathsContext.Provider value={dataPaths}>
        <Routes>
          <Route
            path="/home"
            element={
              <Home
                requestedUsers={isAdmin ? requestedUsers : {}}
                themeIsNotSet={themeIsNotSet}
              />
            }
          />
          <Route
            path="cookbook"
            element={
              <Cookbook
                filteringOptions={filteringOptions}
                setFilteringOptions={setFilteringOptions}
                setExternalRecipe={setExternalRecipe}
              />
            }
          />
          <Route
            path="recipe/:recipeId"
            element={<Recipe isAdmin={isAdmin} />}
          />
          <Route path="cooking/:recipeId" element={<Cooking />} />
          <Route path="shoppingList" element={<ShoppingList />} />
          <Route
            path="glossary"
            element={<Glossary setFilteringOptions={setFilteringOptions} />}
          />
          <Route
            path="settings"
            element={
              <Settings
                isAdmin={isAdmin}
                actingUser={actingUser}
                clearActingUser={clearActingUser}
                enableUsingOffline={enableUsingOffline}
              />
            }
          />
          {isAdmin && (
            <Route
              path="admin"
              element={<Admin userList={userList} accounts={accounts} />}
            />
          )}
          {isAdmin && (
            <Route
              path="users"
              element={
                <Users
                  userList={userList}
                  actingUser={actingUser}
                  clearActingUser={clearActingUser}
                  setActingUser={setActingUser}
                  allowUnrestrictedUsers={allowUnrestrictedUsers}
                />
              }
            />
          )}
          {isAdmin && (
            <Route
              path="sharedRecipes"
              element={
                <SharedRecipes
                  sharedRecipes={sharedRecipes}
                  accounts={accounts}
                  setActingUserByUid={setActingUserByUid}
                />
              }
            />
          )}
          {externalRecipe && (
            <Route
              path="externalRecipe"
              element={
                <ExternalRecipe
                  givenRecipe={externalRecipe}
                  isAdmin={isAdmin}
                />
              }
            />
          )}
          <Route
            path="share/:shareId"
            element={
              <ShareRecipe
                isAuthorized={true}
                isAdmin={isAdmin}
                setActingUserByUid={setActingUserByUid}
                accounts={isAdmin && accounts}
              />
            }
          />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
        <OfflineCookbookUpdater />
      </DataPathsContext.Provider>
    </DatabaseContext.Provider>
  );
}

export default PagesContainer;
