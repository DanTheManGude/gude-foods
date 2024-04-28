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
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Switch from "@mui/material/Switch";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  clearAccesForCollaboration,
  giveReadAccesForCollaboration,
  revokeAccesForCollaboration,
  updateEditAccessForCollaboration,
} from "../../utils/requests";

import {
  AddAlertContext,
  DataPathsContext,
  DatabaseContext,
  UserContext,
} from "../Contexts";
import PageTitle from "../Utils/PageTitle";
import {
  CollaborationEditKey,
  CollaborationEdits,
  CollaborationEntry,
  GenericEntries,
} from "../../types";
import { collaborationEditKeys, collaborationNames } from "../../constants";

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

  const { collaborationPath } = dataPaths;
  const { collaboration: collaboration_ } = database;
  const collaboration = collaboration_ || {};
  const { givesAccessTo = {}, hasAccessTo = {} } = collaboration;

  console.log(collaboration);

  const onSubmitNewUid = (newUid: string) => {
    giveReadAccesForCollaboration(
      user.uid,
      newUid,
      collaborationPath,
      () => {
        addAlert({
          alertProps: { severity: "success" },
          message: <Typography>Successfully gave Read access.</Typography>,
          undo: () => {
            revokeAccesForCollaboration(
              user.uid,
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

  const getOnChangeGiveAccessEdit =
    (uid: string, editKey: CollaborationEditKey) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateEditAccessForCollaboration(
        user.uid,
        uid,
        editKey,
        collaborationPath,
        event.target.checked,
        () => {
          addAlert({
            alertProps: { severity: "success" },
            message: <Typography>Successfully updated edit access.</Typography>,
          });
        },
        addAlert
      );
    };

  const getOnChangeGiveAccessRead =
    (uid: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        giveReadAccesForCollaboration(
          user.uid,
          uid,
          collaborationPath,
          () => {
            addAlert({
              alertProps: { severity: "success" },
              message: <Typography>Successfully gave Read access.</Typography>,
            });
          },
          addAlert
        );
      } else {
        clearAccesForCollaboration(
          user.uid,
          uid,
          collaborationPath,
          () => {
            addAlert({
              alertProps: { severity: "success" },
              message: <Typography>Successfully cleared access.</Typography>,
            });
          },
          addAlert
        );
      }
    };

  const getRemoveAccess = (uid: string) => () => {
    revokeAccesForCollaboration(
      user.uid,
      uid,
      collaborationPath,
      () =>
        addAlert({
          alertProps: { severity: "success" },
          message: (
            <Typography>Successfully removed access for {uid}.</Typography>
          ),
          undo: () =>
            giveReadAccesForCollaboration(
              user.uid,
              uid,
              collaborationPath,
              () => {
                addAlert({
                  alertProps: { severity: "success" },
                  message: (
                    <Typography>Successfully gave Read access.</Typography>
                  ),
                });
              },
              addAlert
            ),
        }),
      addAlert
    );
  };

  const renderGivesAccessUser = ([uid, { read, edit: editOptions = {} }]: [
    string,
    CollaborationEntry
  ]) => {
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
            <Typography variant="h6">Their name</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <Typography>{uid}</Typography>
            <Stack direction={"row"}>
              <Typography>{`Read all`}</Typography>
              <Switch
                checked={read}
                onChange={getOnChangeGiveAccessRead(uid)}
              />
            </Stack>
            {read ? (
              collaborationEditKeys.map((editKey) => (
                <Stack key={editKey} direction={"row"}>
                  <Typography>{collaborationNames[editKey]}</Typography>
                  <Switch
                    checked={editOptions[editKey]}
                    onChange={getOnChangeGiveAccessEdit(uid, editKey)}
                  />
                </Stack>
              ))
            ) : (
              <Button onClick={getRemoveAccess(uid)}>
                Remove user from list
              </Button>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  const getHandleActAsUser = (uid: string) => () => {
    console.log(uid);
  };

  const renderHasAccessToUser = ([uid, { read, edit }]: [
    string,
    CollaborationEntry
  ]) => {
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
            <Typography variant="h6">Their name</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <Typography>{uid}</Typography>
            <Stack direction={"row"}>
              {read ? (
                <Typography>{`Read all`}</Typography>
              ) : (
                <Typography>{`No read access`}</Typography>
              )}
              {(Object.entries(edit) as GenericEntries<CollaborationEdits>).map(
                ([key, value]) =>
                  value ? (
                    <Typography>{collaborationNames[key]}</Typography>
                  ) : null
              )}
            </Stack>
            <Button onClick={getHandleActAsUser(uid)}>Act as user</Button>
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <div>
      <PageTitle>Collaboration</PageTitle>
      <Stack sx={{ paddingTop: 1 }} spacing={2} alignItems="center">
        {RenderedInfoCard}
        <ShareCard uid={user.uid} />
        <NewAccessCard onSubmitNewUid={onSubmitNewUid} />
        <Box sx={{ width: "95%" }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Users that have access to your account
              </Typography>
              <Stack sx={{ width: "95%" }}>
                {Object.entries(givesAccessTo).map(renderGivesAccessUser)}
              </Stack>
            </CardContent>
          </Card>
        </Box>
        <Stack sx={{ width: "95%" }}>
          {Object.entries(hasAccessTo).map(renderHasAccessToUser)}
        </Stack>
      </Stack>
    </div>
  );
}

export default Collaboration;
