import { useContext } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

import { constructShareRecipeLink } from "../../utils/utility";
import {
  downloadData,
  transformRecipeForExport,
} from "../../utils/dataTransfer";

import { DatabaseContext, AddAlertContext } from "../Contexts";

const errorCopyAlert = {
  message: <span>There was an error trying to copy to your clipboard.</span>,
  alertProps: { severity: "warning" },
};

function ShareRecipeDialogue(props) {
  const { open, onClose, recipe } = props;

  const addAlert = useContext(AddAlertContext);
  const database = useContext(DatabaseContext);
  const { glossary: _glossary } = database;

  const glossary = _glossary || {};

  const handleCopyLink = () => {
    const shareLink = constructShareRecipeLink(recipe, glossary);

    if (!navigator?.clipboard?.writeText) {
      addAlert(errorCopyAlert);
      return;
    }

    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        addAlert({
          message: <span>The link has been copied to your clipboard.</span>,
          alertProps: { severity: "success" },
        });
        onClose();
      })
      .catch(() => {
        addAlert(errorCopyAlert);
      });
  };

  const handleDownloadRecipe = () => {
    const recipeData = transformRecipeForExport(recipe, glossary);

    downloadData(recipeData, recipeData.name);
  };

  const renderButtonStack = () => (
    <Stack spacing={2}>
      <Button
        key="link"
        size="large"
        color="primary"
        variant="contained"
        onClick={handleCopyLink}
        endIcon={<ContentCopyRoundedIcon />}
      >
        <Typography>Copy link to recipe</Typography>
      </Button>
      <Button
        key="export"
        size="large"
        color="primary"
        variant="outlined"
        onClick={handleDownloadRecipe}
      >
        <Typography>Download file of recipe data</Typography>
      </Button>
    </Stack>
  );

  return (
    <>
      <Dialog
        sx={{
          "& .MuiDialog-paper": {
            width: "80%",
          },
        }}
        maxWidth="xs"
        open={open}
      >
        <DialogTitle>Share recipe</DialogTitle>
        <DialogContent dividers={true}>{renderButtonStack()}</DialogContent>

        <DialogActions>
          <Button color="secondary" onClick={onClose} variant="contained">
            <Typography>Cancel</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ShareRecipeDialogue;
