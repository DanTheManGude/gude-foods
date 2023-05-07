import { useContext } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { setAuthorizationForUser } from "../../utils/requests";

import { DatabaseContext } from "../Contexts";

function Users(props) {
  const { user, userList, actingUser, setActingUser, clearActingUser } = props;

  const database = useContext(DatabaseContext);
  const { glossary, cookbook } = database;

  const renderUser = (userEntry) => {
    const { displayName, uid, isAuthorized } = userEntry;

    return (
      <Accordion key={uid} sx={{ width: "95%" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={2} alignItems={"flex-end"}>
            <Typography variant="h6">{displayName}</Typography>
            {!isAuthorized && (
              <Chip
                label="Unauthorized"
                size="small"
                variant="outlined"
                color="tertiary"
              />
            )}
            {uid === user.uid && (
              <Chip
                label="Own user"
                size="small"
                variant="outlined"
                sx={{ color: "alt.main" }}
              />
            )}
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Typography>{uid}</Typography>
            <Stack
              spacing={2}
              direction="row"
              justifyContent="space-around"
              alignItems="center"
            >
              {uid !== user.uid && (
                <Button
                  color="secondary"
                  variant="outlined"
                  size="large"
                  sx={{ flex: 1 }}
                  onClick={() => {
                    setAuthorizationForUser(uid, !isAuthorized);
                  }}
                >
                  <Typography>
                    {isAuthorized ? "Remove" : "Add"} Access
                  </Typography>
                </Button>
              )}
              <Button
                color="secondary"
                variant="contained"
                size="large"
                sx={{ flex: 1 }}
                disabled={
                  (actingUser && uid === actingUser.uid) ||
                  (!actingUser && uid === user.uid)
                }
                onClick={() => {
                  if (uid === user.uid) {
                    clearActingUser();
                  }
                  setActingUser(userEntry);
                }}
              >
                <Typography>
                  {uid === user.uid ? "Back to own user" : "Act as user"}
                </Typography>
              </Button>
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
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
      <Stack
        sx={{ paddingTop: "15px", width: "100%" }}
        spacing={1}
        alignItems="center"
      >
        {userList
          .sort((userA, userB) => {
            if (!userA.isAuthorized) {
              return -1;
            }
            if (!userB.isAuthorized) {
              return 1;
            }
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
    </div>
  );
}

export default Users;
