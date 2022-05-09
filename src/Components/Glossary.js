import { useState } from "react";

import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import { getDatabase, ref, child, push, update } from "firebase/database";

import { getPresentationName } from "../utils";

function Glossary(props) {
  const { glossary, addAlert } = props;

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
      setEditingEntry({ key, value: newValue, element: event.target });
    }
  };

  const getRenderInputButtonStack = (sectionKey) => (entryKey) => {
    const isAddingValue = sectionKey === entryKey;

    const value = isAddingValue ? "" : glossary[sectionKey][entryKey];
    const { key: editingKey, value: editingValue } = editingEntry;

    const isActiveEntry = editingKey === entryKey;
    const isEmptyValue = editingValue === "";
    return (
      <Stack key={entryKey} direction="row" spacing={2}>
        <TextField
          variant="outlined"
          label={isAddingValue ? "Add entry" : isActiveEntry && value}
          size="small"
          defaultValue={value}
          disabled={!!editingKey && !isActiveEntry}
          onChange={getInputHandler(entryKey, value)}
        />
        {isActiveEntry && (
          <Button
            color="secondary"
            variant="outlined"
            onClick={() => {
              let updateEntryKey = entryKey;

              if (isAddingValue) {
                editingEntry.element.value = "";
                editingEntry.element.focus();

                const db = getDatabase();
                updateEntryKey = push(
                  child(ref(db), `glossary/${sectionKey}`)
                ).key;
              }

              updateRequest(
                sectionKey,
                updateEntryKey,
                isEmptyValue ? null : editingValue
              );
            }}
          >
            {`${
              isAddingValue ? "Add new" : isEmptyValue ? "Delete" : "Update"
            } value`}
          </Button>
        )}
      </Stack>
    );
  };

  if (!glossary) {
    return <span>Ope, no items in Glossary</span>;
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
        Glossary
      </Typography>
      <Stack
        sx={{ width: "100%", paddingTop: "10px" }}
        spacing={4}
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
              <Stack sx={{ width: "95%" }} spacing={4} alignItems="left">
                {Object.keys(glossary[sectionKey])
                  .concat(sectionKey)
                  .map(getRenderInputButtonStack(sectionKey))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </div>
  );
}

export default Glossary;
