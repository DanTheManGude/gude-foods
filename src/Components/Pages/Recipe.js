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
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import StarIcon from "@mui/icons-material/Star";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";

import {
  createKey,
  updateRequest,
  addRecipeToShoppingList,
  shoppingListDeletesByRecipe,
} from "../../utils/requests";
import { waitForElm } from "../../utils/utility";
import {
  downloadData,
  transformRecipeForExport,
} from "../../utils/dataTransfer";

import CreateBasicFoodDialog from "../Utils/CreateBasicFoodDialog";
import DeleteDialog from "../Utils/DeleteDialog";
import BasicFoodAutocomplete from "../Utils/BasicFoodAutocomplete";
import FavoriteSwitch from "../Utils/FavoriteSwitch";
import {
  renderEditingButtons,
  renderNameText,
  renderNameInput,
} from "../Utils/RecipeParts";

function Recipe(props) {
  const {
    database: {
      glossary,
      basicFoodTagAssociation,
      cookbook: _cookbook,
      recipeOrder: _recipeOrder,
      shoppingList,
      basicFoodTagOrder,
      menu: _menu,
    },
    dataPaths: {
      cookbookPath,
      recipeOrderPath,
      shoppingListPath,
      glossaryPath,
      basicFoodTagAssociationPath,
      menuPath,
    },
    addAlert,
  } = props;
  const recipeOrder = _recipeOrder || [];
  const menu = _menu || {};

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
    const cookbook = _cookbook || {};

    if (pathParam === "create") {
      setIsEditing(true);
      setIsCreating(true);
      setRecipeId(createKey(cookbookPath));
    } else if (cookbook.hasOwnProperty(pathParam)) {
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
  }, [pathParam, _cookbook, cookbookPath]);

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

    waitForElm(`#${ingredientId}-amount-input`).then((elm) => {
      elm.focus();
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
    document.getElementById("newStepInput").focus();
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

  const handleCancel = () => {
    if (isCreating) {
      navigate("/cookbook");
    } else {
      setRecipeEntry(JSON.parse(JSON.stringify(originalRecipe)));
      setIsEditing(false);
    }
  };

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

    const updates = {
      [`${cookbookPath}/${recipeId}`]: recipeEntry,
    };

    if (isCreating) {
      updates[recipeOrderPath] = [recipeId, ...recipeOrder];
    }

    updateRequest(
      updates,
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
    const shoppingListDeletes = shoppingListDeletesByRecipe(
      recipeId,
      shoppingList,
      shoppingListPath
    );

    updateRequest(
      [
        `${cookbookPath}/${recipeId}`,
        `${menuPath}/${recipeId}`,
        ...shoppingListDeletes,
      ].reduce((acc, deletePath) => ({ ...acc, [deletePath]: null }), {
        [recipeOrderPath]: recipeOrder.filter(
          (_recipeId) => recipeId !== _recipeId
        ),
      }),
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
      {isEditing ? (
        <>
          {!isCreating && (
            <Button
              key="delete"
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
          )}
          {renderEditingButtons(handleCancel, handleSave)}
        </>
      ) : (
        <>
          <Button
            key="export"
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ height: "50px", flexGrow: "1" }}
            onClick={() => {
              const recipeData = transformRecipeForExport(
                recipeEntry,
                glossary
              );

              downloadData(recipeData, recipeData.name);
            }}
          >
            <Typography>Export</Typography>
          </Button>
          <Button
            key="shoppingList"
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ height: "50px", flexGrow: "1" }}
            onClick={() => {
              addRecipeToShoppingList(
                originalRecipe.ingredients,
                recipeId,
                { recipeOrder, menu },
                { shoppingListPath, recipeOrderPath, menuPath },
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
            key="edit"
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
      return renderNameInput(name, updateName, error);
    }

    return renderNameText(name);
  };

  const renderIngredients = () => {
    const { ingredients = {} } = recipeEntry;

    return (
      <Accordion key={"ingredients"} sx={{ width: "100%" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Ingredients</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={isEditing ? 2 : 1}>
            {Object.keys(ingredients)
              .sort((ingredientIdA, ingredientIdB) => {
                if (!basicFoodTagAssociation || !basicFoodTagOrder) {
                  return 0;
                }
                const tagA = basicFoodTagAssociation[ingredientIdA];
                const tagB = basicFoodTagAssociation[ingredientIdB];

                if (!tagA) {
                  if (!tagB) {
                    return 0;
                  }
                  return 1;
                }
                if (!tagB) {
                  return -1;
                }

                const indexA = basicFoodTagOrder.indexOf(tagA);
                const indexB = basicFoodTagOrder.indexOf(tagB);

                return indexA - indexB;
              })
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
                        id={`${ingredientId}-amount-input`}
                        placeholder="Edit amount"
                        value={ingredients[ingredientId]}
                        onChange={(event) => {
                          setIngredient(ingredientId, event.target.value);
                        }}
                        size="small"
                        fullWidth={true}
                        variant="outlined"
                        inputProps={{
                          autoCapitalize: "none",
                        }}
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
                    <BasicFoodAutocomplete
                      id="addIngredientSelect"
                      foodMap={ingredients}
                      newFoodId={newIngredientId}
                      setNewFoodId={setNewIngredientId}
                      handleInputvalue={(inputValue) => {
                        setOpenCreateBasicFoodDialog(true);
                        setCreateBasicFood({ name: inputValue });
                      }}
                      extraProps={{ fullWidth: true }}
                      glossary={glossary}
                      basicFoodTagAssociation={basicFoodTagAssociation}
                      basicFoodTagOrder={basicFoodTagOrder}
                    />
                    <Button
                      id={`add-ingredient-button`}
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
                      <span
                        onClick={() => {
                          if (!newStep) {
                            document.getElementById("newStepInput").focus();
                          }
                        }}
                      >
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
                      </span>
                      &nbsp; &nbsp;
                      <TextField
                        id="newStepInput"
                        placeholder="Enter new step"
                        onChange={(event) => {
                          setNewStep(event.target.value);
                        }}
                        size="small"
                        fullWidth={true}
                        variant="outlined"
                        value={newStep}
                        InputProps={{
                          endAdornment: newStep && (
                            <InputAdornment position="end">
                              <IconButton
                                sx={{ color: "alt.main" }}
                                onClick={() => {
                                  setNewStep("");
                                  document
                                    .getElementById("newStepInput")
                                    .focus();
                                }}
                                edge="end"
                              >
                                <ClearIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
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
      return (
        <FavoriteSwitch
          isChecked={isFavorite}
          updateChecked={updateIsFavorite}
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
                getOptionLabel(option)
                  .toLocaleUpperCase()
                  .includes(inputValue.toUpperCase())
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
      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
        }}
        titleDO="recipe"
        comfirmationMessageDO={`"${recipeEntry.name}"`}
        handleDelete={handleDelete}
      />
      <CreateBasicFoodDialog
        open={openCreateBasicFoodDialog}
        createBasicFood={createBasicFood}
        setCreateBasicFood={setCreateBasicFood}
        handleSelectedFood={addIngredient}
        onClose={() => {
          setOpenCreateBasicFoodDialog(false);
          setCreateBasicFood({});
        }}
        glossary={glossary}
        basicFoodTagOrder={basicFoodTagOrder}
        glossaryPath={glossaryPath}
        basicFoodTagAssociationPath={basicFoodTagAssociationPath}
      />
    </div>
  );
}

export default Recipe;
