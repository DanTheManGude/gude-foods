import { useContext } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import {} from "../../utils/requests";

import { AddAlertContext, DatabaseContext } from "../Contexts";

function Users(props) {
  const { user, userList, activeUser, setActiveUser, clearActiveUser } = props;

  const addAlert = useContext(AddAlertContext);
  const database = useContext(DatabaseContext);
  const { glossary, cookbook } = database;

  const renderUser = (userEntry) => {
    const { displayName, uid, isAuthorized } = userEntry;

    return (
      <Accordion key={uid}>
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
            <Button
              color="warning"
              variant="outlined"
              size="large"
              disabled={uid === user.uid}
              sx={{ flex: 1 }}
              onClick={() => {}}
            >
              <Typography color="secondary">
                {isAuthorized ? "Remove" : "Add"} Authorization
              </Typography>
            </Button>
            <Button
              color="secondary"
              variant="contained"
              size="large"
              sx={{ flex: 1 }}
              disabled={uid === activeUser.uid}
              onClick={() => {
                if (uid === user.uid) {
                  clearActiveUser();
                }
                setActiveUser(userEntry);
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
