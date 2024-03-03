import { useContext, useEffect, useState } from "react";

import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import ButtonGroup from "@mui/material/ButtonGroup";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import { addRecipeToShoppingList } from "../../../utils/requests";

import IngredientList from "../IngredientList";

import {
  DatabaseContext,
  DataPathsContext,
  AddAlertContext,
} from "../../Contexts";

const MenuCount = styled(Button)(
  ({ theme }) => `
  &&& {
    &.Mui-disabled {
      color: ${theme.palette.text.primary};
      border-color: ${theme.palette.text.primary};
    }
  }
`
);

function AddToShoppingListDialog(props) {
  const { open, onClose, recipeId } = props;

  const dataPaths = useContext(DataPathsContext);
  const database = useContext(DatabaseContext);
  const addAlert = useContext(AddAlertContext);

  const { cookbook, recipeOrder: _recipeOrder, menu: _menu } = database;
  const menu = _menu || {};
  const recipeOrder = _recipeOrder || [];

  const [ingredients, setIngredients] = useState({});

  const [count, setCount] = useState(1);
  const incrementCount = () => {
    setCount((prevCount) => prevCount + 1);
  };
  const decrementCount = () => {
    setCount((prevCount) => prevCount - 1);
  };

  useEffect(() => {
    if (cookbook && cookbook[recipeId]) {
      setIngredients(cookbook[recipeId].ingredients);
    }
  }, [cookbook, recipeId]);

  const handleClose = () => {
    setCount(1);

    onClose();
  };

  const handleAdd = () => {
    addRecipeToShoppingList(
      recipeId,
      count,
      ingredients,
      { recipeOrder, menu },
      dataPaths,
      addAlert
    );
    handleClose();
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
      <DialogContent dividers={true}>
        <IngredientList
          ingredients={ingredients}
          supplementalIngredientInfo={
            cookbook[recipeId].supplementalIngredientInfo
          }
          editable={true}
          updateIngredients={setIngredients}
          isForShoppingList={true}
        />
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1}>
          <ButtonGroup variant="outlined" size="small" color="primary">
            <Button disabled={count === 1} onClick={decrementCount}>
              <RemoveIcon />
            </Button>
            <MenuCount disabled sx={{ color: "primary" }}>
              <Typography sx={{ fontWeight: "bold" }}>{count}</Typography>
            </MenuCount>
            <Button
              onClick={incrementCount}
              sx={{ borderLeftColor: "text.primary" }}
            >
              <AddIcon />
            </Button>
          </ButtonGroup>
          <Button color="secondary" onClick={handleClose} variant="contained">
            <Typography>Cancel</Typography>
          </Button>
          <Button color="primary" onClick={handleAdd} variant="contained">
            <Typography>Add</Typography>
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

export default AddToShoppingListDialog;
