import Stack from "@mui/material/Stack";

import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

import RecipeSearchInput from "../Utils/RecipeSearchInput";

function AdvancedFiltersDialogue(props) {
  const { open, onClose, filteringOptions, setFilteringOptions } = props;

  const { searchTerm = "" } = filteringOptions;

  const clearFilteringOptions = () => {
    setFilteringOptions({});
  };

  return (
    <Dialog
      open={open}
      sx={{ "& .MuiDialog-paper": { width: "80%" } }}
      maxWidth="xs"
    >
      <DialogTitle color="primary">Filter recipes</DialogTitle>
      <DialogContent dividers>
        <Stack
          key={"advancedFilters"}
          justifyContent="space-around"
          alignItems="center"
          spacing={1}
        >
          <RecipeSearchInput
            searchTerm={searchTerm}
            setSearchTerm={(_searchTerm) => {
              setFilteringOptions((_filteringOptions) => ({
                ..._filteringOptions,
                searchTerm: _searchTerm,
              }));
            }}
            label="Name"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={clearFilteringOptions}>
          Clear
        </Button>
        <Button color="secondary" variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AdvancedFiltersDialogue;
