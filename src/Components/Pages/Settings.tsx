import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

import { ActingUser } from "../../types";
import { aboutText } from "../../constants";
import { setAllData, deleteRequest } from "../../utils/requests";
import { downloadData } from "../../utils/dataTransfer";

import ImportFileButton from "../Utils/ImportFileButton";
import UserCard from "../Utils/UserCard";
import ColorCard from "../Utils/ColorCard";
import PageTitle from "../Utils/PageTitle";
import CollaborationCard from "../Utils/CollaborationCard";

import {
  AddAlertContext,
  DataPathsContext,
  DatabaseContext,
  UserContext,
} from "../Contexts";

const SettingsCard = ({
  title,
  cardContent,
  cardActions,
}: {
  title: string;
  cardContent?: React.JSX.Element;
  cardActions?: any;
}) => (
  <Box sx={{ width: "95%" }}>
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {cardContent}
      </CardContent>
      {cardActions && (
        <CardActions sx={{ justifyContent: "flex-end" }}>
          {cardActions}
        </CardActions>
      )}
    </Card>
  </Box>
);

function Settings(props: {
  actingUser: ActingUser;
  clearActingUser: () => void;
  isAdmin: boolean;
  enableUsingOffline: () => void;
}) {
  const { actingUser, clearActingUser, isAdmin, enableUsingOffline } = props;

  let navigate = useNavigate();

  const addAlert = useContext(AddAlertContext);
  const dataPaths = useContext(DataPathsContext);
  const database = useContext(DatabaseContext);
  const user = useContext(UserContext);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleDelete = () => {
    setOpenDeleteDialog(false);
    deleteRequest(Object.values(dataPaths), addAlert);
  };

  const onDownload = () => {
    const userInfo = !actingUser
      ? { name: user.displayName, email: user.email, uid: user.uid }
      : { name: actingUser.displayName, uid: actingUser.uid };
    const data = {
      user: userInfo,
      ...database,
    };

    downloadData(data);
  };

  const renderDeleteDialog = () => (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%" } }}
      maxWidth="xs"
      open={openDeleteDialog}
      keepMounted
    >
      <DialogTitle color="primary">Confirm delete data</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Do you want to delete all data associated with this account?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            setOpenDeleteDialog(false);
          }}
          color="primary"
        >
          <Typography>Cancel</Typography>
        </Button>
        <Button onClick={handleDelete} color="error" variant="contained">
          <Typography>Delete</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <PageTitle>Settings</PageTitle>
      <Stack sx={{ paddingTop: "15px" }} spacing={3} alignItems="center">
        <UserCard
          user={user}
          addAlert={addAlert}
          actingUser={actingUser}
          clearActingUser={clearActingUser}
        />
        {isAdmin && (
          <SettingsCard
            title={"Admin"}
            cardContent={<Typography>View Admin page and controls.</Typography>}
            cardActions={
              <Button
                color="secondary"
                variant="contained"
                onClick={() => navigate("/admin")}
              >
                <Typography>Go to Admin page</Typography>
              </Button>
            }
          />
        )}
        <ColorCard />
        <CollaborationCard />
        <SettingsCard
          title={"About"}
          cardContent={
            <Typography style={{ whiteSpace: "pre-line" }}>
              {aboutText}
            </Typography>
          }
        />
        <SettingsCard
          title={"Offline"}
          cardContent={
            <Typography>View the recipes saved for offline.</Typography>
          }
          cardActions={
            <Button
              color="secondary"
              variant="outlined"
              onClick={enableUsingOffline}
            >
              <Typography>Use offline mode</Typography>
            </Button>
          }
        />
        <SettingsCard
          title={"Download Data"}
          cardContent={
            <Typography>
              Download all data that is stored relating to your account.
            </Typography>
          }
          cardActions={
            <Button color="secondary" variant="outlined" onClick={onDownload}>
              <Typography>Download</Typography>
            </Button>
          }
        />
        <SettingsCard
          title={"Import Data"}
          cardContent={
            <Typography>
              Import a previosuly dowloaded file of all your data. Note that
              this will override your current data.
            </Typography>
          }
          cardActions={
            <ImportFileButton
              customHandler={(fileData) =>
                setAllData(fileData, dataPaths, addAlert)
              }
              shouldUseCustomHandler={true}
              buttonProps={{
                variant: "outlined",
                color: "secondary",
              }}
              buttonText="Import"
              id="settings"
            />
          }
        />
        <SettingsCard
          title={"Delete Data"}
          cardContent={
            <Typography>
              Delete all data on your account. It is recomended to download a
              copy for youself before deleting.
            </Typography>
          }
          cardActions={
            <Button
              color="error"
              variant="contained"
              onClick={() => {
                setOpenDeleteDialog(true);
              }}
            >
              <Typography>Delete</Typography>
            </Button>
          }
        />
      </Stack>
      {renderDeleteDialog()}
    </>
  );
}

export default Settings;
