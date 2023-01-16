import React, { useEffect, useState } from "react";

import { TransitionGroup } from "react-transition-group";

import styled from "@emotion/styled";

import Paper from "@mui/material/Paper";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import Checkbox from "@mui/material/Checkbox";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  updateRequest,
  deleteRequest,
  removeRecipeFromMenuAndShoppingList,
  updateRecipeMenuCount,
  removeRecipesFromMenu,
  addRecipesToMenu,
} from "../../utils/requests";
import { unknownSectionName, UNKNOWN_TAG } from "../../constants";

import CreateBasicFoodDialog from "../Utils/CreateBasicFoodDialog";
import DeleteDialog from "../Utils/DeleteDialog";
import BasicFoodAutocomplete from "../Utils/BasicFoodAutocomplete";

const deleteKeys = {
  ALL: "the entire shopping list",
  CHECKED: "the checked items",
};

const MenuCount = styled(Button)`
  &&& {
    &.Mui-disabled {
      color: #fff;
      border-color: #ddd;
    }
  }
`;

function ShoppingList(props) {
  const {
    database: {
      glossary,
      basicFoodTagAssociation,
      shoppingList,
      cookbook: _cookbook,
      basicFoodTagOrder,
      recipeOrder: _recipeOrder,
      menu: _menu,
    },
    dataPaths: {
      shoppingListPath,
      glossaryPath,
      basicFoodTagAssociationPath,
      menuPath,
    },
    addAlert,
  } = props;
  const cookbook = _cookbook || {};
  const menu = _menu || {};
  const recipeOrder = _recipeOrder || [];

  const [shoppingMap, setShoppingMap] = useState({
    unchecked: {},
    checked: {},
  });
  const [activeEditingCollated, setActiveEditingCollated] = useState({});
  const clearActiveEditingCollated = () => {
    setActiveEditingCollated({});
  };

  const [newFoodId, setNewFoodId] = useState(null);
  const [newFoodAmount, setNewFoodAmount] = useState("");
  const clearNewFood = () => {
    setNewFoodId(null);
    setNewFoodAmount("");
  };

  const [openCreateBasicFoodDialog, setOpenCreateBasicFoodDialog] =
    useState(false);
  const [createBasicFood, setCreateBasicFood] = useState({});

  const [deleteDialog, setDeleteDialog] = useState(null);
  const closeDeleteDialog = () => {
    setDeleteDialog(null);
  };

  useEffect(() => {
    if (!shoppingList) {
      setShoppingMap({ unchecked: {}, checked: {} });
      return;
    }

    const newShoppingMap = { unchecked: {}, checked: {} };

    Object.keys(shoppingList).forEach((basicFoodId) => {
      const foodEntry = shoppingList[basicFoodId];
      const { isChecked } = foodEntry;

      const tagId =
        (basicFoodTagAssociation && basicFoodTagAssociation[basicFoodId]) ||
        UNKNOWN_TAG;

      if (!isChecked) {
        if (!newShoppingMap.unchecked.hasOwnProperty(tagId)) {
          newShoppingMap.unchecked[tagId] = {};
        }

        newShoppingMap.unchecked[tagId][basicFoodId] = foodEntry;
      } else {
        newShoppingMap.checked[basicFoodId] = foodEntry;
      }
    });

    setShoppingMap(newShoppingMap);
  }, [shoppingList, basicFoodTagAssociation, glossary]);

  const decrementMenuRecipe = (recipeId) => {
    updateRecipeMenuCount(recipeId, menu[recipeId] - 1, menuPath);
  };

  const incrementMenuRecipe = (recipeId) => {
    updateRecipeMenuCount(recipeId, menu[recipeId] + 1, menuPath);
  };

  const getInputHandler = (key, valueComparator) => (event) => {
    const newValue = event.target.value;

    if (newValue === valueComparator) {
      clearActiveEditingCollated();
    } else {
      setActiveEditingCollated({ key, value: newValue });
    }
  };

  const renderBasicFoodAccordion = (basicFoodId, foodEntry) => {
    const doesFoodExist =
      !!glossary.basicFoods[basicFoodId] &&
      !!shoppingList &&
      !!shoppingList[basicFoodId];

    if (!doesFoodExist) {
      return null;
    }

    const { collatedAmount = "", list: recipeList = [] } = foodEntry;
    const isActiveInput = activeEditingCollated.key === basicFoodId;
    const disabled = !!activeEditingCollated.key && !isActiveInput;
    const inputValue = isActiveInput
      ? activeEditingCollated.value
      : collatedAmount;

    return (
      <Accordion key={basicFoodId} disableGutters variant="outlined">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center">
            <Checkbox
              color="primary"
              sx={{ paddingLeft: "0" }}
              checked={!!shoppingList[basicFoodId].isChecked}
              onChange={(event) => {
                updateRequest({
                  [`${shoppingListPath}/${basicFoodId}/isChecked`]:
                    event.target.checked,
                });
              }}
            />
            <Typography sx={{ fontWeight: "medium" }}>
              {glossary.basicFoods[basicFoodId]}
            </Typography>
            {collatedAmount && <Typography>: {collatedAmount}</Typography>}
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2} alignItems="left">
            <TransitionGroup>
              {Object.keys(recipeList).map((recipeId, index) => (
                <Collapse key={index}>
                  <Stack
                    key={recipeId}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography sx={{ minWidth: "fit-content" }}>
                      {recipeList[recipeId] &&
                        menu[recipeId] &&
                        `[${menu[recipeId]}] `}
                      {cookbook[recipeId].ingredients[basicFoodId]}:
                    </Typography>
                    <Typography noWrap sx={{ width: "fill-available" }}>
                      {cookbook[recipeId].name}
                    </Typography>
                    <IconButton
                      onClick={() => {
                        deleteRequest([
                          `${shoppingListPath}/${basicFoodId}/list/${recipeId}`,
                        ]);
                      }}
                    >
                      <ClearIcon color="secondary" />
                    </IconButton>
                  </Stack>
                </Collapse>
              ))}
            </TransitionGroup>

            <Stack
              key="setCollated"
              direction="row"
              spacing={1}
              justifyContent="space-between"
            >
              <TextField
                variant="outlined"
                label="Set total amount"
                size="small"
                value={inputValue}
                disabled={disabled}
                sx={{ width: "190px" }}
                onChange={getInputHandler(basicFoodId, collatedAmount)}
                InputProps={{
                  endAdornment: isActiveInput && (
                    <InputAdornment position="end">
                      <IconButton
                        sx={{ color: "alt.main" }}
                        onClick={clearActiveEditingCollated}
                        edge="end"
                      >
                        <UndoOutlinedIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {isActiveInput ? (
                <Button
                  color={"secondary"}
                  variant="outlined"
                  size="small"
                  sx={{ width: "115px" }}
                  disabled={disabled}
                  onClick={() => {
                    updateRequest(
                      {
                        [`${shoppingListPath}/${basicFoodId}/collatedAmount`]:
                          inputValue,
                      },
                      addAlert
                    );

                    clearActiveEditingCollated();
                  }}
                >
                  <Typography>{"Update"}</Typography>
                </Button>
              ) : (
                <IconButton
                  onClick={() => {
                    deleteRequest(
                      [`${shoppingListPath}/${basicFoodId}`],
                      addAlert
                    );
                  }}
                >
                  <ClearIcon color="warning" />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  const handleDelete = () => {
    let deletePaths = [];

    if (deleteDialog === deleteKeys.ALL) {
      deletePaths = [shoppingListPath];
    }

    if (deleteDialog === deleteKeys.CHECKED) {
      deletePaths = Object.keys(shoppingList).reduce((acc, basicFoodId) => {
        if (shoppingList[basicFoodId].isChecked) {
          acc.push(`${shoppingListPath}/${basicFoodId}`);
        }
        return acc;
      }, []);
    }

    deleteRequest(deletePaths, addAlert);
  };

  const renderDeleteButtons = () => {
    if (!shoppingList) {
      return null;
    }

    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          color="secondary"
          variant="contained"
          size="small"
          sx={{ width: "168px" }}
          onClick={() => {
            setDeleteDialog(deleteKeys.ALL);
          }}
        >
          <Typography>Delete all</Typography>
        </Button>
        <Button
          color="secondary"
          variant="contained"
          size="small"
          sx={{ width: "168px" }}
          disabled={!Object.keys(shoppingMap.checked).length}
          onClick={() => {
            setDeleteDialog(deleteKeys.CHECKED);
          }}
        >
          <Typography>Delete checked</Typography>
        </Button>
      </Stack>
    );
  };

  const renderMenuButtons = () => {
    if (!shoppingList) {
      return null;
    }

    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          color="secondary"
          variant="contained"
          size="small"
          sx={{ width: "168px" }}
          disabled={!Object.keys(shoppingMap.unchecked).length}
          onClick={() => {
            const recipeList = Object.keys(shoppingMap.unchecked).reduce(
              (recipesByDepartment, tagId) => [
                ...recipesByDepartment,
                ...Object.keys(shoppingMap.unchecked[tagId]).reduce(
                  (recipesByFood, foodId) => [
                    ...recipesByFood,
                    ...Object.keys(shoppingMap.unchecked[tagId][foodId].list),
                  ],
                  []
                ),
              ],
              []
            );
            removeRecipesFromMenu(recipeList, menuPath, addAlert);
          }}
        >
          <Typography>Remove unchecked recipes from menu</Typography>
        </Button>
        <Button
          color="secondary"
          variant="contained"
          size="small"
          sx={{ width: "168px" }}
          disabled={!Object.keys(shoppingMap.checked).length}
          onClick={() => {
            const recipeList = Object.keys(shoppingMap.checked).reduce(
              (recipesByFood, foodId) => [
                ...recipesByFood,
                ...Object.keys(shoppingMap.checked[foodId].list),
              ],
              []
            );
            addRecipesToMenu(recipeList, menu, menuPath, addAlert);
          }}
        >
          <Typography>
            <>
              <span>Add checked</span>
              <br />
              <span>recipes to menu</span>
            </>
          </Typography>
        </Button>
      </Stack>
    );
  };

  const renderNewItemControls = () => {
    return (
      <Stack direction="row" spacing={4}>
        <Stack spacing={1}>
          <BasicFoodAutocomplete
            id="addSelect"
            foodMap={shoppingList}
            newFoodId={newFoodId}
            setNewFoodId={setNewFoodId}
            handleInputvalue={(inputValue) => {
              setOpenCreateBasicFoodDialog(true);
              setCreateBasicFood({ name: inputValue });
            }}
            extraProps={{ sx: { width: "206px" } }}
            glossary={glossary}
            basicFoodTagAssociation={basicFoodTagAssociation}
            basicFoodTagOrder={basicFoodTagOrder}
          />
          <TextField
            variant="outlined"
            label="Set amount"
            size="small"
            value={newFoodAmount}
            sx={{ width: "206px" }}
            onChange={(event) => {
              setNewFoodAmount(event.target.value);
            }}
            InputProps={{
              endAdornment: newFoodAmount && (
                <InputAdornment position="end">
                  <IconButton
                    sx={{ color: "alt.main" }}
                    onClick={() => {
                      setNewFoodAmount("");
                    }}
                    edge="end"
                  >
                    <UndoOutlinedIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Button
          color="primary"
          variant="outlined"
          size="small"
          sx={{ width: "90px" }}
          disabled={!(newFoodId && newFoodAmount)}
          onClick={() => {
            updateRequest({
              [`${shoppingListPath}/${newFoodId}`]: {
                isChecked: false,
                collatedAmount: newFoodAmount,
              },
            });
            clearNewFood();
          }}
        >
          <Typography>Add new item</Typography>
        </Button>
      </Stack>
    );
  };

  const renderMenu = () => (
    <Paper sx={{ width: "95%" }}>
      <Stack sx={{ width: "100%" }} alignItems="center">
        {recipeOrder
          .filter((recipeId) => Object.keys(menu).includes(recipeId))
          .map((recipeId) => (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ width: "95%" }}
              key={recipeId}
            >
              <Typography noWrap sx={{ width: "fill-available" }}>
                {cookbook[recipeId].name}
              </Typography>
              <ButtonGroup variant="outlined" size="small" color="secondary">
                <Button
                  disabled={menu[recipeId] === 1}
                  onClick={() => {
                    decrementMenuRecipe(recipeId);
                  }}
                >
                  <RemoveIcon />
                </Button>
                <MenuCount disabled sx={{ color: "primary" }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    {menu[recipeId]}
                  </Typography>
                </MenuCount>
                <Button
                  onClick={() => {
                    incrementMenuRecipe(recipeId);
                  }}
                >
                  <AddIcon />
                </Button>
              </ButtonGroup>
              <IconButton
                edge="end"
                onClick={() =>
                  removeRecipeFromMenuAndShoppingList(
                    recipeId,
                    shoppingList,
                    { menuPath, shoppingListPath },
                    addAlert
                  )
                }
              >
                <ClearIcon color="warning" />
              </IconButton>
            </Stack>
          ))}
      </Stack>
    </Paper>
  );

  const renderChecked = () => {
    if (!shoppingList) {
      return null;
    }

    if (!Object.keys(shoppingMap.checked).length) {
      return (
        <Accordion
          key={"emptyChecked"}
          sx={{ width: "100%" }}
          disabled={true}
          expanded={false}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" component={"em"}>
              Checked
            </Typography>
          </AccordionSummary>
        </Accordion>
      );
    }

    return (
      <>
        {!Object.keys(shoppingMap.unchecked).length ? (
          <Typography
            color="#fff"
            sx={{
              paddingBottom: 1.5,
              textAlign: "center",
              fontWeight: "500",
              fontSize: "1.1rem",
            }}
          >
            Good job bud! You completed all of your shopping.
          </Typography>
        ) : null}

        <Accordion key={"checked"} sx={{ width: "100%" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" component={"em"}>
              Checked
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={0} alignItems="left">
              {Object.keys(shoppingMap.checked).map((basicFoodId) =>
                renderBasicFoodAccordion(
                  basicFoodId,
                  shoppingMap.checked[basicFoodId]
                )
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </>
    );
  };

  return (
    <div>
      <Typography
        variant="h4"
        sx={{
          color: "primary.main",
          textAlign: "center",
          paddingY: 2,
        }}
      >
        Shopping List
      </Typography>
      <Stack
        sx={{ width: "100%", paddingTop: "15px" }}
        spacing={3}
        alignItems="center"
      >
        <Stack sx={{ width: "95%" }} spacing={0}>
          {(basicFoodTagOrder || [])
            .concat(UNKNOWN_TAG)
            .filter((tagId) => shoppingMap.unchecked.hasOwnProperty(tagId))
            .map((tagId) => (
              <Accordion key={tagId} sx={{ width: "100%" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {tagId === UNKNOWN_TAG ? (
                    <Typography variant="h6">{unknownSectionName}</Typography>
                  ) : (
                    <Typography variant="h6">
                      {glossary.basicFoodTags[tagId]}
                    </Typography>
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={0} alignItems="left">
                    <TransitionGroup>
                      {Object.keys(shoppingMap.unchecked[tagId]).map(
                        (basicFoodId, index) => (
                          <Collapse key={index}>
                            {renderBasicFoodAccordion(
                              basicFoodId,
                              shoppingMap.unchecked[tagId][basicFoodId]
                            )}
                          </Collapse>
                        )
                      )}
                    </TransitionGroup>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          {renderChecked()}
        </Stack>
        {renderNewItemControls()}
        {renderDeleteButtons()}
        {renderMenu()}
        {renderMenuButtons()}
      </Stack>
      <DeleteDialog
        open={!!deleteDialog}
        onClose={closeDeleteDialog}
        titleDO="shopping list"
        comfirmationMessageDO={deleteDialog}
        handleDelete={() => {
          closeDeleteDialog();
          handleDelete();
        }}
      />
      <CreateBasicFoodDialog
        open={openCreateBasicFoodDialog}
        createBasicFood={createBasicFood}
        setCreateBasicFood={setCreateBasicFood}
        handleSelectedFood={setNewFoodId}
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

export default ShoppingList;
