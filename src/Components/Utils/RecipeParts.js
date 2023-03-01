import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

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
