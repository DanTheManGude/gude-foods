import { useEffect, useState, useRef } from "react";

import { useNavigate } from "react-router-dom";

import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Collapse from "@mui/material/Collapse";
import { TransitionGroup } from "react-transition-group";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, child, get, onValue } from "firebase/database";

import PagesContainer from "./AppPieces/PagesContainer";

import NavBar from "./AppPieces/NavBar";
import BottomNav from "./AppPieces/BottomNav";
import UnauthorizedUser from "./AppPieces/UnauthorizedUser";

import { AddAlertContext, UserContext } from "./Contexts";
import withTheme from "./withTheme";

function App() {
  const [alertList, setAlertList] = useState([]);
  const [user, setUser] = useState();
  const [isAuthorizedUser, setIsAuthorizedUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [requestedUsers, setIsRequestedUsers] = useState();
  const [allowUnrestrictedUsers, setAllowUnrestrictedUsers] = useState(false);

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
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
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
      setAllowUnrestrictedUsers(false);
      return;
    }

    get(child(ref(getDatabase()), `users/${user.uid}`))
      .then((snapshot) => {
        const isAuthorizedInDb = snapshot.exists() && snapshot.val();
        if (isAuthorizedInDb) {
          setIsAuthorizedUser(true);
        } else {
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.warn(error);
        setIsAuthorizedUser(false);
        setIsLoading(false);
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
      } else {
        setIsAdmin(false);
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
    return (
      <div style={{ textAlign: "center", paddingTop: "20%" }}>
        <CircularProgress color="primary" size="30%" sx={{ margin: "auto" }} />
      </div>
    );
  }

  return (
    <>
      {renderMessages()}
      <UnauthorizedUser user={user} addAlert={addAlert} />
    </>
  );
}

export default withTheme(App);
