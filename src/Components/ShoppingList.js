import { useEffect, useState } from "react";

import { TransitionGroup } from "react-transition-group";

import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import Checkbox from "@mui/material/Checkbox";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { updateRequest, deleteRequest } from "../utils";

const UNKNOWN_TAG = "UNKNOWN_TAG";

function ShoppingList(props) {
  const {
    glossary,
    basicFoodTagAssociation,
    shoppingList,
    cookbook,
    addAlert,
    updatePath,
    readOnly,
  } = props;

  const [shoppingMap, setShoppingMap] = useState({
    unchecked: {},
    checked: {},
  });
  const [activeEditingCollated, setActiveEditingCollated] = useState({});
  const clearActiveEditingCollated = () => {
    setActiveEditingCollated({});
  };

  const [newFoodId, setNewFoodId] = useState();
  const [newFoodAmount, setNewFoodAmount] = useState("");
  const clearNewFood = () => {
    setNewFoodId();
    setNewFoodAmount("");
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

      let tagId = basicFoodTagAssociation[basicFoodId];

      if (!glossary.basicFoodTags[tagId]) {
        tagId = UNKNOWN_TAG;
      }

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
      deleteRequest([`${updatePath}/${basicFoodId}`]);
      return null;
    }

    const { collatedAmount = "", list: recipeList = [] } = foodEntry;
    const isActiveInput = activeEditingCollated.key === basicFoodId;
    const disabled =
      readOnly || (!!activeEditingCollated.key && !isActiveInput);
    const inputValue = isActiveInput
      ? activeEditingCollated.value
      : collatedAmount;
    const isEmptyValue = inputValue === "";

    return (
      <Accordion key={basicFoodId} disableGutters variant="outlined">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center">
            <Checkbox
              color="primary"
              sx={{ paddingLeft: "0" }}
              checked={shoppingList[basicFoodId].isChecked}
              onChange={(event) => {
                updateRequest({
                  [`${updatePath}/${basicFoodId}/isChecked`]:
                    event.target.checked,
                });
              }}
            />
            <Typography sx={{ fontWeight: 600 }}>
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
                      {cookbook[recipeId].ingredients[basicFoodId]}:
                    </Typography>
                    <Typography noWrap sx={{ width: "fill-available" }}>
                      {cookbook[recipeId.name]}
                    </Typography>
                    <IconButton
                      onClick={() => {
                        deleteRequest([
                          `${updatePath}/${basicFoodId}/list/${recipeId}`,
                        ]);
                      }}
                    >
                      <ClearIcon color="secondary" />
                    </IconButton>
                  </Stack>
                </Collapse>
              ))}
            </TransitionGroup>

            <Stack key="setCollated" direction="row" spacing={1}>
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
              {isActiveInput && (
                <Button
                  color="secondary"
                  variant="outlined"
                  size="small"
                  sx={{ width: "115px" }}
                  disabled={disabled}
                  onClick={() => {
                    if (isEmptyValue) {
                      deleteRequest([`${updatePath}/${basicFoodId}`], addAlert);
                    } else {
                      updateRequest(
                        {
                          [`${updatePath}/${basicFoodId}/collatedAmount`]:
                            inputValue,
                        },
                        addAlert
                      );
                    }

                    clearActiveEditingCollated();
                  }}
                >
                  <Typography>{isEmptyValue ? "Delete" : "Update"}</Typography>
                </Button>
              )}
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderDeleteButtons = () => {
    if (!shoppingList) {
      return null;
    }

    return (
      <Stack direction="row" spacing={2} sx={{ paddingTop: "12px" }}>
        <Button
          color="secondary"
          variant="contained"
          size="small"
          sx={{ width: "168px" }}
          disabled={readOnly}
          onClick={() => {
            deleteRequest([updatePath], addAlert);
          }}
        >
          <Typography>Delete all</Typography>
        </Button>
        <Button
          color="secondary"
          variant="contained"
          size="small"
          sx={{ width: "168px" }}
          disabled={readOnly || !Object.keys(shoppingMap.checked).length}
          onClick={() => {
            deleteRequest(
              Object.keys(shoppingList).reduce((acc, basicFoodId) => {
                if (shoppingList[basicFoodId].isChecked) {
                  acc.push(`${updatePath}/${basicFoodId}`);
                }
                return acc;
              }, []),
              addAlert
            );
          }}
        >
          <Typography>Delete checked</Typography>
        </Button>
      </Stack>
    );
  };

  const renderNewItemControls = () => (
    <Stack direction="row" spacing={4}>
      <Stack spacing={1}>
        <FormControl
          size="small"
          variant="standard"
          sx={{ width: "206px" }}
          disabled={readOnly}
        >
          <InputLabel id="newFood">Enter item</InputLabel>
          <Select
            labelId={"newFood"}
            id={"newFood"}
            value={newFoodId || ""}
            onChange={(event) => {
              setNewFoodId(event.target.value);
            }}
          >
            {[
              <MenuItem value={null} key={"none"}>
                <Typography component={"em"}>Enter item</Typography>
              </MenuItem>,
              ...Object.keys(glossary.basicFoods).map((basicFoodId) => (
                <MenuItem value={basicFoodId} key={basicFoodId}>
                  {glossary.basicFoods[basicFoodId]}
                </MenuItem>
              )),
            ]}
          </Select>
        </FormControl>
        <TextField
          variant="outlined"
          label="Set amount"
          size="small"
          value={newFoodAmount}
          disabled={readOnly}
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
            [`${updatePath}/${newFoodId}`]: {
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

  const renderChecked = () => {
    if (!shoppingList) {
      return null;
    }

    if (!Object.keys(shoppingMap.checked).length) {
      return (
        <Accordion
          key={"emptyChecked"}
          sx={{ width: "95%" }}
          disabled={true}
          expanded={false}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Checked</Typography>
          </AccordionSummary>
        </Accordion>
      );
    }

    return (
      <Accordion key={"checked"} sx={{ width: "95%" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Checked</Typography>
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
    );
  };

  if (!glossary) {
    return null;
  }

  return (
    <div>
      <Typography
        variant="h4"
        sx={{
          color: "primary.main",
          textAlign: "center",
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
          {Object.keys(shoppingMap.unchecked).map((tagId) => (
            <Accordion key={tagId} sx={{ width: "95%" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {tagId === UNKNOWN_TAG ? (
                  <Typography variant="h6" component={"em"}>
                    Unknown Section
                  </Typography>
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
      </Stack>
    </div>
  );
}

export default ShoppingList;
