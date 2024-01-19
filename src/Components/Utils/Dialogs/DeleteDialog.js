import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

function DeleteDialog(props) {
  const { open, onClose, titleDO, comfirmationMessageDO, handleDelete } = props;

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%" } }}
      maxWidth="xs"
      open={open}
      keepMounted
    >
      <DialogTitle color="primary">Confirm delete {titleDO}</DialogTitle>
      <DialogContent dividers>
        <Typography>Do you want to delete {comfirmationMessageDO}?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="contained">
          <Typography>Cancel</Typography>
        </Button>
        <Button onClick={handleDelete} color="error" variant="contained">
          <Typography>Delete</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteDialog;
