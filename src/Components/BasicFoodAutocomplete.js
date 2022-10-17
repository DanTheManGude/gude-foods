import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import {
  getCalculateFoodSectionForOptions,
  constructBasicFoodOptions,
} from "../utils";

import { unknownSectionName } from "../constants";

function BasicFoodAutocomplete(props) {
  const {
    id,
    foodMap,
    newFoodId,
    setNewFoodId,
    handleInputvalue,
    extraProps,
    glossary,
    basicFoodTagAssociation,
    basicFoodTagOrder,
  } = props;

  const calculateFoodSectionForOptions = getCalculateFoodSectionForOptions(
    glossary,
    basicFoodTagAssociation,
    unknownSectionName
  );

  return (
    <Autocomplete
      id={id}
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
        foodMap && foodMap.hasOwnProperty(option.foodId)
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
      value={
        newFoodId && {
          foodId: newFoodId,
          title: glossary.basicFoods[newFoodId],
        }
      }
      onChange={(event, selectedOption = {}) => {
        if (!selectedOption) {
          setNewFoodId(null);
          return;
        }

        const { foodId, inputValue } = selectedOption;

        if (inputValue) {
          handleInputvalue(inputValue);
        } else {
          setNewFoodId(foodId);
        }
      }}
      renderInput={(params) => (
        <TextField {...params} label="Enter item" size="small" />
      )}
      {...extraProps}
    />
  );
}

export default BasicFoodAutocomplete;
