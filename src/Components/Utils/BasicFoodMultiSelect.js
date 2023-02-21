import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

import {
  constructBasicFoodOptions,
  getCalculateFoodSectionForOptions,
} from "../../utils/foods";
import { unknownSectionName } from "../../constants";

function BasicFoodMultiSelect(props) {
  const {
    glossary,
    basicFoodTagAssociation,
    basicFoodTagOrder,
    ingredientsList,
    updateIngredientsList,
  } = props;

  const calculateFoodSectionForOptions = getCalculateFoodSectionForOptions(
    glossary,
    basicFoodTagAssociation,
    unknownSectionName
  );

  return (
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
            option.foodId ? calculateFoodSectionForOptions(option.foodId) : null
          }
          isOptionEqualToValue={(optionA, optionB) =>
            optionA.foodId === optionB.foodId
          }
          getOptionDisabled={(option) =>
            ingredientsList && ingredientsList.includes(option.foodId)
          }
          value={ingredientsList.map((foodId) => ({
            foodId,
            title: glossary.basicFoods[foodId],
          }))}
          onChange={(event, selection) => {
            const newIngredientsList = selection.map((option) => option.foodId);
            updateIngredientsList(newIngredientsList);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ingredients"
              placeholder="Enter item"
            />
          )}
          ChipProps={{
            color: "secondary",
            variant: "outlined",
          }}
        />
      </Box>
    </Stack>
  );
}

export default BasicFoodMultiSelect;
