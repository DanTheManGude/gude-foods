import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

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

export const renderNameText = (name) => (
  <Typography
    key="title"
    variant="h5"
    sx={{
      color: "primary.main",
      textAlign: "left",
      width: "100%",
      marginBottom: 1,
    }}
  >
    {name}
  </Typography>
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
