import { useEffect, useState } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import {
  offlineRecipeKeyPrefix,
  offlineRecipeListKey,
} from "../../../constants";
import ImportFileButton from "../ImportFileButton";

function OfflineRecipeDialog(props) {
  const { open, onClose, setRecipe } = props;

  const [localOptions, setLocalOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");

  useEffect(() => {
    const offlineRecipeList =
      JSON.parse(localStorage.getItem(offlineRecipeListKey)) || [];

    const options = offlineRecipeList.map((recipeId) => {
      const recipeData = JSON.parse(
        localStorage.getItem(`${offlineRecipeKeyPrefix}${recipeId}`)
      );

      return { value: recipeId, text: recipeData.name };
    });

    setLocalOptions(options);
  }, []);

  const handleChangeOption = (event) => {
    setSelectedOption(event.target.value);
  };

  const chooseRecipe = (recipe) => {
    setRecipe(recipe);
    onClose();
  };

  const selectRecipe = () => {
    const recipeData = JSON.parse(
      localStorage.getItem(`${offlineRecipeKeyPrefix}${selectedOption}`)
    );

    chooseRecipe(recipeData);
  };

  const renderSelect = () => {
    let label = "Local data";
    let disabled = false;

    if (!localOptions.length) {
      label = "No saved recipes";
      disabled = true;
    }
    return (
      <FormControl
        sx={{ m: 1, minWidth: 120 }}
        size="small"
        disabled={disabled}
      >
        <InputLabel id="local-selection">{label}</InputLabel>
        <Select
          labelId="local-selection"
          value={selectedOption}
          label={label}
          onChange={handleChangeOption}
        >
          {localOptions.map(({ value, text }) => (
            <MenuItem key={value} value={value}>
              {text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  const renderSelectionStack = () => (
    <Stack spacing={2}>
      {renderSelect()}
      <ImportFileButton
        customHandler={chooseRecipe}
        shouldUseCustomHandler={true}
        buttonProps={{
          variant: "outlined",
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
        <DialogContent dividers={true}>{renderSelectionStack()}</DialogContent>

        <DialogActions>
          <Button color="secondary" onClick={onClose} variant="contained">
            <Typography>Cancel</Typography>
          </Button>
          {selectedOption && (
            <Button color="primary" onClick={selectRecipe} variant="contained">
              <Typography>Select</Typography>
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default OfflineRecipeDialog;
