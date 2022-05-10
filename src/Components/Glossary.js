import { useState } from "react";

import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";

import { getDatabase, ref, child, push, update } from "firebase/database";

import { getPresentationName } from "../utils";

function Glossary(props) {
  const { glossary, addAlert, readOnly } = props;

  const [editingEntry, setEditingEntry] = useState({});
  const clearEditingEntry = () => setEditingEntry({});

  const updateRequest = (sectionKey, entryKey, value) => {
    update(ref(getDatabase()), {
      [`glossary/${sectionKey}/${entryKey}`]: value,
    })
      .then(() => {
        addAlert({
          message: (
            <span>
              Succesfully updated the glossary for <strong>"{value}"</strong>.
            </span>
          ),
          alertProps: { severity: "success" },
        });
      })
      .catch(() => {
        addAlert({
          message: "The request did not go through.",
          title: "Error",
          alertProps: { severity: "error" },
        });
      });

    clearEditingEntry();
  };

  const getInputHandler = (key, valueComparator) => (event) => {
    const newValue = event.target.value;

    if (newValue === valueComparator) {
      clearEditingEntry();
    } else {
      setEditingEntry({ key, value: newValue });
    }
  };

  const renderAction = (isActiveEntry, sectionKey, entryKey, isAddingValue) => {
    if (readOnly) {
      return null;
    }

    const isEmptyValue = editingEntry.value === "";

    if (isActiveEntry) {
      return (
        <Button
          color="secondary"
          variant="outlined"
          size="small"
          sx={{ width: "90px" }}
          onClick={() => {
            let updateEntryKey = entryKey;

            if (isAddingValue) {
              const db = getDatabase();
              updateEntryKey = push(
                child(ref(db), `glossary/${sectionKey}`)
              ).key;
            }

            updateRequest(
              sectionKey,
              updateEntryKey,
              isEmptyValue ? null : editingEntry.value
            );
          }}
        >
          {isAddingValue ? "Add" : isEmptyValue ? "Delete" : "Update"}
        </Button>
      );
    }
  };

  const getRenderInputButtonStack = (sectionKey) => (entryKey) => {
    const isAddingValue = sectionKey === entryKey;

    const value = isAddingValue ? "" : glossary[sectionKey][entryKey];

    const isActiveEntry = editingEntry.key === entryKey;
    return (
      <Stack key={entryKey} direction="row" spacing={2}>
        <TextField
          variant="outlined"
          label={isAddingValue ? "Add entry" : isActiveEntry && value}
          size="small"
          value={isActiveEntry ? editingEntry.value : value}
          disabled={readOnly || (!!editingEntry.key && !isActiveEntry)}
          sx={{ width: "200px" }}
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
        {renderAction(isActiveEntry, sectionKey, entryKey, isAddingValue)}
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
