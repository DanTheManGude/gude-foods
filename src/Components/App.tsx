import { useEffect, useState, useRef } from "react";

import { useNavigate, useLocation, Route, Routes } from "react-router-dom";

import { User, getAuth, onAuthStateChanged } from "firebase/auth";
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
import Button, { ButtonProps } from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { Alert as GFAlert, RequestedUsers, SetSubsriber } from "../types";
import { aboutText } from "../constants";
import {
  getHasLoggedInBefore,
  sendNotification,
  isDevelopment,
} from "../utils/utility";

import { getCreateFullPath, updateRequest } from "../utils/requests";

import PagesContainer from "./AppPieces/PagesContainer";
import NavBar from "./AppPieces/NavBar";
import BottomNav from "./AppPieces/BottomNav";
import UnauthorizedUser from "./AppPieces/UnauthorizedUser";
import ShareRecipe from "./Pages/ShareRecipe";

import Loading from "./Utils/Loading";

import OfflineMode from "./Offline/OfflineMode";
import { AddAlertContext, AdminContext, UserContext } from "./Contexts";
import withTheme from "./withTheme";

type AlertWithId = GFAlert & { id: number };

function App(props: { setSubscriber: SetSubsriber }) {
  const { setSubscriber } = props;

  const setSubscriberRef = useRef(setSubscriber);

  const [isActingAsUser, setIsActingAsUser] = useState<boolean>(false);

  const [alertList, setAlertList] = useState<AlertWithId[]>([]);
  const [user, setUser] = useState<User>();
  const [isAuthorizedUser, setIsAuthorizedUser] = useState<boolean>(false);

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const stopInitialLoading: () => void = () => setInitialLoading(false);
  const [authorizedLoading, setAuthorizedLoading] = useState<boolean>(false);
  const isLoading: boolean = initialLoading || authorizedLoading;

  const [usingOffline, setUsingOffline] = useState(false);
  const disableUsingOffline = () => setUsingOffline(false);
  const enableUsingOffline = () => setUsingOffline(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [requestedUsers, setIsRequestedUsers] = useState<RequestedUsers>({});
  const [allowUnrestrictedUsers, setAllowUnrestrictedUsers] =
    useState<boolean>(false);

  const prevUserRef = useRef<User>();

  let navigate = useNavigate();
  let location = useLocation();

  const removeAlert = (alertId: number) =>
    setAlertList((prevList) =>
      prevList.filter((alert) => alert.id !== alertId)
    );

  const addAlertRef = useRef((alert: GFAlert, removalTime = 3001) => {
    const alertId = window.setTimeout(() => {
      removeAlert(alertId);
    }, removalTime);

    setAlertList((prevList) => prevList.concat({ ...alert, id: alertId }));
  });

  useEffect(() => {
    setSubscriberRef.current(() => {
      addAlertRef.current(
        {
          title: <>The current website is out of date.</>,
          message: (
            <Stack direction="row" alignItems="baseline">
              <Typography>Please </Typography>
              <Button
                color="error"
                variant="text"
                onClick={() => {
                  window.location.reload();
                }}
                size="small"
              >
                <Typography>Refresh</Typography>
              </Button>
              <Typography> the page.</Typography>
            </Stack>
          ),
          alertProps: { severity: "warning" },
          dismissible: true,
        },
        60000
      );
    });
  }, [setSubscriberRef]);

  useEffect(() => {
    onAuthStateChanged(getAuth(), setUser);
  }, []);

  useEffect(() => {
    const hasLoggedInBefore = getHasLoggedInBefore();
    const delay = !hasLoggedInBefore ? 0 : 5000;

    setTimeout(() => {
      stopInitialLoading();
    }, delay);
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
    stopInitialLoading();

    onValue(
      ref(getDatabase(), `users/${user.uid}`),
      (snapshot) => {
        const isAuthorizedInDb = snapshot.exists() && snapshot.val();
        if (isAuthorizedInDb) {
          setIsAuthorizedUser(true);
        } else {
          setIsAuthorizedUser(false);
        }
        setAuthorizedLoading(false);
      },
      (error) => {
        console.warn(error);
        setIsAuthorizedUser(false);
        setAuthorizedLoading(false);
      }
    );

    onValue(ref(getDatabase(), `requestedUsers`), (snapshot) => {
      if (snapshot.exists()) {
        setIsRequestedUsers(snapshot.val());
      } else {
        setIsRequestedUsers({});
      }
    });

    onValue(ref(getDatabase(), `allowUnrestrictedUsers`), (snapshot) => {
      if (snapshot.exists()) {
        setAllowUnrestrictedUsers(snapshot.val());
      } else {
        setAllowUnrestrictedUsers(false);
      }
    });

    get(child(ref(getDatabase()), `admin`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          setIsAdmin(true);
        }
      })
      .catch(() => {
        updateRequest({
          [getCreateFullPath(user.uid)("name")]: user.displayName,
        });
        if (!isDevelopment()) {
          sendNotification(
            {
              title: "User login",
              body: `${user.displayName} just logged in.`,
            },
            () => {}
          );
        }
      });

    addAlertRef.current({
      message: <Typography>Succesfully logged in with Google</Typography>,
      title: <Typography>{`Hello ${user.displayName}`}</Typography>,
      alertProps: { severity: "success" },
    });
  }, [user]);

  const renderMessages = (): JSX.Element => (
    <List
      sx={{
        width: "100%",
        zIndex: 2000,
        top: "60px",
        position: "fixed",
      }}
    >
      <TransitionGroup>
        {alertList.map((alert) => {
          const { message, title, alertProps, dismissible, undo, id } = alert;
          const handleClose: () => void = () => removeAlert(id);

          return (
            <Collapse key={id}>
              <ListItem
                sx={{
                  justifyContent: "center",
                }}
              >
                <Alert
                  sx={{ width: { xs: "85%", md: "60%" } }}
                  {...alertProps}
                  onClose={dismissible ? handleClose : undefined}
                  action={
                    undo ? (
                      <Button
                        sx={{ alignSelf: "center" }}
                        color="inherit"
                        onClick={() => {
                          handleClose();
                          undo();
                        }}
                      >
                        UNDO
                      </Button>
                    ) : undefined
                  }
                >
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

  const renderUseOfflineButton = (
    buttonProps: Partial<ButtonProps>
  ): JSX.Element => (
    <Button variant="outlined" onClick={enableUsingOffline} {...buttonProps}>
      <Typography>Use offline mode</Typography>
    </Button>
  );

  if (usingOffline) {
    return <OfflineMode disableUsingOffline={disableUsingOffline} />;
  }

  if (isAuthorizedUser || allowUnrestrictedUsers) {
    return (
      <>
        {renderMessages()}
        <NavBar isAuthorized={true} isActingAsUser={isActingAsUser} />
        <AddAlertContext.Provider value={addAlertRef.current}>
          <UserContext.Provider value={user}>
            <AdminContext.Provider value={isAdmin}>
              <PagesContainer
                requestedUsers={requestedUsers}
                allowUnrestrictedUsers={allowUnrestrictedUsers}
                enableUsingOffline={enableUsingOffline}
                setIsActingAsUser={setIsActingAsUser}
              />
            </AdminContext.Provider>
          </UserContext.Provider>
        </AddAlertContext.Provider>
        <BottomNav />
      </>
    );
  }

  if (location.pathname.startsWith("/share/")) {
    return (
      <>
        {renderMessages()}
        <NavBar isAuthorized={false} />
        <AddAlertContext.Provider value={addAlertRef.current}>
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

  if (isLoading) {
    return (
      <>
        <Loading />
        {renderUseOfflineButton({
          sx: {
            width: "60%",
            position: "fixed",
            margin: "5% auto",
            left: "0",
            right: "0",
            bottom: "10%",
          },
        })}
      </>
    );
  }

  return (
    <>
      {renderMessages()}
      <NavBar isAuthorized={false} />
      {navigator.onLine && (
        <UnauthorizedUser user={user} addAlert={addAlertRef.current} />
      )}
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
      {renderUseOfflineButton({
        sx: { width: "60%", margin: "20px auto", display: "flex" },
      })}
    </>
  );
}

export default withTheme(App);
