import { useState, useContext } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
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

function Collaboration() {
  const user = useContext(UserContext);
  const dataPaths = useContext(DataPathsContext);
  const database = useContext(DatabaseContext);
  const addAlert = useContext(AddAlertContext);

  const { collaboration } = database;
  const { collaborationPath } = dataPaths;

  console.log(collaboration);

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
    <div>
      <Typography
        variant="h4"
        sx={{
          color: "primary.main",
          textAlign: "center",
          paddingY: 2,
        }}
      >
        Collaboration
      </Typography>
      <Stack sx={{ paddingTop: "15px" }} spacing={2} alignItems="center">
        <Typography>
          Alow other users to view/ edit your account. You can specify which
          parts they can edit. Also, view/ edit the account of those who have
          gave you access.
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
            value={newUid}
            onChange={(event) => {
              setNewUid(event.target.value);
            }}
          />
          <Button
            variant="outlined"
            onClick={onSubmitNewUid}
            disabled={!newUid}
          >
            Give access
          </Button>
        </Stack>
      </Stack>
    </div>
  );
}

export default Collaboration;
