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
import Switch from "@mui/material/Switch";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";

import {
  createKey,
  updateRequest,
  deleteRequest,
  getCalculateFoodSectionForOptions,
} from "../utils";

const unknownSectionName = "Unknown Section";

function Recipe(props) {
  const {
    glossary,
    basicFoodTagAssociation,
    cookbook = {},
    cookbookPath,
    addAlert,
  } = props;

  let navigate = useNavigate();
  const { recipeId: pathParam } = useParams();
  const [recipeId, setRecipeId] = useState();
  const [recipeEntry, setRecipeEntry] = useState({
    name: "",
    tags: [],
    instructions: [],
    ingredients: {},
    isFavorite: false,
    notes: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [newStep, setNewStep] = useState("");
  const [newIngredientId, setNewIngredientId] = useState(null);

  useEffect(() => {
    if (pathParam === "create") {
      setIsEditing(true);
      setIsCreating(true);
      setRecipeId(createKey(cookbookPath));
    } else if (cookbook.hasOwnProperty(pathParam)) {
      setRecipeId(pathParam);
      setRecipeEntry(cookbook[pathParam]);
    }
  }, [pathParam, cookbook, cookbookPath]);

  const updateRecipe = (param) => {
    const setter = typeof param === "function" ? param : () => param;
    setRecipeEntry((_recipeEntry) => ({
      ..._recipeEntry,
      ...setter(_recipeEntry),
    }));
  };
  const updateName = (name) => {
    updateRecipe({ name });
  };
  const updateIngredients = (setter) => {
    updateRecipe((_recipeEntry) => ({
      ingredients: setter(_recipeEntry.ingredients),
    }));
  };
  const updateInstructions = (setter) => {
    updateRecipe((_recipeEntry) => ({
      instructions: setter(_recipeEntry.instructions),
    }));
  };
  const updateNotes = (notes) => {
    updateRecipe({ notes });
  };
  const updateIsFavorite = (isFavorite) => {
    updateRecipe({ isFavorite });
  };
  const updateTags = (setter) => {
    updateRecipe((_recipeEntry) => ({ tags: setter(_recipeEntry.tags) }));
  };

  const setIngredient = (ingredientId, value) => {
    updateIngredients((_ingredients) => ({
      ..._ingredients,
      [ingredientId]: value,
    }));
  };
  const moveStep = (oldIndex, newIndex) => {
    updateInstructions((_instructions) => {
      const step = _instructions[oldIndex];
      _instructions.splice(oldIndex, 1);
      if (newIndex >= 0) {
        _instructions.splice(newIndex, 0, step);
      }
      return _instructions;
    });
  };
  const addStep = () => {
    updateInstructions((_instructions) => {
      return _instructions.concat(newStep);
    });
    setNewStep("");
  };
  const addIngredient = () => {
    updateIngredients((_ingredients) => {
      return { ..._ingredients, [newIngredientId]: "" };
    });
    setNewIngredientId(null);
  };

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

    if (
      !(
        !!name.length &&
        !!instructions.length &&
        !!Object.keys(ingredients).length
      )
    ) {
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
        <>
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
        </>
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

  const renderName = () => {
    const { name = "" } = recipeEntry;

    if (isEditing) {
      const error = !name.length;
      return (
        <TextField
          label="Title"
          variant="filled"
          error={error}
          helperText={error && "Enter something"}
          multiline={true}
          value={name}
          onChange={(event) => {
            updateName(event.target.value);
          }}
        />
      );
    }

    return (
      <Typography
        key="title"
        variant="h5"
        sx={{
          color: "primary.main",
          textAlign: "left",
          width: "100%",
          marginBottom: 1,
        }}
      >
        {name}
      </Typography>
    );
  };

  const renderIngredients = () => {
    const { ingredients = {} } = recipeEntry;

    const calculateFoodSectionForOptions = getCalculateFoodSectionForOptions(
      glossary,
      basicFoodTagAssociation,
      unknownSectionName
    );

    return (
      <Accordion key={"ingredients"} sx={{ width: "100%" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Ingredients</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={isEditing ? 2 : 1}>
            {Object.keys(ingredients)
              .map((ingredientId) => (
                <Stack
                  key={ingredientId}
                  direction="row"
                  spacing={isEditing ? 2 : 1}
                  alignItems="center"
                >
                  {isEditing ? (
                    <>
                      <Typography sx={{ fontWeight: "bold", minWidth: "90px" }}>
                        {glossary.basicFoods[ingredientId]}:
                      </Typography>
                      <TextField
                        placeholder="Edit amount"
                        value={ingredients[ingredientId]}
                        onChange={(event) => {
                          setIngredient(ingredientId, event.target.value);
                        }}
                        size="small"
                        fullWidth={true}
                        variant="outlined"
                      />
                    </>
                  ) : (
                    <>
                      <Typography sx={{ fontWeight: "bold" }}>
                        {glossary.basicFoods[ingredientId]}:
                      </Typography>
                      <Typography>{ingredients[ingredientId]}</Typography>
                    </>
                  )}
                </Stack>
              ))
              .concat(
                isEditing ? (
                  <Stack
                    key={"addIngredient"}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Autocomplete
                      id={"addIngredientSelect"}
                      options={Object.values(
                        Object.keys(glossary.basicFoods).reduce(
                          (acc, foodId) => {
                            const foodSectionForOptions =
                              calculateFoodSectionForOptions(foodId);
                            if (acc.hasOwnProperty(foodSectionForOptions)) {
                              acc[foodSectionForOptions].push(foodId);
                            } else {
                              acc[foodSectionForOptions] = [foodId];
                            }
                            return acc;
                          },
                          {}
                        )
                      ).reduce((acc, foodLists) => {
                        return acc.concat(foodLists);
                      }, [])}
                      getOptionLabel={(option) => glossary.basicFoods[option]}
                      groupBy={calculateFoodSectionForOptions}
                      getOptionDisabled={(option) =>
                        ingredients && ingredients.hasOwnProperty(option)
                      }
                      value={newIngredientId}
                      onChange={(event, selectedOption) => {
                        setNewIngredientId(selectedOption);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Enter item"
                          size="small"
                        />
                      )}
                      sx={{ width: "180px" }}
                    />
                    <Button
                      color="secondary"
                      variant="outlined"
                      size="small"
                      onClick={addIngredient}
                    >
                      <Typography>Add item</Typography>
                    </Button>
                  </Stack>
                ) : null
              )}
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderInstructions = () => {
    const { instructions = [] } = recipeEntry;

    return (
      <Accordion key={"instructions"} sx={{ width: "100%" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Instructions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={isEditing ? 2 : 1}>
            {instructions
              .map((instructionText, index) => {
                return (
                  <Stack key={index} direction="row" alignItems="center">
                    {isEditing ? (
                      <>
                        <Select
                          size="small"
                          value={index}
                          onChange={(event) => {
                            moveStep(index, event.target.value);
                          }}
                          onClose={() => {
                            setTimeout(() => {
                              document.activeElement.blur();
                            }, 100);
                          }}
                        >
                          {instructions
                            .map((t, i) => (
                              <MenuItem key={i} value={i}>
                                {i + 1}
                              </MenuItem>
                            ))
                            .concat(
                              <MenuItem key={"delete"} value={-1}>
                                Remove
                              </MenuItem>
                            )}
                        </Select>
                        <Typography sx={{ fontWeight: 700 }}>:</Typography>
                        &nbsp;
                        <TextField
                          placeholder="Edit step"
                          value={instructionText}
                          onChange={(event) => {
                            setNewStep(index, event.target.value);
                          }}
                          size="small"
                          fullWidth={true}
                          variant="outlined"
                        />
                      </>
                    ) : (
                      <>
                        <Typography sx={{ fontWeight: 700 }}>
                          {index + 1}:
                        </Typography>
                        &nbsp;
                        <Typography>{instructionText}</Typography>
                      </>
                    )}
                  </Stack>
                );
              })
              .concat(
                isEditing ? (
                  <Stack key={"addStep"} direction="row" alignItems="center">
                    <>
                      <Button
                        color="secondary"
                        variant="outlined"
                        size="small"
                        onClick={addStep}
                        sx={{ minWidth: "55px", height: "40px" }}
                      >
                        <Typography>Add</Typography>
                      </Button>
                      &nbsp; &nbsp;
                      <TextField
                        placeholder="Enter new step"
                        onChange={(event) => {
                          setNewStep(event.target.value);
                        }}
                        size="small"
                        fullWidth={true}
                        variant="outlined"
                        value={newStep}
                      />
                    </>
                  </Stack>
                ) : null
              )}
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderNotes = () => {
    const { notes = "" } = recipeEntry;

    if (!notes.length && !isEditing) {
      return null;
    }

    return (
      <Paper elevation={2} sx={{ width: "100%" }}>
        <Box sx={{ padding: 2 }}>
          {isEditing ? (
            <TextField
              label="Enter Notes"
              fullWidth={true}
              multiline={true}
              value={notes}
              onChange={(event) => {
                updateNotes(event.target.value);
              }}
              variant="standard"
              InputProps={{ sx: { fontFamily: "Bradley Hand" } }}
            />
          ) : (
            <Typography fontFamily={"Bradley Hand"}>{notes}</Typography>
          )}
        </Box>
      </Paper>
    );
  };

  const renderFavorite = () => {
    const { isFavorite = false } = recipeEntry;

    if (isEditing) {
      const iconSwitchStyles = {
        color: "alt.main",
        borderColor: "alt.main",
        borderWidth: "1px",
        borderStyle: "solid",
        borderRadius: "12px",
      };
      return (
        <Switch
          checked={isFavorite}
          onChange={(event) => {
            updateIsFavorite(event.target.checked);
          }}
          color="tertiary"
          checkedIcon={
            <StarIcon
              sx={{
                ...iconSwitchStyles,
                transform: "translate(-2px, -8px)",
              }}
              fontSize="small"
            />
          }
          icon={
            <StarOutlineIcon
              sx={{
                ...iconSwitchStyles,
                transform: "translate(-8px, -8px)",
              }}
              fontSize="small"
            />
          }
          sx={{
            padding: 0,
            height: "24px",
            width: "50px",
            borderRadius: "12px",
          }}
        />
      );
    }

    if (isFavorite) {
      return (
        <Chip
          key={"favorite"}
          label={
            <StarIcon
              sx={{
                "&&": {
                  color: "alt.main",
                  verticalAlign: "bottom",
                },
              }}
              fontSize="small"
            />
          }
          size="small"
          variant="outlined"
          color="tertiary"
        />
      );
    }

    return null;
  };

  const getTagOnDelete = (tagId) => {
    if (!isEditing) {
      return undefined;
    }
    return () => {
      updateTags((_tags) => _tags.filter((tag) => tag !== tagId));
    };
  };

  const renderTags = () => {
    const { tags = [] } = recipeEntry;
    return (
      <Stack
        direction="row"
        spacing={1}
        key="tags"
        sx={{ width: "95%" }}
        alignItems={"center"}
      >
        {renderFavorite()}
        {tags.map((tagId) => (
          <Chip
            key={tagId}
            label={<Typography>{glossary.recipeTags[tagId]}</Typography>}
            size="small"
            variant="outlined"
            color="tertiary"
            onDelete={getTagOnDelete(tagId)}
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
        <Stack key="contents" spacing={2} sx={{ width: "95%", marginTop: 3 }}>
          {renderName()}
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
