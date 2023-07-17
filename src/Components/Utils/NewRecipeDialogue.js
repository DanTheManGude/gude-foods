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
import ImportFileButton from "../Utils/ImportFileButton";

function NewRecipeDialogue(props) {
  const { open, onClose, filteringOptions = {}, setExternalRecipe } = props;

  let navigate = useNavigate();

  const [openGenerateRecipeDialogue, setOpenGenerateRecipeDialogue] =
    useState(false);

  const renderButtonStack = () => (
    <Stack spacing={2}>
      <Button
        color="primary"
        variant="contained"
        onClick={() => {
          navigate(`/recipe/create`);
        }}
      >
        Create your own recipe
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
        onSuccess={console.log}
        buttonProps={{ color: "primary", variant: "outlined" }}
        buttonText="Upload a file from Gude Foods"
        id="import-recipe"
      />
      <Button color="primary" variant="outlined" disabled>
        Import a recipe file from a website
      </Button>
    </Stack>
  );

  return (
    <>
      <Dialog
        sx={{
          "& .MuiDialog-paper": {
            width: "81%",
          },
          "& .MuiDialog-container": {
            marginBottom: "100px",
          },
        }}
        maxWidth="xs"
        open={open}
      >
        <DialogTitle>New recipe</DialogTitle>
        <DialogContent dividers={true}>{renderButtonStack()}</DialogContent>

        <DialogActions>
          <Button color="secondary" onClick={onClose} variant="contained">
            Cancel
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
    </>
  );
}

export default NewRecipeDialogue;
