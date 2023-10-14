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

import { shareRecipe, constructShareRecipeLink } from "../../utils/utility";
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
  message: <Typography>Error trying to copy. Try again please.</Typography>,
  alertProps: { severity: "error" },
};

function ShareRecipeDialogue(props) {
  const { open, onClose, recipe, recipeId } = props;
  const { shareId, name } = recipe;

  let navigate = useNavigate();
  const user = useContext(UserContext);
  const addAlert = useContext(AddAlertContext);
  const database = useContext(DatabaseContext);
  const dataPaths = useContext(DataPathsContext);
  const { glossary: _glossary } = database;
  const { cookbookPath } = dataPaths;

  const glossary = _glossary || {};

  const handleStopSharing = () => {
    removeSharedRecipe(shareId, `${cookbookPath}/${recipeId}`, addAlert);
  };

  const handleStartSharing = () => {
    shareRecipe(recipe, glossary, user, recipeId, cookbookPath, addAlert);
  };

  const handleCopyLink = async () => {
    if (!navigator?.clipboard?.writeText) {
      addAlert(errorCopyAlert);
      return;
    }

    const shareLink = constructShareRecipeLink(shareId, name);

    await navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        addAlert({
          message: (
            <Typography>The link has been copied to your clipboard.</Typography>
          ),
          alertProps: { severity: "success" },
        });
      })
      .catch((error) => {
        console.log(error);
        addAlert(errorCopyAlert);
      });

    onClose();
  };

  const handleDownloadRecipe = () => {
    const recipeData = transformRecipeForExport(recipe, glossary);

    downloadData(recipeData, recipeData.name);
  };

  const renderLinkSharingButton = () => {
    if (shareId) {
      return (
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
      );
    }

    return (
      <Button
        key="link"
        size="large"
        color="primary"
        variant="contained"
        onClick={handleStartSharing}
      >
        <Typography>Share recipe with a link</Typography>
      </Button>
    );
  };

  const renderButtonStack = () => (
    <Stack spacing={2}>
      {renderLinkSharingButton()}
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
          <Stack direction="row" spacing={2}>
            {shareId && (
              <Button
                color="error"
                onClick={handleStopSharing}
                variant="outlined"
                sx={{ flex: "5" }}
              >
                <Typography>Stop sharing</Typography>
              </Button>
            )}
            {shareId && (
              <Button
                color="primary"
                onClick={() => {
                  navigate(`/share/${shareId}`);
                }}
                variant="contained"
                sx={{ flex: "5" }}
              >
                <Typography>Visit shared</Typography>
              </Button>
            )}
            <Button
              color="secondary"
              onClick={onClose}
              variant="contained"
              sx={{ flex: "4" }}
            >
              <Typography>Cancel</Typography>
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ShareRecipeDialogue;
