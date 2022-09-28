import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

function Settings(props) {
  const { addAlert } = props;
  return (
    <div>
      <Typography
        variant="h4"
        sx={{
          color: "primary.main",
          textAlign: "center",
          paddingY: 2,
        }}
      >
        Settings
      </Typography>
      <Stack sx={{ paddingTop: "15px" }} spacing={3} alignItems="center">
        <Button color="secondary" variant="outlined">
          Export Data
        </Button>
        <Button color="secondary" variant="outlined">
          Import Data
        </Button>
        <Button color="secondary" variant="outlined">
          Delete Data
        </Button>
      </Stack>
    </div>
  );
}

export default Settings;
