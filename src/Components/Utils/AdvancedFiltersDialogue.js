import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

import RecipeSearchInput from "./RecipeSearchInput";
import FavoriteSwitch from "./FavoriteSwitch";
import BasicFoodMultiSelect from "./BasicFoodMultiSelect";

function AdvancedFiltersDialogue(props) {
  const {
    open,
    onClose,
    filteringOptions,
    setFilteringOptions,
    glossary,
    basicFoodTagOrder,
    basicFoodTagAssociation,
  } = props;

  const {
    searchTerm = "",
    ingredientsList = [],
    tagsList = [],
    isFavoriteFilter = false,
  } = filteringOptions;

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
      sx={{ "& .MuiDialog-paper": { width: "80%" } }}
      maxWidth="xs"
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
            <Box sx={{ width: "70%" }}>
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
          <Stack
            key="tagsIncludes"
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            sx={{ width: "100%" }}
          >
            <Box sx={{ width: "20%" }}>
              <Typography>Has tags:</Typography>
            </Box>
            <Box sx={{ width: "70%" }}>
              <Autocomplete
                multiple={true}
                limitTags={3}
                id="multiple-limit-tags"
                options={
                  glossary && glossary.recipeTags
                    ? Object.keys(glossary.recipeTags).map((tagId) => ({
                        tagId,
                        title: glossary.recipeTags[tagId],
                      }))
                    : []
                }
                getOptionLabel={(option) => option.title}
                getOptionDisabled={(option) => tagsList.includes(option.tagId)}
                isOptionEqualToValue={(optionA, optionB) =>
                  optionA.tagId === optionB.tagId
                }
                value={tagsList.map((tagId) => ({
                  tagId,
                  title: glossary.recipeTags[tagId],
                }))}
                onChange={(event, selection) => {
                  const _tagsList = selection.map((option) => option.tagId);
                  updateFilteringOptions({ tagsList: _tagsList });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Enter tags"
                  />
                )}
                ChipProps={{
                  color: "tertiary",
                  variant: "outlined",
                }}
              />
            </Box>
          </Stack>
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
            <Box sx={{ width: "70%" }} display="flex" justifyContent="center">
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
        <Button color="warning" onClick={clearFilteringOptions}>
          Clear
        </Button>
        <Button color="success" variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AdvancedFiltersDialogue;
