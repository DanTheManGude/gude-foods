import { useState, useContext } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import IconButton from "@mui/material/IconButton/IconButton";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
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
import PageTitle from "../Utils/PageTitle";

const RenderedInfoCard = (
  <Box sx={{ width: "95%" }}>
    <Card variant="outlined">
      <CardContent>
        <Typography>
          Alow other users to view & edit your account. You can specify which
          parts they can edit. Also, view & edit the account of those who have
          gave you access.
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

const ShareCard = ({ uid }: { uid: string }) => (
  <Box sx={{ width: "95%" }}>
    <Card variant="outlined">
      <CardContent>
        <Stack direction={"row"} flexWrap={"wrap"} alignItems={"center"}>
          <Typography>
            Share your UID for somone else to give you access. &nbsp;
          </Typography>
          <Typography>
            <code>{uid}</code>
          </Typography>
          <IconButton
            size={"small"}
            color="primary"
            onClick={() => {
              navigator.clipboard.writeText(uid);
            }}
          >
            <ContentCopyRoundedIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  </Box>
);

const NewAccessCard = ({
  onSubmitNewUid,
}: {
  onSubmitNewUid: (uid: string) => void;
}) => {
  const [newUid, setNewUid] = useState<string>("");
  const clearNewUid = () => setNewUid("");

  const hanldeNewUidSubmit = () => {
    onSubmitNewUid(newUid);
    clearNewUid();
  };

  return (
    <Box sx={{ width: "95%" }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1}>
            <Typography>
              Enter someone's UID to give access to your account.
            </Typography>
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
                onClick={hanldeNewUidSubmit}
                disabled={!newUid}
              >
                Give access
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

function Collaboration() {
  const user = useContext(UserContext);
  const dataPaths = useContext(DataPathsContext);
  const database = useContext(DatabaseContext);
  const addAlert = useContext(AddAlertContext);

  const { collaboration } = database;
  const { collaborationPath } = dataPaths;

  console.log(collaboration);

  const onSubmitNewUid = (newUid: string) => {
    giveReadAccesForCollaboration(
      newUid,
      collaborationPath,
      () => {
        addAlert({
          alertProps: { severity: "success" },
          message: <Typography>Successfully gave Read access.</Typography>,
          undo: () => {
            revokeAccesForCollaboration(
              newUid,
              collaborationPath,
              () =>
                addAlert({
                  alertProps: { severity: "success" },
                  message: (
                    <Typography>
                      Successfully removed access for {newUid}.
                    </Typography>
                  ),
                }),
              addAlert
            );
          },
        });
      },
      addAlert
    );
  };

  return (
    <div>
      <PageTitle>Collaboration</PageTitle>
      <Stack sx={{ paddingTop: "15px" }} spacing={2} alignItems="center">
        {RenderedInfoCard}
        <ShareCard uid={user.uid} />
        <NewAccessCard onSubmitNewUid={onSubmitNewUid} />
      </Stack>
    </div>
  );
}

export default Collaboration;
