import { useState } from "react";

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
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { updateRequest, deleteRequest } from "../utils";

function Settings(props) {
  const {
    addAlert,
    glossary,
    basicFoodTagAssociation,
    basicFoodTagOrder,
    shoppingList,
    cookbook,
    user,
    glossaryPath,
    basicFoodTagAssociationPath,
    basicFoodTagOrderPath,
    shoppingListPath,
    cookbookPath,
  } = props;

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleDelete = () => {
    setOpenDeleteDialog(false);
    deleteRequest(
      [
        glossaryPath,
        basicFoodTagAssociationPath,
        basicFoodTagOrderPath,
        shoppingListPath,
        cookbookPath,
      ],
      addAlert
    );
  };

  const handeFileImport = (file) => {
    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = () => {
      const data = JSON.parse(reader.result);

      updateRequest(
        {
          [glossaryPath]: data.glossary,
          [basicFoodTagAssociationPath]: data.basicFoodTagAssociation,
          [basicFoodTagOrderPath]: data.basicFoodTagOrder,
          [shoppingListPath]: data.shoppingList,
          [cookbookPath]: data.cookbook,
        },
        addAlert
      );
    };

    reader.onerror = () => {
      addAlert({
        message: reader.error,
        title: "Error with importing file",
        alertProps: { severity: "error" },
      });
    };
  };

  const onDownload = () => {
    const data = JSON.stringify(
      {
        user: { email: user.email, uid: user.uid },
        glossary,
        basicFoodTagAssociation,
        basicFoodTagOrder,
        shoppingList,
        cookbook,
      },
      null,
      2
    );

    const element = document.createElement("a");
    element.download = `gudefoods-download.json`;
    element.href = `data:text/json;charset=utf-8,${encodeURIComponent(data)}`;
    element.click();
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
            <input
              accept=".json"
              style={{ display: "none" }}
              id="import-button-file"
              type="file"
              onChange={(event) => {
                handeFileImport(event.target.files[0]);
              }}
            />
            <label htmlFor="import-button-file">
              <Button variant="outlined" color="secondary" component="span">
                Import
              </Button>
            </label>
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
        <Button onClick={handleDelete} color="error">
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
