import { useNavigate } from "react-router-dom";

import { useState } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

import GenerateRecipeDialogue from "../Utils/GenerateRecipeDialogue";
import ExternalRecipeImportDialogue from "../Utils/ExternalRecipeImportDialogue";
import ImportFileButton from "../Utils/ImportFileButton";

function NewRecipeDialogue(props) {
  const { open, onClose, filteringOptions = {}, setExternalRecipe } = props;

  let navigate = useNavigate();

  const [openGenerateRecipeDialogue, setOpenGenerateRecipeDialogue] =
    useState(false);
  const [
    openExternalRecipeImportDialogue,
    setOpenExternalRecipeImportDialogue,
  ] = useState(false);

  const renderButtonStack = () => (
    <Stack spacing={2}>
      <Button
        size="large"
        color="primary"
        variant="contained"
        onClick={() => {
          navigate(`/recipe/create`);
        }}
      >
        <Typography>Create your own recipe</Typography>
      </Button>
      <Button
        color="primary"
        variant="outlined"
        onClick={() => {
          setOpenGenerateRecipeDialogue(true);
          onClose();
        }}
      >
        <Typography>Generate Recipe with AI</Typography>
      </Button>
      <ImportFileButton
        isForRecipe={true}
        buttonProps={{
          color: "primary",
          variant: "outlined",
          sx: { width: "100%" },
        }}
        buttonText="Upload a file from Gude Foods"
        id="import-recipe"
      />
      <Button
        color="primary"
        variant="outlined"
        onClick={() => {
          setOpenExternalRecipeImportDialogue(true);
          onClose();
        }}
      >
        <Typography>Import a recipe from a website</Typography>
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
        <DialogTitle>New recipe</DialogTitle>
        <DialogContent dividers={true}>{renderButtonStack()}</DialogContent>

        <DialogActions>
          <Button color="secondary" onClick={onClose} variant="contained">
            <Typography>Cancel</Typography>
          </Button>
        </DialogActions>
      </Dialog>
      <GenerateRecipeDialogue
        filteringOptions={filteringOptions}
        open={openGenerateRecipeDialogue}
        onClose={() => {
          setOpenGenerateRecipeDialogue(false);
        }}
        setExternalRecipe={setExternalRecipe}
      />
      <ExternalRecipeImportDialogue
        open={openExternalRecipeImportDialogue}
        onClose={() => {
          setOpenExternalRecipeImportDialogue(false);
        }}
        setExternalRecipe={setExternalRecipe}
      />
    </>
  );
}

export default NewRecipeDialogue;
