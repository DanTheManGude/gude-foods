import { useEffect, useState, useRef } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Collapse from "@mui/material/Collapse";
import { TransitionGroup } from "react-transition-group";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, child, get } from "firebase/database";

import PagesContainer from "./PagesContainer";

import NavBar from "./NavBar";
import UnauthorizedUser from "./UnauthorizedUser";

function App() {
  const [alertList, setAlertList] = useState([]);
  const [user, setUser] = useState();
  const [isAuthorizedUser, setIsAuthorizedUser] = useState(false);

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

    get(child(ref(getDatabase()), `users/${user.uid}`))
      .then((snapshot) => {
        setIsAuthorizedUser(snapshot.exists() && snapshot.val());
      })
      .catch((error) => {
        console.error(error);
        setIsAuthorizedUser(false);
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

  return (
    <div className="App">
      {renderMessages()}
      <NavBar pathname={usePathname()} addAlert={addAlert} />
      {isAuthorizedUser ? (
        <PagesContainer user={user} addAlert={addAlert} />
      ) : (
        <UnauthorizedUser user={user} addAlert={addAlert} />
      )}
    </div>
  );
}

export default App;
