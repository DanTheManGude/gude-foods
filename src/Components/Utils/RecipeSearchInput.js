import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";

function RecipeSearchInput(props) {
  const { searchTerm, setSearchTerm, label = "Search" } = props;

  return (
    <TextField
      key="search"
      variant="outlined"
      sx={{ flexGrow: "1" }}
      label={<Typography>{label}</Typography>}
      value={searchTerm}
      onChange={(event) => {
        setSearchTerm(event.target.value.toUpperCase());
      }}
      InputProps={{
        endAdornment: searchTerm && (
          <InputAdornment position="end">
            <IconButton
              sx={{ color: "alt.main" }}
              onClick={() => {
                setSearchTerm("");
              }}
              edge="end"
            >
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

export default RecipeSearchInput;
