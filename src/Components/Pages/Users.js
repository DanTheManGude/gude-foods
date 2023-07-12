import { useContext, useState } from "react";

import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { longestEntryPathDelimiter } from "../../constants";

import {
  setAuthorizationForUser,
  updateAllowUnrestrictedUsers,
} from "../../utils/requests";

import { findLongestEntry } from "../../utils/utility";

import { UserContext } from "../Contexts";

function Users(props) {
  const {
    userList,
    accounts,
    actingUser,
    setActingUser,
    clearActingUser,
    allowUnrestrictedUsers,
  } = props;

  const theme = useTheme();
  const user = useContext(UserContext);

  const [longestEntryInfo, setLongestEntryInfo] = useState();

  const handleLongestEntry = () => {
    const { path } = findLongestEntry(accounts);

    const parts = path.split(longestEntryPathDelimiter);
    const accountUid = parts[0];
    const value = parts.pop();

    const displayName = userList.find(
      (userEntry) => userEntry.uid === accountUid
    ).displayName;

    console.log(path);
    setLongestEntryInfo({
      displayName,
      path: parts.join("/"),
      value,
    });
  };

  const renderUserManagmentCard = () => {
    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Stack direction={"row"} spacing={2} alignItems={"center"}>
              <Typography>Allow unrestricted user access:</Typography>
              <Switch
                checked={allowUnrestrictedUsers}
                onChange={(event) => {
                  updateAllowUnrestrictedUsers(event.target.checked);
                }}
              />
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderButtonOwnUser = () => (
    <Button
      color="secondary"
      variant="contained"
      size="medium"
      sx={{ flex: 1 }}
      disabled={!actingUser}
      onClick={() => {
        clearActingUser();
      }}
    >
      <Typography>Back to own user</Typography>
    </Button>
  );

  const renderButtonOtherUser = (userEntry) => {
    const { uid, isAuthorized } = userEntry;
    return (
      <>
        <Button
          color="secondary"
          variant="outlined"
          size="medium"
          sx={{ flex: 1 }}
          onClick={() => {
            setAuthorizationForUser(uid, !isAuthorized);
          }}
        >
          <Typography>{isAuthorized ? "Revoke" : "Give"} Access</Typography>
        </Button>
        <Button
          color="secondary"
          variant="contained"
          size="medium"
          sx={{ flex: 1 }}
          disabled={actingUser && uid === actingUser.uid}
          onClick={() => {
            setActingUser(userEntry);
          }}
        >
          <Typography>Act as user</Typography>
        </Button>
      </>
    );
  };

  const renderUser = (userEntry) => {
    const { displayName, uid, basicFoodsCount, recipeCount } = userEntry;

    return (
      <Accordion key={uid} sx={{ width: "100%" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={2} alignItems={"flex-end"}>
            <Typography variant="h6">{displayName}</Typography>
            <Typography>
              Foods: {basicFoodsCount}, Recipes: {recipeCount}
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <Typography>{uid}</Typography>
            <Stack
              spacing={2}
              direction="row"
              justifyContent="space-around"
              alignItems="center"
            >
              {uid === user.uid
                ? renderButtonOwnUser()
                : renderButtonOtherUser(userEntry)}
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderUserStack = (forAuthorized) => (
    <Stack sx={{ width: "100%" }} spacing={1}>
      {userList
        .filter((userEntry) => userEntry.isAuthorized === forAuthorized)
        .sort((userA, userB) => {
          if (userA.uid === user.uid) {
            return -1;
          }
          if (userB.uid === user.uid) {
            return 1;
          }
          return 0;
        })
        .map(renderUser)}
    </Stack>
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
            {longestEntryInfo && (
              <Stack spacing={1}>
                <Typography>Name: {longestEntryInfo.displayName}</Typography>
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
            <Button
              color="secondary"
              variant="contained"
              onClick={handleLongestEntry}
            >
              <Typography>Find longest entry</Typography>
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  };

  return (
    <div>
      <Typography
        variant="h4"
        sx={{
          color: "primary.main",
          textAlign: "center",
          paddingY: 2,
        }}
      >
        Users
      </Typography>
      <Stack spacing={3} alignItems="center">
        {renderUserManagmentCard()}
        <Stack sx={{ width: "95%" }} spacing={0.5}>
          {userList.some((userEntry) => !userEntry.isAuthorized) && (
            <Paper elevation={0} sx={{ paddingY: "10px", paddingX: "10px" }}>
              {renderUserStack(false)}
            </Paper>
          )}
          {renderUserStack(true)}
        </Stack>
        {renderLongestEntryCard()}
      </Stack>
    </div>
  );
}

export default Users;
