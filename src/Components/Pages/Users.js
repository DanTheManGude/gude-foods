import { useContext } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {} from "../../utils/requests";

import { AddAlertContext, DatabaseContext } from "../Contexts";

function Users(props) {
  const { user, userList, actingUser, setActingUser, clearActingUser } = props;

  const addAlert = useContext(AddAlertContext);
  const database = useContext(DatabaseContext);
  const { glossary, cookbook } = database;

  const renderUser = (userEntry) => {
    const { displayName, uid, isAuthorized } = userEntry;

    return (
      <Accordion key={uid} sx={{ width: "95%" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{displayName}</Typography>
        </AccordionSummary>
        <AccordionDetails>
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
                onClick={() => {}}
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
        {userList.map(renderUser)}
      </Stack>
    </div>
  );
}

export default Users;
