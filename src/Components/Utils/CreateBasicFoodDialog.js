import { useContext } from "react";

import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

import { updateRequest, createKey } from "../../utils/requests";
import { DataPathsContext } from "../Contexts";
import DepartmentFormControl from "./DepartmentFormControl";

function CreateBasicFoodDialog(props) {
  const {
    open,
    createBasicFood,
    setCreateBasicFood,
    handleSelectedFood,
    onClose,
  } = props;
  const { basicFoodTagAssociationPath, glossaryPath } =
    useContext(DataPathsContext);

  const handleCreate = () => {
    const foodId = createKey(`${glossaryPath}/basicFoods`);
    const updates = {};
    updates[`${glossaryPath}/basicFoods/${foodId}`] = createBasicFood.name;
    if (createBasicFood.tagId) {
      updates[`${basicFoodTagAssociationPath}/${foodId}`] =
        createBasicFood.tagId;
    }
    updateRequest(updates);
    handleSelectedFood(foodId);
    onClose();
  };

  return (
    <Dialog
      open={open}
      sx={{ "& .MuiDialog-paper": { width: "80%" } }}
      maxWidth="xs"
    >
      <DialogTitle color="primary">Create a new basic food</DialogTitle>
      <DialogContent dividers>
        <Stack
          key={"createBasicFood"}
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          spacing={2}
        >
          <TextField
            variant="outlined"
            label={"Food name"}
            size="small"
            sx={{ width: "150px" }}
            value={createBasicFood.name || ""}
            onChange={(event) => {
              setCreateBasicFood((previous) => ({
                ...previous,
                name: event.target.value,
              }));
            }}
            inputProps={{
              autoCapitalize: "none",
            }}
          />
          <DepartmentFormControl
            id="tag"
            value={createBasicFood.tagId || ""}
            onChange={(event) => {
              setCreateBasicFood((previous) => ({
                ...previous,
                tagId: event.target.value,
              }));
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={onClose} variant="contained">
          Cancel
        </Button>
        <Button
          color="primary"
          disabled={!createBasicFood.name}
          variant="contained"
          onClick={handleCreate}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateBasicFoodDialog;
