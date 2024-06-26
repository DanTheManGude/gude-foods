import { useContext } from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";

import { DatabaseContext } from "../../Contexts";

import RecipeSearchInput from "../RecipeSearchInput";
import FavoriteSwitch from "../FavoriteSwitch";
import BasicFoodMultiSelect from "../BasicFoodMultiSelect";
import RecipeTagsMultiSelect from "../RecipeTagsMultiSelect";

function AdvancedFiltersDialog(props) {
  const { open, onClose, filteringOptions, setFilteringOptions } = props;

  const {
    searchTerm = "",
    ingredientsList = [],
    tagsList = [],
    isFavoriteFilter = false,
  } = filteringOptions;

  const database = useContext(DatabaseContext);
  const { glossary, basicFoodTagOrder, basicFoodTagAssociation } = database;

  const clearFilteringOptions = () => {
    setFilteringOptions({});
  };

  const updateFilteringOptions = (partialFilteringOptions) => {
    setFilteringOptions((_filteringOptions) => ({
      ..._filteringOptions,
      ...partialFilteringOptions,
    }));
  };

  return (
    <Dialog
      open={open}
      sx={{ "& .MuiDialog-paper": { width: "85%" } }}
      maxWidth="s"
    >
      <DialogTitle color="primary">Filter recipes</DialogTitle>
      <DialogContent dividers>
        <Stack
          key="advancedFilters"
          justifyContent="space-around"
          alignItems="center"
          spacing={2}
        >
          <Stack
            key="searchName"
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            sx={{ width: "100%" }}
          >
            <Box sx={{ width: "20%" }}>
              <Typography>Name contains:</Typography>
            </Box>
            <Box sx={{ width: "80%", display: "flex" }}>
              <RecipeSearchInput
                searchTerm={searchTerm}
                setSearchTerm={(_searchTerm) => {
                  updateFilteringOptions({ searchTerm: _searchTerm });
                }}
                label="Recipe Title"
              />
            </Box>
          </Stack>
          <BasicFoodMultiSelect
            glossary={glossary}
            basicFoodTagAssociation={basicFoodTagAssociation}
            basicFoodTagOrder={basicFoodTagOrder}
            ingredientsList={ingredientsList}
            updateIngredientsList={(newIngredientsList) => {
              updateFilteringOptions({ ingredientsList: newIngredientsList });
            }}
          />
          <RecipeTagsMultiSelect
            glossary={glossary}
            tagsList={tagsList}
            updateTagsList={(newTagsList) => {
              updateFilteringOptions({ tagsList: newTagsList });
            }}
          />
          <Stack
            key="isFavorite"
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            sx={{ width: "100%" }}
          >
            <Box sx={{ width: "20%" }}>
              <Typography>Favorited:</Typography>
            </Box>
            <Box sx={{ width: "80%" }} display="flex" justifyContent="center">
              <FavoriteSwitch
                isChecked={isFavoriteFilter}
                updateChecked={(_isFavorite) => {
                  updateFilteringOptions({ isFavoriteFilter: _isFavorite });
                }}
              />
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          color="secondary"
          variant="contained"
          onClick={clearFilteringOptions}
        >
          <Typography>Clear</Typography>
        </Button>
        <Button color="primary" variant="contained" onClick={onClose}>
          <Typography>Close</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AdvancedFiltersDialog;
