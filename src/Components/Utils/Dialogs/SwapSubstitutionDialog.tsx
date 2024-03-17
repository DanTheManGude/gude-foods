import { useContext } from "react";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

import { AddAlert, IndividualShoppingListFoodInfo } from "../../../types";
import { swapSubstitutionInShoppingList } from "../../../utils/requests";
import {
  AddAlertContext,
  DatabaseContext,
  DataPathsContext,
} from "../../Contexts";

function SwapSubstitutionDialog(props: {
  open: boolean;
  onClose: () => void;
  basicFoodId: string;
  recipeId: string;
  foodInfo: IndividualShoppingListFoodInfo;
}) {
  const { open, onClose, basicFoodId, recipeId, foodInfo } = props;

  const addAlert = useContext(AddAlertContext);
  const dataPaths = useContext(DataPathsContext);
  const { shoppingListPath } = dataPaths;
  const database = useContext(DatabaseContext);
  const { glossary, basicFoodTagAssociation, cookbook } = database;

  if (!open || !foodInfo) {
    return null;
  }

  const getOnSuccess =
    (givenBasicFoodId: string, givenFoodInfo: IndividualShoppingListFoodInfo) =>
    () => {
      addAlert({
        message: (
          <Typography>{`Successfully swapped ${
            glossary.basicFoods[givenBasicFoodId]
          } with ${glossary.basicFoods[givenFoodInfo.substitution.foodId]} [${
            glossary.basicFoodTags[
              basicFoodTagAssociation[givenFoodInfo.substitution.foodId]
            ]
          }]`}</Typography>
        ),
        alertProps: { severity: "success" },
        undo: () => {
          const newFoodInfo: IndividualShoppingListFoodInfo = {
            ...givenFoodInfo,
            amount: givenFoodInfo.substitution.amount,
            substitution: {
              amount: givenFoodInfo.amount,
              foodId: givenBasicFoodId,
            },
          };

          swapSubstitutionInShoppingList(
            shoppingListPath,
            givenFoodInfo.substitution.foodId,
            recipeId,
            newFoodInfo,
            getOnSuccess(givenFoodInfo.substitution.foodId, newFoodInfo),
            onFailure
          );
        },
      });
      onClose();
    };

  const onFailure: AddAlert = (...args) => {
    onClose();
    addAlert(...args);
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%" } }}
      maxWidth="xs"
      open={open}
      keepMounted
    >
      <DialogTitle color="primary">Swap food</DialogTitle>
      <DialogContent dividers>
        <Typography>
          {`For recipe ${cookbook[recipeId].name}, do you want to swap ${glossary.basicFoods[basicFoodId]} (${foodInfo.amount}) with`}
        </Typography>
        <Typography sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>
          {`${glossary.basicFoods[foodInfo.substitution.foodId]} (${
            foodInfo.substitution.amount
          })?`}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="contained">
          <Typography>Cancel</Typography>
        </Button>
        <Button
          onClick={() =>
            swapSubstitutionInShoppingList(
              shoppingListPath,
              basicFoodId,
              recipeId,
              foodInfo,
              getOnSuccess(basicFoodId, foodInfo),
              onFailure
            )
          }
          color="primary"
          variant="contained"
        >
          <Typography>Swap</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SwapSubstitutionDialog;
