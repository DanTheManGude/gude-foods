import Stack from "@mui/material/Stack";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import { updateRequest, createKey } from "../utils";

function CreateBasicFoodDialog(props) {
  const {
    open,
    createBasicFood,
    setCreateBasicFood,
    handleSelectedFood,
    onClose,
    glossary,
    basicFoodTagOrder,
    glossaryPath,
    basicFoodTagAssociationPath,
  } = props;

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
          <FormControl size="small" variant="standard">
            <InputLabel id="tag" style={{ top: "-11px" }}>
              Dept.
            </InputLabel>
            <Select
              labelId="tag"
              id="tag"
              value={createBasicFood.tagId || ""}
              onChange={(event) => {
                setCreateBasicFood((previous) => ({
                  ...previous,
                  tagId: event.target.value,
                }));
              }}
              style={{ marginTop: 0, paddingTop: "5px", width: "110px" }}
            >
              {(glossary && glossary.basicFoodTags
                ? basicFoodTagOrder.map((basicFoodTagKey) => (
                    <MenuItem value={basicFoodTagKey} key={basicFoodTagKey}>
                      {glossary.basicFoodTags[basicFoodTagKey]}
                    </MenuItem>
                  ))
                : []
              ).concat(
                <MenuItem value={""} key={"delete"}>
                  <em>None</em>
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="success"
          disabled={!createBasicFood.name}
          onClick={() => {
            const foodId = createKey(`${glossaryPath}/basicFoods`);
            const updates = {};
            updates[`${glossaryPath}/basicFoods/${foodId}`] =
              createBasicFood.name;
            if (createBasicFood.tagId) {
              updates[`${basicFoodTagAssociationPath}/${foodId}`] =
                createBasicFood.tagId;
            }
            updateRequest(updates);
            handleSelectedFood(foodId);
            onClose();
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateBasicFoodDialog;
