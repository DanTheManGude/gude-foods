import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

export const renderEditingButtons = (onCancel, onSave) => (
  <>
    <Button
      key="cancel"
      color="warning"
      variant="outlined"
      size="small"
      sx={{ flexGrow: "1" }}
      onClick={onCancel}
    >
      <Typography>Cancel</Typography>
    </Button>
    <Button
      key="save"
      color="success"
      variant="outlined"
      size="small"
      onClick={onSave}
      sx={{ flexGrow: "1" }}
    >
      <Typography>Save</Typography>
    </Button>
  </>
);

export const renderNameInput = (name, updateName, error) => (
  <TextField
    label="Name"
    variant="filled"
    error={error}
    helperText={error && "Enter something"}
    multiline={true}
    value={name}
    onChange={(event) => {
      updateName(event.target.value);
    }}
  />
);

export const renderNotesContainer = (contents) => (
  <Paper elevation={2} sx={{ width: "100%" }}>
    <Box sx={{ padding: 2 }}>{contents}</Box>
  </Paper>
);

export const renderNotesInput = (notes, updateNotes) => (
  <TextField
    label="Enter Notes"
    fullWidth={true}
    multiline={true}
    value={notes}
    onChange={(event) => {
      updateNotes(event.target.value);
    }}
    variant="standard"
  />
);
