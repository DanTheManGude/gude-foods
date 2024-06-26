import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { getApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

import { useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { longestEntryPathDelimiter } from "../../constants";
import { findLongestEntry, isDevelopment } from "../../utils/utility";
import { updateFcmToken } from "../../utils/requests";

import { AddAlertContext } from "../Contexts";
import PageTitle from "../Utils/PageTitle";

function Settings(props) {
  const { accounts, userList } = props;

  const addAlert = useContext(AddAlertContext);
  let navigate = useNavigate();
  const theme = useTheme();

  const [longestEntryInfo, setLongestEntryInfo] = useState();

  const handleLongestEntry = () => {
    const { path } = findLongestEntry(accounts);

    const parts = path.split(longestEntryPathDelimiter);
    const accountUid = parts[0];
    const value = parts.pop();

    const displayName = userList.find(
      (userEntry) => userEntry.uid === accountUid
    ).displayName;

    setLongestEntryInfo({
      displayName,
      path: parts.join("/"),
      value,
    });
  };

  const handleAskNotificationPermission = () => {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        addAlert({
          message: <Typography>Notification permission granted.</Typography>,
          alertProps: { severity: "success" },
        });
      } else {
        addAlert({
          message: (
            <Typography>Notification permission not granted.</Typography>
          ),
          alertProps: { severity: "error" },
        });
      }
    });
  };

  const handleGetAndUpdateFcmToken = async () => {
    const token = await getToken(getMessaging(getApp()), {
      vapidKey: process.env.REACT_APP_VAPID_KEY,
    });

    if (!token) {
      addAlert({
        message: (
          <Typography>
            No registration token available. Request permission to generate one.
          </Typography>
        ),
        alertProps: { severity: "error" },
      });
      return;
    }
    console.log("fcm token", token);

    updateFcmToken(token, addAlert);
  };

  const renderUserManagmentCard = () => (
    <Box sx={{ width: "95%" }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            User managment
          </Typography>
          <Typography>
            Change setting to allow any user access to an account without
            authorization and act as other users.
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button
            color="secondary"
            variant="outlined"
            onClick={() => navigate("/users")}
          >
            <Typography>View all users</Typography>
          </Button>
        </CardActions>
      </Card>
    </Box>
  );

  const renderAppCard = () => (
    <Box sx={{ width: "95%" }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Application
          </Typography>
          <Typography>
            Current version: <strong>{process.env.REACT_APP_VERSION}</strong>
          </Typography>
          <Typography>
            Currently in&nbsp;
            <strong>{isDevelopment() ? "development" : "production"}</strong>
            &nbsp;environment.
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button color="secondary" variant="contained">
            <Link
              underline="none"
              href="https://github.com/DanTheManGude/gude-foods"
              target="_blank"
              rel="noopener"
              color="secondary.contrastText"
            >
              <Typography>
                View source&nbsp;
                <OpenInNewIcon
                  fontSize="inherit"
                  sx={{ verticalAlign: "sub" }}
                />
              </Typography>
            </Link>
          </Button>
        </CardActions>
      </Card>
    </Box>
  );

  const renderShareRecipeCard = () => (
    <Box sx={{ width: "95%" }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Shared Recipes
          </Typography>
          <Typography>
            View all of the shared recipes and remove them.
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button
            color="secondary"
            variant="outlined"
            onClick={() => navigate("/sharedRecipes")}
          >
            <Typography>View shared recipes</Typography>
          </Button>
        </CardActions>
      </Card>
    </Box>
  );

  const renderLongestEntryCard = () => {
    const disabledColor = theme.palette.text.primary;
    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Longest Entry
            </Typography>
            <Typography>
              View the longest single leaf value in firebase.
            </Typography>
            <br />
            {longestEntryInfo && (
              <Stack spacing={1}>
                <Typography fontWeight="medium">
                  Name: {longestEntryInfo.displayName}
                </Typography>
                <TextField
                  label="Path"
                  multiline
                  disabled
                  value={longestEntryInfo.path}
                  variant="filled"
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: disabledColor,
                    },
                    "& .MuiFormLabel-root": {
                      WebkitTextFillColor: disabledColor,
                    },
                  }}
                />
                <TextField
                  label="Value"
                  multiline
                  disabled
                  value={longestEntryInfo.value}
                  variant="filled"
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: disabledColor,
                    },
                    "& .MuiFormLabel-root": {
                      WebkitTextFillColor: disabledColor,
                    },
                  }}
                />
              </Stack>
            )}
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            {longestEntryInfo && (
              <Button
                color="secondary"
                variant="outlined"
                onClick={() => {
                  setLongestEntryInfo();
                }}
              >
                <Typography>Clear entry info</Typography>
              </Button>
            )}
            <Button
              color="secondary"
              variant="outlined"
              onClick={handleLongestEntry}
            >
              <Typography>Find longest entry</Typography>
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  };

  const renderNotificationCard = () => {
    const notificationGranted =
      Notification && Notification.permission === "granted";
    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Notifications
            </Typography>
            {notificationGranted && (
              <Typography>Notification already granted</Typography>
            )}
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              sx={{ flex: 1 }}
              color="primary"
              variant="outlined"
              onClick={handleAskNotificationPermission}
              disabled={notificationGranted}
            >
              <Typography>Ask notification permission</Typography>
            </Button>
            <Button
              sx={{ flex: 1 }}
              color="secondary"
              variant="outlined"
              onClick={handleGetAndUpdateFcmToken}
            >
              <Typography>
                <span>Get & update</span>
                <br />
                <span>FCM Token</span>
              </Typography>
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  };

  return (
    <div>
      <PageTitle>Admin</PageTitle>
      <Stack sx={{ paddingTop: "15px" }} spacing={3} alignItems="center">
        {renderUserManagmentCard()}
        {renderShareRecipeCard()}
        {renderLongestEntryCard()}
        {renderNotificationCard()}
        {renderAppCard()}
      </Stack>
    </div>
  );
}

export default Settings;
