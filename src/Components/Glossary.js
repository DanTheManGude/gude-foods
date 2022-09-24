import { useState } from "react";

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

import { updateRequest, createKey } from "../utils";

function Glossary(props) {
  const {
    glossary,
    shoppingList,
    cookbook,
    basicFoodTagAssociation,
    addAlert,
    glossaryPath,
    shoppingListPath,
    cookbookPath,
    basicFoodTagAssociationPath,
  } = props;

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
          color="secondary"
          variant="outlined"
          size="small"
          sx={{ width: "109px" }}
          disabled={disabled}
          onClick={() => {
            let updateEntryKey = entryKey;

            if (isAddingValue) {
              updateEntryKey = createKey(`${glossaryPath}/${sectionKey}`);
            }

            const updates = {};
            updates[`${glossaryPath}/${sectionKey}/${updateEntryKey}`] =
              isEmptyValue ? null : editingEntry.value;

            if (isEmptyValue) {
              switch (sectionKey) {
                case "basicFoods":
                  updates[`${basicFoodTagAssociationPath}/${entryKey}`] = null;
                  if (shoppingList) {
                    updates[`${shoppingListPath}/${entryKey}`] = null;
                  }
                  if (cookbook) {
                    Object.keys(cookbook).forEach((recipeId) => {
                      if (
                        cookbook[recipeId].ingredients.hasOwnProperty(entryKey)
                      ) {
                        updates[
                          `${cookbookPath}/${recipeId}/ingredients/${entryKey}`
                        ] = null;
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
                            `${basicFoodTagAssociationPath}/basicFoodId`
                          ] = null;
                        }
                      }
                    );
                  }
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
                        }
                      }
                    });
                  }
                  break;
                default:
                  break;
              }
            }

            updateRequest(updates, addAlert);
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
      const basicFoodTags = glossary.basicFoodTags;
      const tagId =
        basicFoodTagAssociation && basicFoodTagAssociation[entryKey];
      const value = basicFoodTags.hasOwnProperty(tagId) ? tagId : "";

      return (
        <FormControl
          size="small"
          variant="standard"
          sx={{ width: "110px" }}
          disabled={disabled}
        >
          {value === "" && (
            <InputLabel id={entryKey} style={{ top: "-11px" }}>
              Dept.
            </InputLabel>
          )}
          <Select
            labelId={entryKey}
            id={entryKey}
            value={value}
            onChange={(event) => {
              updateRequest(
                {
                  [`${basicFoodTagAssociationPath}/${entryKey}`]:
                    event.target.value,
                },
                addAlert
              );
            }}
            style={{ marginTop: 0, paddingTop: "5px" }}
          >
            {Object.keys(basicFoodTags)
              .map((basicFoodTagKey) => (
                <MenuItem value={basicFoodTagKey} key={basicFoodTagKey}>
                  {basicFoodTags[basicFoodTagKey]}
                </MenuItem>
              ))
              .concat(
                <MenuItem value={null} key={"delete"}>
                  <em>None</em>
                </MenuItem>
              )}
          </Select>
        </FormControl>
      );
    }
  };

  const getRenderInputButtonStack = (sectionKey) => (entryKey) => {
    const isAddingValue = sectionKey === entryKey;
    const value = isAddingValue ? "" : glossary[sectionKey][entryKey];
    const isActiveEntry = editingEntry.key === entryKey;
    const disabled = !!editingEntry.key && !isActiveEntry;
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
            endAdornment: isActiveEntry && (
              <InputAdornment position="end">
                <IconButton
                  sx={{ color: "alt.main" }}
                  onClick={() => {
                    setEditingEntry({ entryKey, value });
                  }}
                  edge="end"
                >
                  <UndoOutlinedIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
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

  const renderBasicFoodTags = () => (
    <Accordion key={"basicFoodTags"} sx={{ width: "95%" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Departments</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack sx={{ width: "95%" }} spacing={2} alignItems="left">
          {(glossary && glossary.basicFoodTags
            ? Object.keys(glossary.basicFoodTags)
            : []
          )
            .concat("basicFoodTags")
            .map(getRenderInputButtonStack("basicFoodTags"))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );

  const renderBasicFoods = () => {
    return null;
  };

  const renderRecipeTags = () => (
    <Accordion key={"recipeTags"} sx={{ width: "95%" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Recipe Tags</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack sx={{ width: "95%" }} spacing={2} alignItems="left">
          {(glossary && glossary.recipeTags
            ? Object.keys(glossary.recipeTags)
            : []
          )
            .concat("recipeTags")
            .map(getRenderInputButtonStack("recipeTags"))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <div>
      <Typography
        variant="h4"
        sx={{
          color: "primary.main",
          textAlign: "center",
        }}
      >
        Glossary
      </Typography>

      <Stack
        sx={{ width: "100%", paddingTop: "15px" }}
        spacing={3}
        alignItems="center"
      >
        {renderBasicFoodTags()}
        {renderBasicFoods()}
        {renderRecipeTags()}
      </Stack>
    </div>
  );
}

export default Glossary;
