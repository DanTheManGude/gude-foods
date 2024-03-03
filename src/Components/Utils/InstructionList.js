import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";

function InstructionList(props) {
  const { instructions = [], setInstructions, editable, recipeId } = props;

  let navigate = useNavigate();

  const [newStep, setNewStep] = useState("");

  const moveStep = (oldIndex, newIndex) => {
    setInstructions((_instructions) => {
      const step = _instructions[oldIndex];
      _instructions.splice(oldIndex, 1);
      _instructions.splice(newIndex, 0, step);
      return _instructions;
    });
  };
  const addStep = () => {
    setInstructions((_instructions) => {
      return _instructions.concat(newStep);
    });
    setNewStep("");
    document.getElementById("newStepInput").focus();
  };
  const updateStep = (index, step) => {
    setInstructions((_instructions) => {
      _instructions.splice(index, 1, step);
      return _instructions;
    });
  };
  const getRemoveStep = (index) => () => {
    setInstructions((_instructions) => {
      _instructions.splice(index, 1);
      return _instructions;
    });
  };

  const renderStepControls = (instructionText, index) => (
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
        multiline={true}
      />
      <HighlightOffIcon color="secondary" onClick={getRemoveStep(index)} />
    </>
  );

  const renderStepText = (instructionText, index) => (
    <>
      <Typography sx={{ fontWeight: "fontWeightBold", width: "17px" }}>
        {index + 1}.
      </Typography>
      &nbsp;
      <Typography>{instructionText}</Typography>
    </>
  );

  const renderSteps = () =>
    instructions.map((instructionText, index) => {
      return (
        <Stack key={index} direction="row" alignItems="center" spacing={1}>
          {editable
            ? renderStepControls(instructionText, index)
            : renderStepText(instructionText, index)}
        </Stack>
      );
    });

  const renderAddInstructionControl = () => (
    <Stack key={"addStep"} direction="row" alignItems="center">
      <span
        onClick={() => {
          if (!newStep) {
            document.getElementById("newStepInput").focus();
          }
        }}
      >
        <Button
          color="primary"
          variant="contained"
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
        multiline={true}
        InputProps={{
          endAdornment: newStep && (
            <InputAdornment position="end">
              <IconButton
                sx={{ color: "alt.main" }}
                onClick={() => {
                  setNewStep("");
                  document.getElementById("newStepInput").focus();
                }}
                edge="end"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );

  return (
    <Accordion key={"instructions"} sx={{ width: "100%" }}>
      <AccordionSummary
        expandIcon={
          <IconButton>
            <ExpandMoreIcon />
          </IconButton>
        }
      >
        <Typography variant="h6">Instructions</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={editable ? 2 : 1}>
          {renderSteps().concat(
            editable
              ? renderAddInstructionControl()
              : recipeId && (
                  <Button
                    key={"cookRecipe"}
                    color="secondary"
                    variant="contained"
                    size="small"
                    onClick={() => {
                      navigate(`/cooking/${recipeId}`);
                    }}
                  >
                    <Typography>Cook recipe</Typography>
                  </Button>
                )
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export default InstructionList;
