import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import Chip from "@mui/material/Chip";
import StarOutlineIcon from "@mui/icons-material/StarOutline";

import { createKey, updateRequest, deleteRequest } from "../utils";

function Recipe(props) {
  const { glossary, cookbook = {}, cookbookPath, addAlert } = props;

  let navigate = useNavigate();
  const { recipeId: pathParam } = useParams();
  const [recipeId, setRecipeId] = useState();
  const [recipeEntry, setRecipeEntry] = useState({
    name: "",
    tags: [],
    instructions: [],
    ingredients: {},
    isFavorited: false,
    notes: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    if (pathParam === "create") {
      setIsEditing(true);
      setIsCreating(true);
      setRecipeId(createKey(cookbookPath));
    } else if (cookbook.hasOwnProperty(pathParam)) {
      setRecipeId(pathParam);
      setRecipeEntry(cookbook[pathParam]);
    }
  }, [pathParam, cookbook]);

  if (!glossary) {
    return null;
  }

  if (!recipeId) {
    return (
      <Typography
        variant="h6"
        sx={{
          color: "primary.main",
          textAlign: "center",
        }}
      >
        Ope, recipe does not exist
      </Typography>
    );
  }

  const handleSave = () => {
    const { name, instructions, ingredients } = recipeEntry;

    if (!(!!name.length && !!instructions.length && !!ingredients.length)) {
      addAlert({
        message: <span>Please fill out the required fields.</span>,
        alertProps: { severity: "warning" },
      });
      return;
    }

    updateRequest(
      { [`${cookbookPath}/${recipeId}`]: recipeEntry },
      (successAlert) => {
        addAlert(successAlert);
        setIsCreating(false);
        setIsEditing(false);
      },
      addAlert
    );
  };

  const handleDelete = () => {
    deleteRequest(
      [`${cookbookPath}/${recipeId}`],
      (successAlert) => {
        addAlert(successAlert);
        navigate(`/cookbook`);
      },
      addAlert
    );
  };

  const renderTopButtonControls = () => (
    <Stack
      key="buttonControl"
      direction="row"
      justifyContent="space-around"
      alignItems="center"
      sx={{ width: "95%" }}
      spacing={3}
    >
      {!isCreating && isEditing ? (
        <React.Fragment>
          <Button
            color="error"
            variant="outlined"
            size="small"
            onClick={() => {
              setOpenDeleteDialog(true);
            }}
          >
            <Typography>Delete</Typography>
          </Button>
          <Button
            color="warning"
            variant="outlined"
            size="small"
            onClick={() => {
              setRecipeEntry(cookbook[pathParam]);
              setIsEditing(false);
            }}
          >
            <Typography>Cancel</Typography>
          </Button>
        </React.Fragment>
      ) : (
        <Button color="secondary" variant="outlined" size="small">
          <Link to={`/cookbook`}>
            <Typography color="secondary">Back to cookbook</Typography>
          </Link>
        </Button>
      )}

      {isEditing ? (
        <Button
          color="success"
          variant="outlined"
          size="small"
          onClick={handleSave}
        >
          <Typography>Save</Typography>
        </Button>
      ) : (
        <Button
          color="secondary"
          variant="outlined"
          size="small"
          onClick={() => {
            setIsEditing(true);
          }}
        >
          <Typography>Edit recipe</Typography>
        </Button>
      )}
    </Stack>
  );

  const renderIngredients = () => {
    const { ingredients } = recipeEntry;

    return (
      <Accordion key={"ingredients"} sx={{ width: "100%" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Ingredients</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {Object.keys(ingredients).map((ingredientId) => (
            <Stack key={ingredientId} direction="row">
              <Typography sx={{ fontWeight: "bold" }}>
                {glossary.basicFoods[ingredientId]}:
              </Typography>
              &nbsp;
              <Typography>{ingredients[ingredientId]}</Typography>
            </Stack>
          ))}
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderInstructions = () => {
    const { instructions } = recipeEntry;

    return (
      <Accordion key={"instructions"} sx={{ width: "100%" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Instructions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {instructions.map((instructionText, index) => (
            <Stack key={index} direction="row">
              <Typography sx={{ fontWeight: 700 }}>{index + 1}:</Typography>
              &nbsp;
              <Typography>{instructionText}</Typography>
            </Stack>
          ))}
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderNotes = () => {
    const { notes } = recipeEntry;

    if (!!notes.size) {
      return null;
    }
    return (
      <Paper elevation={2} sx={{ width: "100%" }}>
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6">Notes:</Typography>
          <Typography fontFamily={"Bradley Hand"}>{notes}</Typography>
        </Box>
      </Paper>
    );
  };

  const renderTags = () => {
    const { tags, isFavorite } = recipeEntry;
    return (
      <Stack direction="row" spacing={1} key="tags" sx={{ width: "95%" }}>
        {isFavorite && (
          <Chip
            key={"favorite"}
            label={<StarOutlineIcon />}
            size="small"
            variant="outlined"
            color="tertiary"
          />
        )}
        {tags.map((tagId) => (
          <Chip
            key={tagId}
            label={<Typography>{glossary.recipeTags[tagId]}</Typography>}
            size="small"
            variant="outlined"
            color="tertiary"
          />
        ))}
      </Stack>
    );
  };

  const renderDeleteDialog = () => (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%" } }}
      maxWidth="xs"
      open={openDeleteDialog}
      keepMounted
    >
      <DialogTitle color="primary">Confirm delete recipe</DialogTitle>
      <DialogContent dividers>
        <Typography>Do you want to delete this recipe?</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={() => {
            setOpenDeleteDialog(false);
          }}
          color="secondary"
        >
          <Typography>Cancel</Typography>
        </Button>
        <Button onClick={handleDelete} color="error">
          <Typography>Delete</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <div>
      <Stack
        sx={{ paddingTop: "15px", width: "100%" }}
        spacing={0}
        alignItems="center"
      >
        {renderTopButtonControls()}
        <Typography
          key="title"
          variant="h4"
          sx={{
            color: "primary.main",
            textAlign: "center",
            marginY: 3,
          }}
        >
          {`${
            isCreating ? "Creating new" : isEditing ? "Editing" : "Viewing"
          } recipe`}
        </Typography>
        <Stack key="contents" spacing={2} sx={{ width: "95%" }}>
          {renderIngredients()}
          {renderInstructions()}
          {renderNotes()}
          {renderTags()}
        </Stack>
      </Stack>
      {renderDeleteDialog()}
    </div>
  );
}

export default Recipe;
