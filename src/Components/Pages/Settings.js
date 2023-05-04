import { useState, useContext } from "react";

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

import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { defaultColorKey, colorOptions } from "../../constants";
import { setAllData, deleteRequest, uploadColors } from "../../utils/requests";
import { downloadData } from "../../utils/dataTransfer";
import { signOutGoogle } from "../../utils/googleAuth";
import ImportFileButton from "../Utils/ImportFileButton";
import {
  AddAlertContext,
  DataPathsContext,
  DatabaseContext,
} from "../Contexts";

function Settings(props) {
  const { user } = props;

  const addAlert = useContext(AddAlertContext);
  const dataPaths = useContext(DataPathsContext);
  const database = useContext(DatabaseContext);

  const { colorKeyPath } = dataPaths;
  const { colorKey: _colorKey } = database;
  const colorKey = _colorKey || defaultColorKey;

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const updateColors = (givenColorKey) => {
    uploadColors(colorKeyPath, givenColorKey, addAlert);
  };

  const handleDelete = () => {
    setOpenDeleteDialog(false);
    deleteRequest(Object.values(dataPaths), addAlert);
  };

  const onDownload = () => {
    const data = {
      user: { name: user.displayName, email: user.email, uid: user.uid },
      ...database,
    };

    downloadData(data);
  };

  const handleLogout = () => {
    signOutGoogle(addAlert);
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

  const renderUserCard = () => {
    if (!user) {
      return;
    }
    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Current user
            </Typography>
            <Typography>
              You are currently logged in as: <strong>{user.email}</strong>
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button color="secondary" variant="outlined" onClick={handleLogout}>
              Logout
            </Button>
          </CardActions>
        </Card>
      </Box>
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
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>{labelText}</InputLabel>
                <Select
                  sx={{ maxWidth: "200px" }}
                  value={colorKey}
                  onChange={(event) => {
                    updateColors(event.target.value);
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
              onSuccess={(fileData) => setAllData(fileData, addAlert)}
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
              variant="outlined"
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
          autoFocus
          onClick={() => {
            setOpenDeleteDialog(false);
          }}
          color="secondary"
        >
          <Typography>Cancel</Typography>
        </Button>
        <Button onClick={handleDelete} color="error" variant="outlined">
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
        {renderUserCard()}
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
