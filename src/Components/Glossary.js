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

import { getPresentationName, updateRequest, createKey } from "../utils";

function Glossary(props) {
  const { glossary, basicFoodTagAssociation, addAlert, readOnly } = props;

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
          sx={{ width: "115px" }}
          disabled={disabled}
          onClick={() => {
            let updateEntryKey = entryKey;

            if (isAddingValue) {
              updateEntryKey = createKey(`glossary/${sectionKey}`);
            }

            const updates = {};
            updates[`glossary/${sectionKey}/${updateEntryKey}`] = isEmptyValue
              ? null
              : editingEntry.value;

            if (isEmptyValue) {
              if (sectionKey === "basicFoods") {
                updates[`basicFood-basicFoodTag/${entryKey}`] = null;
              }
              if (sectionKey === "cookbook") {
                updates[`cookbook/${entryKey}`] = null;
              }
            }

            updateRequest(updates, addAlert);
            clearEditingEntry();
          }}
        >
          {isAddingValue ? "Add" : isEmptyValue ? "Delete" : "Update"}
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
          sx={{ width: "115px" }}
          disabled={disabled}
        >
          {value === "" && <InputLabel id={entryKey}>Tag</InputLabel>}
          <Select
            labelId={entryKey}
            id={entryKey}
            value={value}
            onChange={(event) => {
              updateRequest(
                {
                  [`basicFood-basicFoodTag/${entryKey}`]: event.target.value,
                },
                addAlert
              );
            }}
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
    const disabled = readOnly || (!!editingEntry.key && !isActiveEntry);
    return (
      <Stack key={entryKey} direction="row" spacing={2}>
        <TextField
          variant="outlined"
          label={isAddingValue ? "Add entry" : isActiveEntry && value}
          size="small"
          value={isActiveEntry ? editingEntry.value : value}
          disabled={disabled}
          sx={{ width: sectionKey === "cookbook" ? "230px" : "190px" }}
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
      {!glossary ? (
        <Typography>Ope, no items in Glossary</Typography>
      ) : (
        <Stack
          sx={{ width: "100%", paddingTop: "10px" }}
          spacing={2}
          alignItems="center"
        >
          {Object.keys(glossary).map((sectionKey) => (
            <Accordion key={sectionKey} sx={{ width: "95%" }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>{getPresentationName(sectionKey)}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack sx={{ width: "95%" }} spacing={3} alignItems="left">
                  {Object.keys(glossary[sectionKey])
                    .concat(sectionKey)
                    .map(getRenderInputButtonStack(sectionKey))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
    </div>
  );
}

export default Glossary;
