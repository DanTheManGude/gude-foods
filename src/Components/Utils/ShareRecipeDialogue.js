import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

import { makeLinkAndMaybeShare } from "../../utils/utility";
import {
  downloadData,
  transformRecipeForExport,
} from "../../utils/dataTransfer";
import { removeSharedRecipe } from "../../utils/requests";

import {
  DatabaseContext,
  AddAlertContext,
  UserContext,
  DataPathsContext,
} from "../Contexts";

const errorCopyAlert = {
  message: <span>Error trying to copy to your clipboard</span>,
  alertProps: { severity: "error" },
};

function ShareRecipeDialogue(props) {
  const { open, onClose, recipe, recipeId } = props;
  const { sharedId } = recipe;

  let navigate = useNavigate();
  const user = useContext(UserContext);
  const addAlert = useContext(AddAlertContext);
  const database = useContext(DatabaseContext);
  const dataPaths = useContext(DataPathsContext);
  const { glossary: _glossary } = database;
  const { cookbookPath } = dataPaths;

  const glossary = _glossary || {};

  const handleStopSharing = () => {
    removeSharedRecipe(sharedId, `${cookbookPath}/${recipeId}`, addAlert);
    onClose();
  };

  const handleCopyLink = async () => {
    const shareLink = await makeLinkAndMaybeShare(
      recipe,
      glossary,
      user,
      recipeId,
      cookbookPath,
      addAlert
    );

    if (!shareLink) {
      return;
    }

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
          {sharedId && (
            <Button
              color="error"
              onClick={handleStopSharing}
              variant="outlined"
            >
              <Typography>Stop sharing</Typography>
            </Button>
          )}
          {sharedId && (
            <Button
              color="primary"
              onClick={() => {
                navigate(`/share/${sharedId}`);
              }}
              variant="contained"
            >
              <Typography>Visit shared</Typography>
            </Button>
          )}
          <Button color="secondary" onClick={onClose} variant="contained">
            <Typography>Cancel</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ShareRecipeDialogue;
