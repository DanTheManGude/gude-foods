import { useState, useContext } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import IconButton from "@mui/material/IconButton/IconButton";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import {
  giveReadAccesForCollaboration,
  revokeAccesForCollaboration,
} from "../../utils/requests";

import {
  AddAlertContext,
  DataPathsContext,
  DatabaseContext,
  UserContext,
} from "../Contexts";

function CollaborationCard() {
  const user = useContext(UserContext);
  const dataPaths = useContext(DataPathsContext);
  const database = useContext(DatabaseContext);
  const addAlert = useContext(AddAlertContext);

  const { collaboration } = database;
  const { collaborationPath } = dataPaths;

  const [newUid, setNewUid] = useState<string>("");
  const clearNewUid = () => setNewUid("");

  const onSubmitNewUid = () => {
    const givenUid = newUid;
    giveReadAccesForCollaboration(
      newUid,
      collaborationPath,
      () => {
        addAlert({
          alertProps: { severity: "success" },
          message: <Typography>Successfully gave Read access.</Typography>,
          undo: () => {
            revokeAccesForCollaboration(
              givenUid,
              collaborationPath,
              () =>
                addAlert({
                  alertProps: { severity: "success" },
                  message: (
                    <Typography>
                      Successfully removed access for {givenUid}.
                    </Typography>
                  ),
                }),
              addAlert
            );
          },
        });
        clearNewUid();
      },
      addAlert
    );
  };

  return (
    <Box sx={{ width: "95%" }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Collaboration
          </Typography>
          <Stack sx={{ width: "100%" }} spacing={3}>
            <Typography>
              Alow other users to view/ edit your information. Paste their User
              ID to allow them to view your data. You can specify which parts
              they can edit.
            </Typography>
            <Stack direction={"row"} flexWrap={"wrap"} alignItems={"center"}>
              <Typography>
                Share your UID for somone else to give you access. &nbsp;
              </Typography>
              <Typography>
                <code>{user.uid}</code>
              </Typography>
              <IconButton
                size={"small"}
                color="primary"
                onClick={() => {
                  navigator.clipboard.writeText(user.uid);
                }}
              >
                <ContentCopyRoundedIcon />
              </IconButton>
            </Stack>
            <Stack direction={"row"} justifyContent="space-between" spacing={1}>
              <TextField
                id="collaboration-uid-input"
                sx={{ flexGrow: 1 }}
                size="small"
                label="Enter UID"
                variant={"outlined"}
                // error={!!errorText}
                // helperText={errorText}
                value={newUid}
                onChange={(event) => {
                  setNewUid(event.target.value);
                }}
              />
              <Button variant="outlined" onClick={onSubmitNewUid}>
                Give access
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CollaborationCard;
