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

import RecipeSearchInput from "../Utils/RecipeSearchInput";

import {
  constructBasicFoodOptions,
  getCalculateFoodSectionForOptions,
} from "../../utils/foods";
import { unknownSectionName } from "../../constants";

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

  const { searchTerm = "", ingredientList = [] } = filteringOptions;

  const clearFilteringOptions = () => {
    setFilteringOptions({});
  };

  const updateFilteringOptions = (partialFilteringOptions) => {
    setFilteringOptions((_filteringOptions) => ({
      ..._filteringOptions,
      ...partialFilteringOptions,
    }));
  };

  const calculateFoodSectionForOptions = getCalculateFoodSectionForOptions(
    glossary,
    basicFoodTagAssociation,
    unknownSectionName
  );

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
          spacing={1}
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
          <Stack
            key="ingredientsIncludes"
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            sx={{ width: "100%" }}
          >
            <Box sx={{ width: "20%" }}>
              <Typography>Includes foods:</Typography>
            </Box>
            <Box sx={{ width: "70%" }}>
              <Autocomplete
                multiple={true}
                limitTags={3}
                id="ingredient-input-multi"
                options={constructBasicFoodOptions(
                  glossary,
                  basicFoodTagOrder || [],
                  unknownSectionName,
                  calculateFoodSectionForOptions
                )}
                getOptionLabel={(option) => option.title}
                groupBy={(option) =>
                  option.foodId
                    ? calculateFoodSectionForOptions(option.foodId)
                    : null
                }
                isOptionEqualToValue={(optionA, optionB) =>
                  optionA.foodId === optionB.foodId
                }
                getOptionDisabled={(option) =>
                  ingredientList && ingredientList.includes(option.foodId)
                }
                value={ingredientList.map((foodId) => ({
                  foodId,
                  title: glossary.basicFoods[foodId],
                }))}
                onChange={(event, selection) => {
                  const _ingredientList = selection.map(
                    (option) => option.foodId
                  );
                  updateFilteringOptions({ ingredientList: _ingredientList });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ingredients"
                    placeholder="Enter item"
                  />
                )}
                ChipProps={{ color: "secondary", variant: "outlined" }}
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
