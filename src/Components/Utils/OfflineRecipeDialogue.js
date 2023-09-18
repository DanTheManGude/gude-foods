import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

import ImportFileButton from "../Utils/ImportFileButton";

function OfflineRecipeDialogue(props) {
  const { open, onClose, setRecipe } = props;

  const selectRecipe = (recipe) => {
    setRecipe(recipe);
    onClose();
  };

  const renderControlsStack = () => (
    <Stack spacing={2}>
      <ImportFileButton
        customHandler={selectRecipe}
        shouldUseCustomHandler={true}
        buttonProps={{
          variant: "contained",
          sx: { width: "100%" },
        }}
        buttonText="Import Recipe from device"
        id="import-offline-recipe"
      />
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
        <DialogTitle>Select recipe</DialogTitle>
        <DialogContent dividers={true}>{renderControlsStack()}</DialogContent>

        <DialogActions>
          <Button color="secondary" onClick={onClose} variant="contained">
            <Typography>Cancel</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default OfflineRecipeDialogue;
