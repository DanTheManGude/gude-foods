import { useContext } from "react";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

import { addRecipeToShoppingList } from "../../utils/requests";

import {
  DatabaseContext,
  DataPathsContext,
  AddAlertContext,
} from "../Contexts";

function AddToShoppingListDialogue(props) {
  const { open, onClose, recipeId } = props;

  const database = useContext(DatabaseContext);
  const addAlert = useContext(AddAlertContext);

  const {
    cookbook: _cookbook,
    recipeOrder: _recipeOrder,
    menu: _menu,
  } = database;
  const cookbook = _cookbook || {};
  const menu = _menu || {};
  const recipeOrder = _recipeOrder || [];

  const dataPaths = useContext(DataPathsContext);

  const handleAdd = () => {
    addRecipeToShoppingList(
      recipeId,
      { recipeOrder, menu, cookbook },
      dataPaths,
      addAlert
    );
    onClose();
  };

  return (
    <Dialog
      sx={{
        "& .MuiDialog-paper": {
          width: "80%",
        },
      }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle>Add to Shopping List</DialogTitle>
      <DialogContent dividers={true}>{}</DialogContent>

      <DialogActions>
        <Button color="secondary" onClick={onClose} variant="contained">
          <Typography>Cancel</Typography>
        </Button>
        <Button color="primary" onClick={handleAdd} variant="contained">
          <Typography>Add</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddToShoppingListDialogue;
