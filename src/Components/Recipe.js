import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

import {
  createKey,
  updateRequest,
  deleteRequest,
  getCalculateFoodSectionForOptions,
  constructBasicFoodOptions,
} from "../utils";

const unknownSectionName = "Unknown Section";

function Recipe(props) {
  const {
    glossary,
    basicFoodTagAssociation,
    cookbook = {},
    shoppingList,
    basicFoodTagOrder,
    cookbookPath,
    shoppingListPath,
    glossaryPath,
    basicFoodTagAssociationPath,
    addAlert,
  } = props;

  let navigate = useNavigate();
  const { recipeId: pathParam } = useParams();
  const [recipeId, setRecipeId] = useState();
  const [originalRecipe, setOriginalRecipe] = useState();
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
  const [openCreateBasicFoodDialog, setOpenCreateBasicFoodDialog] =
    useState(false);
  const [createBasicFood, setCreateBasicFood] = useState({});

  const [newStep, setNewStep] = useState("");
  const [newIngredientId, setNewIngredientId] = useState(null);

  useEffect(() => {
    if (pathParam === "create") {
      setIsEditing(true);
      setIsCreating(true);
      setRecipeId(createKey(cookbookPath));
    } else if (cookbook && cookbook.hasOwnProperty(pathParam)) {
      const _originalRecipe = {
        ...{
          name: "",
          tags: [],
          instructions: [],
          ingredients: {},
          isFavorite: false,
          notes: "",
        },
        ...cookbook[pathParam],
      };
      setOriginalRecipe(_originalRecipe);
      setRecipeEntry(JSON.parse(JSON.stringify(_originalRecipe)));
      setRecipeId(pathParam);
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

  const getDeleteTag = (tagId) => () => {
    updateTags((_tags) => _tags.filter((tag) => tag !== tagId));
  };
  const addTag = (tagId) => {
    updateTags((_tags) => _tags.concat(tagId));
  };

  const setIngredient = (ingredientId, value) => {
    updateIngredients((_ingredients) => ({
      ..._ingredients,
      [ingredientId]: value,
    }));
  };
  const addIngredient = (ingredientId) => {
    updateIngredients((_ingredients) => {
      return { ..._ingredients, [ingredientId]: "" };
    });
    setNewIngredientId(null);
  };
  const getRemoveIngredient = (ingredientId) => () => {
    updateIngredients((_ingredients) => {
      delete _ingredients[ingredientId];
      return _ingredients;
    });
  };

  const moveStep = (oldIndex, newIndex) => {
    updateInstructions((_instructions) => {
      const step = _instructions[oldIndex];
      _instructions.splice(oldIndex, 1);
      _instructions.splice(newIndex, 0, step);
      return _instructions;
    });
  };
  const addStep = () => {
    updateInstructions((_instructions) => {
      return _instructions.concat(newStep);
    });
    setNewStep("");
  };
  const updateStep = (index, step) => {
    updateInstructions((_instructions) => {
      _instructions.splice(index, 1, step);
      return _instructions;
    });
  };
  const getRemoveStep = (index) => () => {
    updateInstructions((_instructions) => {
      _instructions.splice(index, 1);
      return _instructions;
    });
  };

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
        navigate(`/recipe/${recipeId}`);
      },
      addAlert
    );
  };

  const handleDelete = () => {
    const shoppingListDeletes = Object.keys(shoppingList)
      .filter((foodId) => {
        const foodEntry = shoppingList[foodId];
        return foodEntry.list && foodEntry.list[recipeId];
      })
      .map((foodId) => `${shoppingListPath}/${foodId}/list/${recipeId}`);

    deleteRequest(
      [`${cookbookPath}/${recipeId}`, ...shoppingListDeletes],
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
      spacing={2}
    >
      {!isCreating && isEditing ? (
        <>
          <Button
            color="error"
            variant="outlined"
            size="small"
            sx={{ flexGrow: "1" }}
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
            sx={{ flexGrow: "1" }}
            onClick={() => {
              setRecipeEntry(JSON.parse(JSON.stringify(originalRecipe)));
              setIsEditing(false);
            }}
          >
            <Typography>Cancel</Typography>
          </Button>
        </>
      ) : (
        <Button
          color="secondary"
          variant="outlined"
          size="small"
          sx={{ ...(isCreating ? {} : { height: "50px" }), flexGrow: "1" }}
          onClick={() => {
            navigate(`/cookbook`);
          }}
        >
          <Typography color="secondary">
            {isCreating ? (
              "Back to cookbook"
            ) : (
              <>
                <span>Back to</span>
                <br />
                <span>cookbook</span>
              </>
            )}
          </Typography>
        </Button>
      )}

      {isEditing ? (
        <Button
          color="success"
          variant="outlined"
          size="small"
          onClick={handleSave}
          sx={{ flexGrow: "2" }}
        >
          <Typography>Save</Typography>
        </Button>
      ) : (
        <>
          <Button
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ height: "50px", flexGrow: "1" }}
            onClick={() => {
              updateRequest(
                Object.keys(originalRecipe.ingredients).reduce(
                  (updates, foodId) => ({
                    ...updates,
                    [`${shoppingListPath}/${foodId}/list/${recipeId}`]: true,
                  }),
                  {}
                ),
                addAlert
              );
            }}
          >
            <Typography>
              <span>Add to</span>
              <br />
              <span>shopping list</span>
            </Typography>
          </Button>
          <Button
            color="success"
            variant="outlined"
            size="small"
            sx={{ height: "50px", flexGrow: "1" }}
            onClick={() => {
              setIsEditing(true);
            }}
          >
            <Typography>Edit</Typography>
          </Button>
        </>
      )}
    </Stack>
  );

  const renderName = () => {
    const { name = "" } = recipeEntry;

    if (isEditing) {
      const error = !isCreating && !name.length;
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
                  spacing={1}
                  alignItems="center"
                >
                  {isEditing ? (
                    <>
                      <Typography
                        sx={{ fontWeight: "bold", minWidth: "130px" }}
                      >
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
                      <HighlightOffIcon
                        color="secondary"
                        onClick={getRemoveIngredient(ingredientId)}
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
                    {
                      <Autocomplete
                        id={"addIngredientSelect"}
                        options={constructBasicFoodOptions(
                          glossary,
                          basicFoodTagOrder || [],
                          unknownSectionName,
                          calculateFoodSectionForOptions
                        )}
                        getOptionLabel={(option) => option.title}
                        groupBy={(option) =>
                          option.foodId
                            ? calculateFoodSectionForOptions(option.foodId)
                            : null
                        }
                        getOptionDisabled={(option) =>
                          ingredients &&
                          ingredients.hasOwnProperty(option.foodId)
                        }
                        isOptionEqualToValue={(optionA, optionB) =>
                          optionA.foodId === optionB.foodId
                        }
                        filterOptions={(options, params) => {
                          const { inputValue, getOptionLabel } = params;
                          const filtered = options.filter((option) =>
                            getOptionLabel(option).includes(inputValue)
                          );
                          const isExisting = options.some(
                            (option) => inputValue === option.title
                          );
                          if (inputValue !== "" && !isExisting) {
                            filtered.push({
                              inputValue,
                              title: `Create "${inputValue}"`,
                            });
                          }
                          return filtered;
                        }}
                        value={
                          newIngredientId && {
                            foodId: newIngredientId,
                            title: glossary.basicFoods[newIngredientId],
                          }
                        }
                        onChange={(event, selectedOption) => {
                          if (!selectedOption) {
                            setNewIngredientId(null);
                            return;
                          }
                          const { foodId, inputValue } = selectedOption;

                          if (inputValue) {
                            setOpenCreateBasicFoodDialog(true);
                            setCreateBasicFood({ name: inputValue });
                          } else {
                            setNewIngredientId(foodId);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Enter item"
                            size="small"
                          />
                        )}
                        fullWidth
                      />
                    }
                    <Button
                      color="secondary"
                      variant="outlined"
                      size="small"
                      onClick={() => addIngredient(newIngredientId)}
                      disabled={!newIngredientId}
                      sx={{ minWidth: "fit-content" }}
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
                  <Stack
                    key={index}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    {isEditing ? (
                      <>
                        <Select
                          value={index}
                          sx={{ minWidth: "64px", height: "40px" }}
                          onChange={(event) => {
                            moveStep(index, event.target.value);
                          }}
                          onClose={() => {
                            setTimeout(() => {
                              document.activeElement.blur();
                            }, 100);
                          }}
                        >
                          {instructions.map((t, i) => (
                            <MenuItem key={i} value={i} disabled={i === index}>
                              {i + 1}
                            </MenuItem>
                          ))}
                        </Select>
                        <TextField
                          placeholder="Edit step"
                          value={instructionText}
                          onChange={(event) => {
                            updateStep(index, event.target.value);
                          }}
                          size="small"
                          fullWidth={true}
                          variant="outlined"
                        />
                        <HighlightOffIcon
                          color="secondary"
                          onClick={getRemoveStep(index)}
                        />
                      </>
                    ) : (
                      <>
                        <Typography sx={{ fontWeight: 700, width: "17px" }}>
                          {index + 1}.
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
                        sx={{ minWidth: "64px", height: "40px" }}
                        disabled={!newStep}
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
            />
          ) : (
            <Typography>{notes}</Typography>
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

  const renderTags = () => {
    const { tags = [] } = recipeEntry;
    return (
      <>
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
              onDelete={isEditing ? getDeleteTag(tagId) : undefined}
            />
          ))}
        </Stack>
        {isEditing ? (
          <Autocomplete
            id={"addtagSelect"}
            options={
              glossary && glossary.recipeTags
                ? Object.keys(glossary.recipeTags).map((tagId) => ({
                    tagId,
                    title: glossary.recipeTags[tagId],
                  }))
                : []
            }
            getOptionLabel={(option) => option.title}
            getOptionDisabled={(option) => tags.includes(option.tagId)}
            filterOptions={(options, params) => {
              const { inputValue, getOptionLabel } = params;
              const filtered = options.filter((option) =>
                getOptionLabel(option).includes(inputValue)
              );
              const isExisting = options.some(
                (option) => inputValue === option.title
              );
              if (inputValue !== "" && !isExisting) {
                filtered.push({
                  inputValue,
                  title: `Create "${inputValue}"`,
                });
              }
              return filtered;
            }}
            value={null}
            onChange={(event, selectedOption) => {
              const { tagId: _tagId, inputValue } = selectedOption;
              let tagId = _tagId;
              if (inputValue) {
                tagId = createKey(`${glossaryPath}/recipeTags`);
                updateRequest({
                  [`${glossaryPath}/recipeTags/${tagId}`]: inputValue,
                });
              }
              addTag(tagId);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Enter tag" size="small" />
            )}
            blurOnSelect={true}
            clearOnBlur={true}
          />
        ) : null}
      </>
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

  const renderCreateBasicFoodDialog = () => (
    <Dialog
      open={openCreateBasicFoodDialog}
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
        <Button
          color="secondary"
          onClick={() => {
            setOpenCreateBasicFoodDialog(false);
            setCreateBasicFood({});
          }}
        >
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
            addIngredient(foodId);
            setOpenCreateBasicFoodDialog(false);
            setCreateBasicFood({});
          }}
        >
          Create
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
      {renderCreateBasicFoodDialog()}
    </div>
  );
}

export default Recipe;
