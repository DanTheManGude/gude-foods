import { useEffect, useState, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getDatabase, ref, onValue, child, get } from "firebase/database";

import {
  DataPaths,
  Database,
  FilteringOptions,
  ActingUser,
  SharedRecipes as SharedRecipesType,
  Accounts,
  DatabasePathKey,
  Collaboration as CollaborationType,
  OtherUser,
  ExternalRecipeWithNewValues,
} from "../../types";
import { databasePaths } from "../../constants";
import { getCreateFullPath } from "../../utils/requests";

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
  AdminContext,
} from "../Contexts";
import Collaboration from "../Pages/Collaboration";

function PagesContainer(props: {
  requestedUsers: any;
  allowUnrestrictedUsers: boolean;
  enableUsingOffline: () => void;
  setIsActingAsUser: (isActingAsUser: boolean) => void;
}) {
  const {
    requestedUsers,
    allowUnrestrictedUsers,
    enableUsingOffline,
    setIsActingAsUser,
  } = props;

  const user = useContext(UserContext);
  const setColorKey = useContext(ColorKeyContext);
  const isAdmin = useContext(AdminContext);

  const [database, setDatabase] = useState<Database>({});
  const [dataPaths, setDataPaths] = useState<Partial<DataPaths>>({});
  const [filteringOptions, setFilteringOptions] = useState<FilteringOptions>();
  const [externalRecipe, setExternalRecipe] =
    useState<ExternalRecipeWithNewValues>();
  const [actingUser, setActingUser] = useState<ActingUser>();
  const [userList, setUserList] = useState<OtherUser[]>([]);
  const [accounts, setAccounts] = useState<Accounts>();
  const [sharedRecipes, setSharedRecipes] = useState<SharedRecipesType>();

  const [themeIsNotSet, setThemeIsNotSet] = useState<boolean>(false);

  useEffect(() => {
    setIsActingAsUser(Boolean(actingUser));
  }, [setIsActingAsUser, actingUser]);

  const setActingUserByUid = (uid: string) => {
    const newUser = userList.find((userEntry) => userEntry.uid === uid);
    if (newUser) {
      setActingUser(newUser);
    }
  };

  const clearActingUser = () => setActingUser(undefined);

  useEffect(() => {
    if (!user || !setColorKey) {
      return () => {};
    }
    const db = getDatabase();

    const createFullPath = getCreateFullPath(
      actingUser ? actingUser.uid : user.uid
    );

    const onValueListerRemovers = [];

    if (!actingUser) {
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
    }

    Object.keys(databasePaths).forEach(async (key: DatabasePathKey) => {
      if (key === "collaboration" && actingUser) return;

      const pathName = databasePaths[key];
      const fullPath = createFullPath(pathName);

      const individualDbListerRemover = onValue(
        ref(db, fullPath),
        async (snapshot) => {
          let value = snapshot.val();

          if (key === "collaboration" && value) {
            const otherUids = new Set<string>();
            const { givesAccessTo, hasAccessTo } = value as CollaborationType;
            if (givesAccessTo) {
              Object.keys(givesAccessTo).forEach((uid) => {
                otherUids.add(uid);
              });
            }
            if (hasAccessTo) {
              Object.keys(hasAccessTo).forEach((uid) => {
                otherUids.add(uid);
              });
            }

            const otherUserNames: { [key: string]: string } = {};

            const namesResults = await Promise.allSettled(
              Array.from(otherUids).map((otherUid) =>
                get(
                  child(ref(getDatabase()), `accounts/${otherUid}/name`)
                ).then((snapshot) => {
                  let name = "";
                  if (snapshot.exists()) {
                    name = snapshot.val();
                  }
                  return { uid: otherUid, name };
                })
              )
            );

            namesResults.forEach((result) => {
              if (result.status === "fulfilled") {
                const { uid, name } = result.value;
                otherUserNames[uid] = name;
              }
            });

            value = { ...value, names: otherUserNames };
          }

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
        const accountsSnapshot: Accounts = snapshot.val();
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
      <DataPathsContext.Provider value={dataPaths as DataPaths}>
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
          <Route
            path="collaboration"
            element={
              <Collaboration
                actingUser={actingUser}
                setActingUser={setActingUser}
                clearActingUser={clearActingUser}
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
