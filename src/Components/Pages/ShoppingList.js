import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { TransitionGroup } from "react-transition-group";

import { styled } from "@mui/material/styles";

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
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import RemoveIcon from "@mui/icons-material/Remove";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ArrowDropDownCircleOutlinedIcon from "@mui/icons-material/ArrowDropDownCircleOutlined";

import { unknownSectionName, UNKNOWN_TAG } from "../../constants";
import {
  updateRequest,
  deleteRequest,
  removeRecipeFromMenuAndShoppingList,
  updateRecipeMenuCount,
  removeRecipesFromMenu,
  addRecipesToMenu,
  changeCheckFood,
} from "../../utils/requests";
import { constructTextFromShoppingMap } from "../../utils/foods";

import DeleteDialog from "../Utils/Dialogs/DeleteDialog";
import SwapSubstitutionDialog from "../Utils/Dialogs/SwapSubstitutionDialog";
import BasicFoodAutocomplete from "../Utils/BasicFoodAutocomplete";
import PageTitle from "../Utils/PageTitle";

import {
  DatabaseContext,
  AddAlertContext,
  DataPathsContext,
} from "../Contexts";

const deleteKeys = {
  ALL: "the entire shopping list",
  CHECKED: "the checked items",
};

const MenuCount = styled(Button)(
  ({ theme }) => `
  &&& {
    &.Mui-disabled {
      color: ${theme.palette.text.primary};
      border-color: ${theme.palette.text.primary};
    }
  }
`
);

function ShoppingList() {
  const addAlert = useContext(AddAlertContext);
  const dataPaths = useContext(DataPathsContext);
  const { shoppingListPath, menuPath } = dataPaths;
  const database = useContext(DatabaseContext);
  const {
    glossary,
    basicFoodTagAssociation,
    shoppingList,
    cookbook: _cookbook,
    basicFoodTagOrder,
    recipeOrder: _recipeOrder,
    menu: _menu,
  } = database;

  const cookbook = _cookbook || {};
  const menu = _menu || {};
  const recipeOrder = _recipeOrder || [];

  const navigate = useNavigate();

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

  const [deleteDialog, setDeleteDialog] = useState(null);
  const closeDeleteDialog = () => {
    setDeleteDialog(null);
  };

  const [swapSubstitutionDialog, setSwapSubstitutionDialog] = useState(false);
  const openSwapSubstitutionDialog = () => setSwapSubstitutionDialog(true);
  const closeSwapSubstitutionDialog = () => {
    setSwapSubstitutionDialog(false);
    setMenuFoodArgs({});
  };

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuFoodArgs, setMenuFoodArgs] = useState({});

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
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

  const removeFood = ({ basicFoodId, recipeId }) => {
    deleteRequest([`${shoppingListPath}/${basicFoodId}/list/${recipeId}`]);
  };

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

    const { collatedAmount = "", list: recipeList = {} } = foodEntry;
    const isActiveInput = activeEditingCollated.key === basicFoodId;
    const disabled = !!activeEditingCollated.key && !isActiveInput;
    const inputValue = isActiveInput
      ? activeEditingCollated.value
      : collatedAmount;

    return (
      <Accordion key={basicFoodId} variant="outlined">
        <AccordionSummary
          expandIcon={
            <IconButton>
              <ExpandMoreIcon />
            </IconButton>
          }
        >
          <Stack direction="row" alignItems="center">
            <Checkbox
              color="primary"
              sx={{ paddingLeft: "0" }}
              checked={!!shoppingList[basicFoodId].isChecked}
              onChange={(event) => {
                changeCheckFood(
                  { shoppingListPath },
                  { glossary },
                  basicFoodId,
                  event.target.checked,
                  addAlert
                );
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
              {Object.entries(recipeList).map(
                ([recipeId, { amount, isOptional, substitution }], index) =>
                  cookbook[recipeId] && (
                    <Collapse key={index}>
                      <Stack
                        key={recipeId}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          sx={{
                            minWidth: "fit-content",
                            fontStyle: isOptional ? "italic" : "inherit",
                          }}
                        >
                          {recipeList.hasOwnProperty(recipeId) &&
                            menu[recipeId] &&
                            `[${menu[recipeId]}] `}
                          {amount}:
                        </Typography>
                        <Typography
                          noWrap
                          sx={{
                            width: "fill-available",
                            fontStyle: isOptional ? "italic" : "inherit",
                          }}
                        >
                          <Link
                            onClick={() => {
                              navigate(`/recipe/${recipeId}`);
                            }}
                            color={"text.primary"}
                          >
                            {cookbook[recipeId].name}
                          </Link>
                        </Typography>
                        <IconButton
                          color="secondary"
                          onClick={
                            substitution
                              ? (event) => {
                                  setMenuFoodArgs({ basicFoodId, recipeId });
                                  setMenuAnchorEl(event.currentTarget);
                                }
                              : () => removeFood({ basicFoodId, recipeId })
                          }
                        >
                          {substitution ? (
                            <ArrowDropDownCircleOutlinedIcon />
                          ) : (
                            <ClearIcon />
                          )}
                        </IconButton>
                      </Stack>
                    </Collapse>
                  )
              )}
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
                  variant="contained"
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
                  <Typography>Update</Typography>
                </Button>
              ) : (
                <IconButton
                  onClick={() => {
                    deleteRequest(
                      [`${shoppingListPath}/${basicFoodId}`],
                      (successAlert) => {
                        addAlert(
                          {
                            ...successAlert,
                            message: (
                              <Typography>
                                {`Succesfully removed food ${glossary.basicFoods[basicFoodId]} from shopping list.`}
                              </Typography>
                            ),
                            undo: () => {
                              updateRequest(
                                {
                                  [`${shoppingListPath}/${basicFoodId}`]:
                                    shoppingList[basicFoodId],
                                },
                                (successAlert) => {
                                  addAlert(
                                    {
                                      ...successAlert,
                                      message: (
                                        <Typography>
                                          {`Succesfully added back food ${glossary.basicFoods[basicFoodId]} to shopping
                                          list.`}
                                        </Typography>
                                      ),
                                    },
                                    5000
                                  );
                                },
                                addAlert
                              );
                            },
                          },
                          5000
                        );
                      },
                      addAlert
                    );
                  }}
                >
                  <ClearIcon color="error" />
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

    deleteRequest(
      deletePaths,
      (successAlert) => {
        addAlert({
          ...successAlert,
          message: (
            <Typography>{`Succesfully removed all ${
              deleteDialog === deleteKeys.CHECKED ? "checked " : ""
            }food from shopping list.`}</Typography>
          ),
          undo: () => {
            updateRequest(
              { [shoppingListPath]: shoppingList },
              (undoSuccessAlert) => {
                addAlert({
                  ...undoSuccessAlert,
                  message: (
                    <Typography>
                      Succesfully added back the shopping list.
                    </Typography>
                  ),
                });
              },
              addAlert
            );
          },
        });
      },
      addAlert
    );
  };

  const renderDeleteButtons = () => {
    if (!shoppingList) {
      return null;
    }

    return (
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ width: "95%" }}
        justifyContent="center"
      >
        <Button
          color="primary"
          variant="outlined"
          size="small"
          sx={{ minWidth: "168px", maxWidth: "336px", flex: "1 1 0" }}
          onClick={() => {
            setDeleteDialog(deleteKeys.ALL);
          }}
        >
          <Typography>Delete all</Typography>
        </Button>
        <Button
          color="primary"
          variant="contained"
          size="small"
          sx={{ minWidth: "168px", maxWidth: "336px", flex: "1 1 0" }}
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
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ width: "95%" }}
        justifyContent="center"
      >
        <Button
          color="secondary"
          variant="outlined"
          size="small"
          sx={{ minWidth: "168px", maxWidth: "336px", flex: "1 1 0" }}
          disabled={!Object.keys(shoppingMap.unchecked).length}
          onClick={() => {
            const recipeList = Object.keys(shoppingMap.unchecked).reduce(
              (recipesByDepartment, tagId) => [
                ...recipesByDepartment,
                ...Object.keys(shoppingMap.unchecked[tagId]).reduce(
                  (recipesByFood, foodId) => [
                    ...recipesByFood,
                    ...Object.keys(
                      shoppingMap.unchecked[tagId][foodId].list || {}
                    ),
                  ],
                  []
                ),
              ],
              []
            );
            removeRecipesFromMenu(recipeList, menuPath, menu, addAlert);
          }}
        >
          <Typography>
            <>
              <span>Remove unchecked</span>
              <br />
              <span>recipes from menu</span>
            </>
          </Typography>
        </Button>
        <Button
          color="secondary"
          variant="outlined"
          size="small"
          sx={{ minWidth: "168px", maxWidth: "336px", flex: "1 1 0" }}
          disabled={!Object.keys(shoppingMap.checked).length}
          onClick={() => {
            const recipeList = Object.keys(shoppingMap.checked).reduce(
              (recipesByFood, foodId) => [
                ...recipesByFood,
                ...Object.keys(shoppingMap.checked[foodId].list || {}),
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
      <Stack
        direction="row"
        spacing={4}
        sx={{ width: "95%" }}
        justifyContent="center"
      >
        <Stack
          spacing={1}
          sx={{ minWidth: "206px", maxWidth: "412px", flex: "1 1 0" }}
        >
          <BasicFoodAutocomplete
            id="addSelect"
            foodMap={shoppingList}
            newFoodId={newFoodId}
            setNewFoodId={setNewFoodId}
            extraProps={{
              sx: { minWidth: "206px", maxWidth: "412px", flex: "1 1 0" },
            }}
          />
          <TextField
            variant="outlined"
            label="Set amount"
            size="small"
            value={newFoodAmount}
            sx={{ minWidth: "206px", maxWidth: "412px", flex: "1 1 0" }}
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
              autoCapitalize: "none",
            }}
          />
        </Stack>
        <Button
          color="primary"
          variant="contained"
          size="small"
          sx={{ minWidth: "90px", maxWidth: "180px", flex: "1 1 0" }}
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
                <Link
                  onClick={() => {
                    navigate(`/recipe/${recipeId}`);
                  }}
                  color={"text.primary"}
                >
                  {cookbook[recipeId].name}
                </Link>
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
                  sx={{ borderLeftColor: "text.primary" }}
                >
                  <AddIcon />
                </Button>
              </ButtonGroup>
              <IconButton
                edge="end"
                onClick={() =>
                  removeRecipeFromMenuAndShoppingList(
                    recipeId,
                    { shoppingList, cookbook, menu },
                    { menuPath, shoppingListPath },
                    addAlert
                  )
                }
              >
                <ClearIcon color="error" />
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
          <AccordionSummary
            expandIcon={
              <IconButton>
                <ExpandMoreIcon />
              </IconButton>
            }
          >
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
            color={"text.primary"}
            sx={{
              paddingBottom: 1.5,
              textAlign: "center",
              fontWeight: "fontWeightMedium",
              fontSize: "1.1rem",
            }}
          >
            Good job bud! You completed all of your shopping.
          </Typography>
        ) : null}

        <Accordion key={"checked"} sx={{ width: "100%" }}>
          <AccordionSummary
            expandIcon={
              <IconButton>
                <ExpandMoreIcon />
              </IconButton>
            }
          >
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

  const renderShareButton = () => {
    if (Object.entries(shoppingMap.unchecked).length === 0) {
      return null;
    }

    return (
      <Button
        color="secondary"
        variant="contained"
        size="small"
        sx={{ width: "352px" }}
        endIcon={<ContentCopyRoundedIcon />}
        onClick={() => {
          try {
            navigator.clipboard
              .writeText(
                constructTextFromShoppingMap(shoppingMap.unchecked, {
                  glossary,
                  cookbook,
                  basicFoodTagOrder,
                })
              )
              .then(() => {
                addAlert({
                  message: (
                    <Typography>
                      Copied shopping list as text to your clipboard.
                    </Typography>
                  ),
                  alertProps: { severity: "success" },
                });
              });
          } catch (error) {
            console.log(error);
            addAlert({
              message: (
                <Typography>Error trying to copy. Try again please.</Typography>
              ),
              alertProps: { severity: "error" },
            });
          }
        }}
      >
        <Typography>Copy shopping list </Typography>
      </Button>
    );
  };

  const withCloseMenu = (handler) => () => {
    handler(menuFoodArgs);
    handleCloseMenu();
  };
  const renderDropdownMenu = () => {
    return (
      <Menu
        id="dropdown-menu"
        anchorEl={menuAnchorEl}
        open={!!menuAnchorEl}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={withCloseMenu(removeFood)}>Remove</MenuItem>
        <MenuItem onClick={withCloseMenu(openSwapSubstitutionDialog)}>
          Use substitution
        </MenuItem>
      </Menu>
    );
  };

  return (
    <div>
      <PageTitle>Shopping List</PageTitle>
      <Stack
        sx={{ width: "100%", paddingTop: "15px" }}
        spacing={3}
        alignItems="center"
      >
        <Stack sx={{ width: "95%" }} spacing={0.5}>
          {(basicFoodTagOrder || [])
            .concat(UNKNOWN_TAG)
            .filter((tagId) => shoppingMap.unchecked.hasOwnProperty(tagId))
            .map((tagId) => (
              <Accordion key={tagId} sx={{ width: "100%" }}>
                <AccordionSummary
                  expandIcon={
                    <IconButton>
                      <ExpandMoreIcon />
                    </IconButton>
                  }
                >
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
        {renderShareButton()}
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
      <SwapSubstitutionDialog
        open={swapSubstitutionDialog}
        onClose={closeSwapSubstitutionDialog}
        basicFoodId={menuFoodArgs.basicFoodId}
        recipeId={menuFoodArgs.recipeId}
        foodInfo={
          menuFoodArgs.basicFoodId &&
          shoppingList.hasOwnProperty(menuFoodArgs.basicFoodId) &&
          shoppingList[menuFoodArgs.basicFoodId].list[menuFoodArgs.recipeId]
        }
      />
      {renderDropdownMenu()}
    </div>
  );
}

export default ShoppingList;
