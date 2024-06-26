import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

import GenerateRecipeDialog from "./GenerateRecipeDialog";
import ExternalRecipeImportDialog from "./ExternalRecipeImportDialog";
import ImportFileButton from "../ImportFileButton";

function NewRecipeDialog(props) {
  const { open, onClose, filteringOptions = {}, setExternalRecipe } = props;

  let navigate = useNavigate();

  const [openGenerateRecipeDialog, setOpenGenerateRecipeDialog] =
    useState(false);
  const [openExternalRecipeImportDialog, setOpenExternalRecipeImportDialog] =
    useState(false);

  useEffect(() => {
    switch (open) {
      case "GenerateRecipe":
        setOpenGenerateRecipeDialog(true);
        onClose();
        break;
      case "ExternalRecipeImport":
        setOpenExternalRecipeImportDialog(true);
        onClose();
        break;
      default:
        break;
    }
  }, [open, onClose]);

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
          setOpenGenerateRecipeDialog(true);
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
          setOpenExternalRecipeImportDialog(true);
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
        open={open === "OPEN"}
      >
        <DialogTitle>New recipe</DialogTitle>
        <DialogContent dividers={true}>{renderButtonStack()}</DialogContent>

        <DialogActions>
          <Button color="secondary" onClick={onClose} variant="contained">
            <Typography>Cancel</Typography>
          </Button>
        </DialogActions>
      </Dialog>
      <GenerateRecipeDialog
        filteringOptions={filteringOptions}
        open={openGenerateRecipeDialog}
        onClose={() => {
          setOpenGenerateRecipeDialog(false);
        }}
        setExternalRecipe={setExternalRecipe}
      />
      <ExternalRecipeImportDialog
        open={openExternalRecipeImportDialog}
        onClose={() => {
          setOpenExternalRecipeImportDialog(false);
        }}
        setExternalRecipe={setExternalRecipe}
      />
    </>
  );
}

export default NewRecipeDialog;
