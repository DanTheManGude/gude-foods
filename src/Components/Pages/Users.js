import { useContext } from "react";

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
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  setAuthorizationForUser,
  updateAllowUnrestrictedUsers,
} from "../../utils/requests";

import { UserContext } from "../Contexts";

function Users(props) {
  const {
    userList,
    actingUser,
    setActingUser,
    clearActingUser,
    allowUnrestrictedUsers,
  } = props;

  const user = useContext(UserContext);

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
      color="primary"
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
          color={isAuthorized ? "error" : "primary"}
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
          color="primary"
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
        <AccordionSummary
          expandIcon={
            <IconButton>
              <ExpandMoreIcon />
            </IconButton>
          }
        >
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
      </Stack>
    </div>
  );
}

export default Users;
