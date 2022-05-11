import { useEffect, useState, useRef } from "react";

import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import Checkbox from "@mui/material/Checkbox";

import { updateRequest } from "../utils";

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

  const [shoppingMap, setShoppingMap] = useState();
  const [activeEditingCollated, setActiveEditingCollated] = useState({});
  const clearActiveEditingCollated = () => setActiveEditingCollated({});

  const [newFoodId, setNewFoodId] = useState();
  const [newFoodAmount, setNewFoodAmount] = useState();

  useEffect(() => {
    if (!shoppingList) {
      return;
    }

    const newShoppingMap = { unchecked: {}, checked: {} };

    Object.keys(shoppingList).forEach((basicFoodId) => {
      const foodEntry = shoppingList[basicFoodId];
      const { isChecked } = foodEntry;

      const tagId = basicFoodTagAssociation[basicFoodId];

      if (!newShoppingMap.unchecked.hasOwnProperty(tagId)) {
        newShoppingMap.unchecked[tagId] = {};
      }

      if (!isChecked) {
        newShoppingMap.unchecked[tagId][basicFoodId] = foodEntry;
      } else {
        newShoppingMap.checked[basicFoodId] = foodEntry;
      }
    });

    setShoppingMap(newShoppingMap);
  }, [shoppingList]);

  const getInputHandler = (key, valueComparator) => (event) => {
    const newValue = event.target.value;

    if (newValue === valueComparator) {
      clearActiveEditingCollated();
    } else {
      setActiveEditingCollated({ key, value: newValue });
    }
  };

  const renderBasicFoodAccordion = (basicFoodId, foodEntry) => {
    const doesFoodExist = !!glossary.basicFoods[basicFoodId];

    if (!doesFoodExist) {
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
      <Accordion key={basicFoodId} sx={{ width: "95%" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Checkbox
            onChange={(event) => {
              updateRequest({
                [`${updatePath}/${basicFoodId}/isChecked`]:
                  event.target.checked,
              });
            }}
          />
          <Typography>{glossary.basicFoods[basicFoodId]}</Typography>
          {collatedAmount && <Typography>{collatedAmount}</Typography>}
        </AccordionSummary>
        <AccordionDetails>
          <Stack sx={{ width: "95%" }} spacing={2} alignItems="left">
            {Object.keys(recipeList)
              .map((recipeId) => {
                if (!cookbook || !recipeId || !cookbook[recipeId]) {
                  debugger;
                }
                return (
                  <Stack key={recipeId} direction="row" spacing={1}>
                    <Typography>
                      {cookbook[recipeId].ingredients[basicFoodId]}
                    </Typography>
                    <IconButton>
                      <OpenInFullIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        updateRequest({
                          [`${updatePath}/${basicFoodId}/list/${recipeId}`]:
                            null,
                        });
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                );
              })
              .concat(
                <Stack key="setCollated" direction="row" spacing={1}>
                  <TextField
                    variant="outlined"
                    label="Set collated amount"
                    size="small"
                    value={inputValue}
                    disabled={disabled}
                    sx={{ width: "190px" }}
                    onFocus={() => {
                      if (activeEditingCollated.key !== basicFoodId) {
                        setActiveEditingCollated({
                          key: basicFoodId,
                          value: collatedAmount,
                        });
                      }
                    }}
                    onChange={getInputHandler(basicFoodId, collatedAmount)}
                    InputProps={{
                      endAdornment: isActiveInput && (
                        <InputAdornment position="end">
                          <IconButton
                            sx={{ color: "alt.main" }}
                            onClick={() => {
                              setActiveEditingCollated({
                                key: basicFoodId,
                                value: collatedAmount,
                              });
                            }}
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
                        const updates = {};
                        updates[`${updatePath}/${basicFoodId}/collatedAmount`] =
                          isEmptyValue ? null : inputValue;

                        updateRequest(updates, addAlert);
                        clearActiveEditingCollated();
                      }}
                    >
                      {isEmptyValue ? "Delete" : "Update"}
                    </Button>
                  )}
                </Stack>
              )}
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

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
      {!glossary ? (
        <Typography>Ope, no items in Glossary</Typography>
      ) : !shoppingMap ? (
        <Typography
          variant="h6"
          sx={{
            color: "secondary.main",
            textAlign: "center",
          }}
        >
          Ope, no items in Shopping List
        </Typography>
      ) : (
        <Stack
          sx={{ width: "100%", paddingTop: "10px" }}
          spacing={2}
          alignItems="center"
        >
          {Object.keys(shoppingMap.unchecked)
            .map((tagId) => (
              <Accordion key={tagId} sx={{ width: "95%" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{glossary.basicFoodTags[tagId]}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack sx={{ width: "95%" }} spacing={0} alignItems="left">
                    {Object.keys(shoppingMap.unchecked[tagId]).map(
                      (basicFoodId) =>
                        renderBasicFoodAccordion(
                          basicFoodId,
                          shoppingMap.unchecked[tagId][basicFoodId]
                        )
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))
            .concat(
              <Accordion key={"completed"} sx={{ width: "95%" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Completed</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack sx={{ width: "95%" }} spacing={0} alignItems="left">
                    {Object.keys(shoppingMap.checked).map((basicFoodId) =>
                      renderBasicFoodAccordion(
                        basicFoodId,
                        shoppingMap.checked[basicFoodId]
                      )
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )
            .concat(
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ width: "150px" }}
                  disabled={readOnly}
                >
                  Delete all
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ width: "150px" }}
                  disabled={readOnly}
                >
                  Delete checked
                </Button>
              </Stack>
            )
            .concat(
              <Stack direction="row" spacing={2}>
                <FormControl
                  size="small"
                  variant="standard"
                  sx={{ width: "120px" }}
                  disabled={readOnly}
                >
                  {!newFoodId && <InputLabel id="newFood">Add item</InputLabel>}
                  <Select
                    labelId={"newFood"}
                    id={"newFood"}
                    value={newFoodId || ""}
                    onChange={(event) => {
                      setNewFoodId(event.target.value);
                    }}
                  >
                    {Object.keys(glossary.basicFoods)
                      .map((basicFoodId) => (
                        <MenuItem value={basicFoodId} key={basicFoodId}>
                          {glossary.basicFoods[basicFoodId]}
                        </MenuItem>
                      ))
                      .concat(
                        <MenuItem value={null} key={"none"}>
                          {""}
                        </MenuItem>
                      )}
                  </Select>
                  <TextField
                    variant="outlined"
                    label="Set amount"
                    size="small"
                    value={newFoodAmount}
                    disabled={readOnly}
                    sx={{ width: "120px" }}
                    onChange={(event) => {
                      setNewFoodAmount(event.target.value);
                    }}
                    InputProps={{
                      endAdornment: (
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
                </FormControl>
              </Stack>
            )
            .concat(
              <Button
                variant="outlined"
                size="small"
                sx={{ width: "300px" }}
                disabled={readOnly}
                onClick={() => {
                  if (newFoodId && newFoodAmount) {
                    updateRequest({
                      [`${updatePath}/${newFoodId}`]: {
                        isChecked: false,
                        collatedAmount: newFoodAmount,
                      },
                    });
                  }
                }}
              >
                Add new item
              </Button>
            )}
        </Stack>
      )}
    </div>
  );
}

export default ShoppingList;
