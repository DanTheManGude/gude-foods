import { useEffect, useState, useRef } from "react";

import { useNavigate, useLocation, Route, Routes } from "react-router-dom";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, child, get, onValue } from "firebase/database";

import { TransitionGroup } from "react-transition-group";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Collapse from "@mui/material/Collapse";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import { aboutText } from "../constants";

import PagesContainer from "./AppPieces/PagesContainer";
import NavBar from "./AppPieces/NavBar";
import BottomNav from "./AppPieces/BottomNav";
import UnauthorizedUser from "./AppPieces/UnauthorizedUser";
import ShareRecipe from "./Pages/ShareRecipe";

import Loading from "./Utils/Loading";

import { AddAlertContext, UserContext } from "./Contexts";
import withTheme from "./withTheme";

function App() {
  const [alertList, setAlertList] = useState([]);
  const [user, setUser] = useState();
  const [isAuthorizedUser, setIsAuthorizedUser] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [authorizedLoading, setAuthorizedLoading] = useState(false);
  const isLoading = initialLoading || authorizedLoading;

  const [isAdmin, setIsAdmin] = useState(false);
  const [requestedUsers, setIsRequestedUsers] = useState();
  const [allowUnrestrictedUsers, setAllowUnrestrictedUsers] = useState(false);

  const prevUserRef = useRef();

  let navigate = useNavigate();
  let location = useLocation();

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
    setTimeout(() => {
      setInitialLoading(false);
    }, 5000);
  }, []);

  useEffect(() => {
    if (
      prevUserRef.current &&
      prevUserRef.current !== user &&
      !location.pathname.startsWith("/share")
    ) {
      navigate("/home");
    }
    prevUserRef.current = user;
  }, [user, navigate, location.pathname]);

  useEffect(() => {
    if (!user) {
      setIsAuthorizedUser(false);
      setAllowUnrestrictedUsers(false);
      setIsAdmin(false);
      return;
    }

    setAuthorizedLoading(true);
    setInitialLoading(false);

    get(child(ref(getDatabase()), `users/${user.uid}`))
      .then((snapshot) => {
        const isAuthorizedInDb = snapshot.exists() && snapshot.val();
        if (isAuthorizedInDb) {
          setIsAuthorizedUser(true);
        }
        setAuthorizedLoading(false);
      })
      .catch((error) => {
        console.warn(error);
        setIsAuthorizedUser(false);
        setAuthorizedLoading(false);
      });

    onValue(ref(getDatabase(), `requestedUsers`), (snapshot) => {
      if (snapshot.exists()) {
        setIsRequestedUsers(snapshot.val());
      } else {
        setIsRequestedUsers();
      }
    });

    onValue(ref(getDatabase(), `allowUnrestrictedUsers`), (snapshot) => {
      if (snapshot.exists()) {
        setAllowUnrestrictedUsers(snapshot.val());
      } else {
        setAllowUnrestrictedUsers(false);
      }
    });

    onValue(ref(getDatabase(), `admin`), (snapshot) => {
      if (snapshot.exists()) {
        setIsAdmin(true);
      }
    });

    addAlert({
      message: "Succesfully logged in with Google",
      title: `Hello ${user.displayName}`,
      alertProps: { severity: "success" },
    });
  }, [user]);

  const renderMessages = () => (
    <List
      sx={{
        width: "100%",
        zIndex: 2000,
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

  if (isAuthorizedUser || allowUnrestrictedUsers) {
    return (
      <>
        {renderMessages()}
        <NavBar />
        <AddAlertContext.Provider value={addAlert}>
          <UserContext.Provider value={user}>
            <PagesContainer
              isAdmin={isAdmin}
              requestedUsers={requestedUsers}
              allowUnrestrictedUsers={allowUnrestrictedUsers}
            />
          </UserContext.Provider>
        </AddAlertContext.Provider>
        <BottomNav />
      </>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (location.pathname.startsWith("/share/")) {
    return (
      <>
        {renderMessages()}
        <NavBar isAuthorized={false} />
        <AddAlertContext.Provider value={addAlert}>
          <UserContext.Provider value={user}>
            <Routes>
              <Route
                path="share/:shareId"
                element={<ShareRecipe isAuthorized={false} />}
              />
            </Routes>
          </UserContext.Provider>
        </AddAlertContext.Provider>
      </>
    );
  }

  return (
    <>
      {renderMessages()}
      <NavBar isAuthorized={false} />
      <UnauthorizedUser user={user} addAlert={addAlert} />
      <Card
        variant="outlined"
        sx={{ marginLeft: "5%", marginRight: "5%", marginTop: 2 }}
      >
        <CardHeader
          title={<Typography variant="h6">Welcome</Typography>}
        ></CardHeader>
        <CardContent>
          <Typography style={{ whiteSpace: "pre-line" }}>
            {aboutText}
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}

export default withTheme(App);
