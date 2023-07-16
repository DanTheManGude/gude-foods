import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

function NewRecipeDialogue(props) {
  const { open, onClose } = props;

  return (
    <Dialog
      sx={{
        "& .MuiDialog-paper": {
          width: "80%",
        },
        "& .MuiDialog-container": {
          marginBottom: "100px",
        },
      }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle color="primary">New recipe</DialogTitle>
      <DialogContent dividers>
        <Stack></Stack>
      </DialogContent>

      <DialogActions>
        <Button color="secondary" onClick={onClose} variant="contained">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewRecipeDialogue;
