import { useState } from "react";
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

import CreateBasicFoodDialog from "./CreateBasicFoodDialog";

function BasicFoodMultiSelect(props) {
  const {
    glossary,
    basicFoodTagAssociation,
    basicFoodTagOrder,
    glossaryPath,
    basicFoodTagAssociationPath,
    ingredientsList,
    updateIngredientsList,
  } = props;

  const [openCreateBasicFoodDialog, setOpenCreateBasicFoodDialog] =
    useState(false);
  const [createBasicFood, setCreateBasicFood] = useState({});

  const handleInputSelection = (inputValue) => {
    setOpenCreateBasicFoodDialog(true);
    setCreateBasicFood({ name: inputValue });
  };

  const addIngredient = (foodId) => {
    updateIngredientsList(ingredientsList.concat(foodId));
  };

  const calculateFoodSectionForOptions = getCalculateFoodSectionForOptions(
    glossary,
    basicFoodTagAssociation,
    unknownSectionName
  );

  return (
    <>
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
              ingredientsList && ingredientsList.includes(option.foodId)
            }
            filterOptions={(options, params) => {
              const { inputValue, getOptionLabel } = params;
              const filtered = options.filter((option) =>
                getOptionLabel(option)
                  .toLocaleUpperCase()
                  .includes(inputValue.toUpperCase())
              );
              const isExisting = options.some(
                (option) => inputValue === option.title
              );
              if (inputValue !== "" && !isExisting) {
                filtered.push({
                  inputValue,
                  title: `Create "${inputValue}"`,
                });
              }
              return filtered;
            }}
            value={ingredientsList.map((foodId) => ({
              foodId,
              title: glossary.basicFoods[foodId],
            }))}
            onChange={(event, selection, reason, details) => {
              const inputValue =
                selection.length && selection.at(-1).inputValue;
              if (inputValue) {
                handleInputSelection(inputValue);
                return;
              }
              const newIngredientsList = selection.map(
                (option) => option.foodId
              );
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
      <CreateBasicFoodDialog
        open={openCreateBasicFoodDialog}
        createBasicFood={createBasicFood}
        setCreateBasicFood={setCreateBasicFood}
        handleSelectedFood={addIngredient}
        onClose={() => {
          setOpenCreateBasicFoodDialog(false);
          setCreateBasicFood({});
        }}
        glossary={glossary}
        basicFoodTagOrder={basicFoodTagOrder}
        glossaryPath={glossaryPath}
        basicFoodTagAssociationPath={basicFoodTagAssociationPath}
      />
    </>
  );
}

export default BasicFoodMultiSelect;
