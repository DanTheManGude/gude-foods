import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { setAuthorizationForUser } from "../../utils/requests";

function Users(props) {
  const { user, userList, actingUser, setActingUser, clearActingUser } = props;

  const renderUser = (userEntry) => {
    const { displayName, uid, isAuthorized, basicFoodsCount, recipeCount } =
      userEntry;

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
      <Stack sx={{ width: "95%" }} spacing={0.5}>
        {userList.some((userEntry) => !userEntry.isAuthorized) && (
          <Paper elevation={0} sx={{ paddingY: "10px", paddingX: "10px" }}>
            {renderUserStack(false)}
          </Paper>
        )}
        {renderUserStack(true)}
      </Stack>
    </div>
  );
}

export default Users;
