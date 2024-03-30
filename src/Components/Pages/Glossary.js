import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Box from "@mui/material/Box";

import { updateRequest, createKey } from "../../utils/requests";
import { unknownSectionName, UNKNOWN_TAG } from "../../constants";

import {
  AddAlertContext,
  DataPathsContext,
  DatabaseContext,
} from "../Contexts";

import DepartmentFormControl from "../Utils/DepartmentFormControl";
import PageTitle from "../Utils/PageTitle";

function Glossary(props) {
  const { setFilteringOptions } = props;

  let navigate = useNavigate();

  const addAlert = useContext(AddAlertContext);
  const dataPaths = useContext(DataPathsContext);
  const {
    glossaryPath,
    shoppingListPath,
    cookbookPath,
    basicFoodTagAssociationPath,
    basicFoodTagOrderPath,
  } = dataPaths;
  const database = useContext(DatabaseContext);
  const {
    glossary = {},
    shoppingList,
    cookbook,
    basicFoodTagAssociation,
    basicFoodTagOrder,
  } = database;

  const [editingEntry, setEditingEntry] = useState({});
  const clearEditingEntry = () => setEditingEntry({});

  const getInputHandler = (key, valueComparator) => (event) => {
    const newValue = event.target.value;

    if (newValue === valueComparator) {
      clearEditingEntry();
    } else {
      setEditingEntry({ key, value: newValue });
    }
  };

  const renderAction = (
    isActiveEntry,
    sectionKey,
    entryKey,
    isAddingValue,
    disabled
  ) => {
    const isEmptyValue = editingEntry.value === "";

    if (isActiveEntry) {
      return (
        <Button
          color="primary"
          variant="contained"
          size="small"
          sx={{ width: "109px" }}
          disabled={disabled}
          onClick={() => {
            let updateEntryKey = entryKey;

            const updates = {};
            const undoUpdates = {};

            if (isAddingValue) {
              updateEntryKey = createKey(`${glossaryPath}/${sectionKey}`);

              if (sectionKey === "basicFoodTags") {
                updates[basicFoodTagOrderPath] =
                  basicFoodTagOrder.concat(updateEntryKey);
                undoUpdates[basicFoodTagOrderPath] = basicFoodTagOrder;
              }
            }

            updates[`${glossaryPath}/${sectionKey}/${updateEntryKey}`] =
              isEmptyValue ? null : editingEntry.value;
            undoUpdates[`${glossaryPath}/${sectionKey}/${updateEntryKey}`] =
              isAddingValue ? null : glossary[sectionKey][updateEntryKey];

            if (isEmptyValue) {
              switch (sectionKey) {
                case "basicFoods":
                  updates[`${basicFoodTagAssociationPath}/${entryKey}`] = null;
                  undoUpdates[`${basicFoodTagAssociationPath}/${entryKey}`] =
                    basicFoodTagAssociation[entryKey];

                  if (shoppingList) {
                    updates[`${shoppingListPath}/${entryKey}`] = null;
                    undoUpdates[`${shoppingListPath}/${entryKey}`] =
                      shoppingList[entryKey];
                  }
                  if (cookbook) {
                    Object.keys(cookbook).forEach((recipeId) => {
                      if (
                        cookbook[recipeId].ingredients.hasOwnProperty(entryKey)
                      ) {
                        updates[
                          `${cookbookPath}/${recipeId}/ingredients/${entryKey}`
                        ] = null;
                        undoUpdates[
                          `${cookbookPath}/${recipeId}/ingredients/${entryKey}`
                        ] = cookbook[recipeId].ingredients[entryKey];
                        if (
                          cookbook[recipeId].supplementalIngredientInfo &&
                          cookbook[
                            recipeId
                          ].supplementalIngredientInfo.hasOwnProperty(entryKey)
                        ) {
                          updates[
                            `${cookbookPath}/${recipeId}/supplementalIngredientInfo/${entryKey}`
                          ] = null;
                          undoUpdates[
                            `${cookbookPath}/${recipeId}/supplementalIngredientInfo/${entryKey}`
                          ] =
                            cookbook[recipeId].supplementalIngredientInfo[
                              entryKey
                            ];
                        }
                      }
                      if (cookbook[recipeId].supplementalIngredientInfo) {
                        Object.entries(
                          cookbook[recipeId].supplementalIngredientInfo
                        ).forEach(([ingredientId, individualInfo]) => {
                          if (
                            individualInfo.substitution &&
                            individualInfo.substitution.foodId === entryKey
                          ) {
                            updates[
                              `${cookbookPath}/${recipeId}/supplementalIngredientInfo/${ingredientId}/substitution`
                            ] = null;
                            undoUpdates[
                              `${cookbookPath}/${recipeId}/supplementalIngredientInfo/${ingredientId}/substitution`
                            ] =
                              cookbook[recipeId].supplementalIngredientInfo[
                                ingredientId
                              ].substitution;
                          }
                        });
                      }
                    });
                  }
                  break;
                case "basicFoodTags":
                  if (basicFoodTagAssociation) {
                    Object.keys(basicFoodTagAssociation).forEach(
                      (basicFoodId) => {
                        if (basicFoodTagAssociation[basicFoodId] === entryKey) {
                          updates[
                            `${basicFoodTagAssociationPath}/${basicFoodId}`
                          ] = null;
                          undoUpdates[
                            `${basicFoodTagAssociationPath}/${basicFoodId}`
                          ] = basicFoodTagAssociation[basicFoodId];
                        }
                      }
                    );
                  }
                  updates[basicFoodTagOrderPath] = basicFoodTagOrder.filter(
                    (tagId) => tagId !== entryKey
                  );
                  undoUpdates[basicFoodTagOrderPath] = basicFoodTagOrder;
                  break;
                case "recipeTags":
                  if (cookbook) {
                    Object.keys(cookbook).forEach((recipeId) => {
                      if (cookbook[recipeId].hasOwnProperty("tags")) {
                        if (cookbook[recipeId].tags.includes(entryKey)) {
                          updates[`${cookbookPath}/${recipeId}/tags`] =
                            cookbook[recipeId].tags.filter(
                              (tag) => tag !== entryKey
                            );
                          undoUpdates[`${cookbookPath}/${recipeId}/tags`] =
                            cookbook[recipeId].tags;
                        }
                      }
                    });
                  }
                  break;
                default:
                  break;
              }
            }

            const undo = () => {
              updateRequest(
                undoUpdates,
                (successAlert) => {
                  addAlert(
                    {
                      ...successAlert,
                      message: (
                        <Typography>
                          Succesfully undid glossary changes.
                        </Typography>
                      ),
                      undo: makeUpdates,
                    },
                    5000
                  );
                },
                addAlert
              );
            };

            const makeUpdates = () => {
              updateRequest(
                updates,
                (successAlert) => {
                  addAlert(
                    {
                      ...successAlert,
                      message: (
                        <Typography>
                          Succesfully made glossary changes.
                        </Typography>
                      ),
                      undo,
                    },
                    5000
                  );
                },
                addAlert
              );
            };

            makeUpdates();
            clearEditingEntry();
          }}
        >
          <Typography>
            {isAddingValue ? "Add" : isEmptyValue ? "Delete" : "Update"}
          </Typography>
        </Button>
      );
    }

    if (isAddingValue) {
      return null;
    }

    if (sectionKey === "basicFoods") {
      return (
        <DepartmentFormControl
          disabled={disabled}
          id={entryKey}
          value={
            (basicFoodTagAssociation && basicFoodTagAssociation[entryKey]) || ""
          }
          onChange={(event) => {
            updateRequest(
              {
                [`${basicFoodTagAssociationPath}/${entryKey}`]:
                  event.target.value,
              },
              addAlert
            );
          }}
          glossary={glossary}
          basicFoodTagOrder={basicFoodTagOrder}
        />
      );
    } else if (sectionKey === "basicFoodTags") {
      const order = [...(basicFoodTagOrder || [])];
      const index = order.indexOf(entryKey);

      return (
        <Select
          size="small"
          value={index}
          sx={{ width: "60px" }}
          onChange={(event) => {
            order.splice(index, 1);
            order.splice(event.target.value, 0, entryKey);
            updateRequest({ [basicFoodTagOrderPath]: order });
          }}
          onClose={() => {
            setTimeout(() => {
              document.activeElement.blur();
            }, 100);
          }}
        >
          {order.map((t, i) => (
            <MenuItem key={i} value={i} disabled={i === index}>
              {i + 1}
            </MenuItem>
          ))}
        </Select>
      );
    }
  };

  const getRenderInputButtonStack = (sectionKey) => (entryKey) => {
    const isAddingValue = sectionKey === entryKey;
    const value = isAddingValue ? "" : glossary[sectionKey][entryKey];
    const isActiveEntry = editingEntry.key === entryKey;
    const disabled = !!editingEntry.key && !isActiveEntry;

    let inputEndAdornment = undefined;

    if (["basicFoods", "recipeTags"].includes(sectionKey) && !isAddingValue) {
      let onClickHandler = () => {};
      let renderedIcon;

      if (isActiveEntry) {
        renderedIcon = <UndoOutlinedIcon />;
        onClickHandler = () => {
          setEditingEntry({ entryKey, value });
        };
      } else {
        renderedIcon = <SearchRoundedIcon />;
        const filteringKey =
          sectionKey === "basicFoods" ? "ingredientsList" : "tagsList";

        onClickHandler = () => {
          setFilteringOptions({ [filteringKey]: [entryKey] });
          navigate("/cookbook");
        };
      }

      inputEndAdornment = (
        <InputAdornment position="end">
          <IconButton
            sx={{ color: "alt.main" }}
            onClick={onClickHandler}
            edge="end"
            disabled={disabled}
          >
            {renderedIcon}
          </IconButton>
        </InputAdornment>
      );
    }

    return (
      <Stack key={entryKey} direction="row" spacing={2}>
        <TextField
          variant="outlined"
          label={isAddingValue ? "Add entry" : isActiveEntry && value}
          size="small"
          value={isActiveEntry ? editingEntry.value : value}
          disabled={disabled}
          sx={{ width: "183px" }}
          onFocus={() => {
            if (!isActiveEntry) {
              setEditingEntry({ entryKey, value });
            }
          }}
          onChange={getInputHandler(entryKey, value)}
          InputProps={{
            endAdornment: inputEndAdornment,
            autoCapitalize: sectionKey === "basicFoodTags" ? "none" : "",
          }}
          inputProps={
            sectionKey === "basicFoodTags"
              ? {
                  autoCapitalize: "none",
                }
              : {}
          }
        />
        {renderAction(
          isActiveEntry,
          sectionKey,
          entryKey,
          isAddingValue,
          disabled
        )}
      </Stack>
    );
  };

  const renderBasicFoodTagsContents = () => (
    <Stack sx={{ width: "95%" }} spacing={2} alignItems="left">
      {(glossary.basicFoodTags && basicFoodTagOrder ? basicFoodTagOrder : [])
        .concat("basicFoodTags")
        .map(getRenderInputButtonStack("basicFoodTags"))}
    </Stack>
  );

  const renderBasicFoodContents = () => {
    if (
      !glossary.basicFoods ||
      !glossary.basicFoodTags ||
      !basicFoodTagAssociation ||
      !basicFoodTagOrder
    ) {
      return (
        <Stack sx={{ width: "95%" }} spacing={2} alignItems="left">
          {(glossary.basicFoods ? Object.keys(glossary.basicFoods) : [])
            .concat("basicFoods")
            .map(getRenderInputButtonStack("basicFoods"))}
        </Stack>
      );
    }

    const basicFoodTagsList = basicFoodTagOrder.concat(UNKNOWN_TAG);

    const basicFoodMap = Object.keys(glossary.basicFoods).reduce(
      (acc, foodId) => {
        const tagId = basicFoodTagAssociation[foodId] || UNKNOWN_TAG;
        if (!acc[tagId]) {
          debugger;
        }
        return { ...acc, [tagId]: acc[tagId].concat(foodId) };
      },
      basicFoodTagsList.reduce((acc, tagId) => ({ ...acc, [tagId]: [] }), {})
    );

    return (
      <Stack spacing={0}>
        {basicFoodTagsList.map((tagId) => {
          const isEmpty = !basicFoodMap[tagId].length;

          if (isEmpty) {
            return (
              <Accordion
                key={`basicFoods-empty-${tagId}`}
                variant="outlined"
                disabled={true}
                expanded={false}
              >
                <AccordionSummary
                  expandIcon={
                    <IconButton>
                      <ExpandMoreIcon />
                    </IconButton>
                  }
                >
                  <Typography variant="h6">
                    {glossary.basicFoodTags[tagId] || unknownSectionName}
                  </Typography>
                </AccordionSummary>
              </Accordion>
            );
          }
          return (
            <Accordion key={`basicFoods-${tagId}`} variant="outlined">
              <AccordionSummary
                expandIcon={
                  <IconButton>
                    <ExpandMoreIcon />
                  </IconButton>
                }
              >
                <Typography variant="h6">
                  {glossary.basicFoodTags[tagId] || unknownSectionName}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack sx={{ width: "95%" }} spacing={2} alignItems="left">
                  {basicFoodMap[tagId].map(
                    getRenderInputButtonStack("basicFoods")
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}
        <Box sx={{ paddingTop: 3 }}>
          {getRenderInputButtonStack("basicFoods")("basicFoods")}
        </Box>
      </Stack>
    );
  };

  const renderRecipeTagsContents = () => (
    <Stack sx={{ width: "95%" }} spacing={2} alignItems="left">
      {(glossary.recipeTags ? Object.keys(glossary.recipeTags) : [])
        .concat("recipeTags")
        .map(getRenderInputButtonStack("recipeTags"))}
    </Stack>
  );

  return (
    <>
      <PageTitle>Glossary</PageTitle>

      <Stack
        sx={{ width: "100%", paddingTop: "15px" }}
        spacing={3}
        alignItems="center"
      >
        <Accordion key={"basicFoodTags"} sx={{ width: "95%" }}>
          <AccordionSummary
            expandIcon={
              <IconButton>
                <ExpandMoreIcon />
              </IconButton>
            }
          >
            <Typography variant="h6">Departments</Typography>
          </AccordionSummary>
          <AccordionDetails>{renderBasicFoodTagsContents()}</AccordionDetails>
        </Accordion>
        <Accordion key={"basicFoods"} sx={{ width: "95%" }}>
          <AccordionSummary
            expandIcon={
              <IconButton>
                <ExpandMoreIcon />
              </IconButton>
            }
          >
            <Typography variant="h6">Basic Foods</Typography>
          </AccordionSummary>
          <AccordionDetails>{renderBasicFoodContents()}</AccordionDetails>
        </Accordion>
        <Accordion key={"recipeTags"} sx={{ width: "95%" }}>
          <AccordionSummary
            expandIcon={
              <IconButton>
                <ExpandMoreIcon />
              </IconButton>
            }
          >
            <Typography variant="h6">Recipe Tags</Typography>
          </AccordionSummary>
          <AccordionDetails>{renderRecipeTagsContents()}</AccordionDetails>
        </Accordion>
      </Stack>
    </>
  );
}

export default Glossary;
