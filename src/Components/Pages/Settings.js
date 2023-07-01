import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { defaultColorKey, colorOptions } from "../../constants";
import { setAllData, deleteRequest, uploadColors } from "../../utils/requests";
import { downloadData } from "../../utils/dataTransfer";

import ImportFileButton from "../Utils/ImportFileButton";
import UserCard from "../Utils/UserCard";
import FavoriteTag from "../Utils/FavoriteTag";

import {
  AddAlertContext,
  DataPathsContext,
  DatabaseContext,
  UserContext,
} from "../Contexts";

function Settings(props) {
  const { actingUser, clearActingUser, isAdmin } = props;

  const addAlert = useContext(AddAlertContext);
  const dataPaths = useContext(DataPathsContext);
  const database = useContext(DatabaseContext);
  const user = useContext(UserContext);

  let navigate = useNavigate();

  const { colorKeyPath } = dataPaths;
  const { colorKey: _colorKey } = database;
  const colorKey = _colorKey || defaultColorKey;

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [shouldShowPreview, setShouldShowPreview] = useState(false);

  const updateColors = (givenColorKey) => {
    uploadColors(colorKeyPath, givenColorKey, addAlert);
  };

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

  const renderUserManagmentCard = () => {
    if (!isAdmin) {
      return null;
    }

    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              User managment
            </Typography>
            <Typography>
              Change setting to allow any user access to an account without
              authorization and act as other users.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              color="secondary"
              variant="outlined"
              onClick={() => navigate("/users")}
            >
              View all users
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  };

  const renderAppCard = () => {
    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Application
            </Typography>
            <Typography>
              Current version: <strong>{process.env.REACT_APP_VERSION}</strong>
            </Typography>
            <Typography>
              The source code for this website is hosted&nbsp;
              <Link
                underline="none"
                href="https://github.com/DanTheManGude/gude-foods"
                target="_blank"
                rel="noopener"
                color="secondary"
              >
                {"here "}
                <OpenInNewIcon
                  fontSize="inherit"
                  sx={{ verticalAlign: "sub" }}
                />
              </Link>
              .
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderPreview = () => {
    if (!shouldShowPreview) {
      return null;
    }

    return (
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-around"
        >
          <Button color="primary" variant="contained">
            primary filled
          </Button>
          <Button color="secondary" variant="contained">
            secondary filled
          </Button>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-around"
        >
          <Button color="primary" variant="outlined">
            primary outlined
          </Button>
          <Button color="secondary" variant="outlined">
            secondary outlined
          </Button>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-around"
        >
          <Button color="error" variant="contained">
            Delete
          </Button>
          <Button color="warning" variant="contained">
            Warning
          </Button>
          <Button color="success" variant="contained">
            Success
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <FavoriteTag />
          <Chip
            label={<Typography>Tag A</Typography>}
            size="small"
            variant="contained"
            color="tertiary"
          />
          <Chip
            label={<Typography>Tag B</Typography>}
            size="small"
            variant="contained"
            color="tertiary"
          />
        </Stack>
      </Stack>
    );
  };

  const renderColorCard = () => {
    const labelText = "Select theme";
    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Theme
            </Typography>
            <Stack sx={{ width: "100%" }} spacing={3}>
              <Typography>
                Change the colors used in the app for your account.
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="flex-end"
              >
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => {
                    setShouldShowPreview(!shouldShowPreview);
                  }}
                >
                  {shouldShowPreview ? "Hide preview" : "Show preview"}
                </Button>
                <FormControl
                  size="small"
                  variant="outlined"
                  sx={{ width: "80%", maxWidth: "200px" }}
                >
                  <InputLabel>{labelText}</InputLabel>
                  <Select
                    value={colorKey}
                    onChange={(event) => {
                      updateColors(event.target.value);
                      setShouldShowPreview(true);
                    }}
                    label={labelText}
                  >
                    {colorOptions.map((option) => (
                      <MenuItem key={option.key} value={option.key}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              {renderPreview()}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderDownloadData = () => {
    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Download Data
            </Typography>
            <Typography>
              Download all data that is stored relating to your account.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button color="secondary" variant="outlined" onClick={onDownload}>
              Download
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  };

  const renderImportData = () => {
    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Import Data
            </Typography>
            <Typography>
              Import a previosuly dowloaded file of all your data. Note that
              this will override your current data.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <ImportFileButton
              onSuccess={(fileData) =>
                setAllData(fileData, dataPaths, addAlert)
              }
              buttonProps={{
                variant: "outlined",
                color: "secondary",
              }}
              buttonText="Import"
              id="settings"
            />
          </CardActions>
        </Card>
      </Box>
    );
  };

  const renderDeleteData = () => {
    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Delete Data
            </Typography>
            <Typography>
              Delete all data on your account. It is recomended to download a
              copy for youself before deleting.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              color="error"
              variant="contained"
              onClick={() => {
                setOpenDeleteDialog(true);
              }}
            >
              Delete
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
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
          variant="outlined"
          onClick={() => {
            setOpenDeleteDialog(false);
          }}
          color="secondary"
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
    <div>
      <Typography
        variant="h4"
        sx={{
          color: "primary.main",
          textAlign: "center",
          paddingY: 2,
        }}
      >
        Settings
      </Typography>
      <Stack sx={{ paddingTop: "15px" }} spacing={3} alignItems="center">
        <UserCard
          user={user}
          actingUser={actingUser}
          clearActingUser={clearActingUser}
          addAlert={addAlert}
        />
        {renderUserManagmentCard()}
        {renderColorCard()}
        {renderAppCard()}
        {renderDownloadData()}
        {renderImportData()}
        {renderDeleteData()}
      </Stack>
      {renderDeleteDialog()}
    </div>
  );
}

export default Settings;
