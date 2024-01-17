import { useState, useContext } from "react";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import {
  getCalculateFoodSectionForOptions,
  constructBasicFoodOptions,
} from "../../utils/foods";
import { unknownSectionName } from "../../constants";
import { DatabaseContext } from "../Contexts";
import CreateBasicFoodDialog from "./Dialogs/CreateBasicFoodDialog";

function BasicFoodAutocomplete(props) {
  const { id, foodMap, newFoodId, setNewFoodId, extraProps } = props;
  const database = useContext(DatabaseContext);
  const { basicFoodTagAssociation, basicFoodTagOrder, glossary } = database;

  const [openCreateBasicFoodDialog, setOpenCreateBasicFoodDialog] =
    useState(false);
  const [createBasicFood, setCreateBasicFood] = useState({});

  const handleInputvalue = (inputValue) => {
    setOpenCreateBasicFoodDialog(true);
    setCreateBasicFood({ name: inputValue });
  };

  const calculateFoodSectionForOptions = getCalculateFoodSectionForOptions(
    glossary,
    basicFoodTagAssociation
  );

  return (
    <>
      <Autocomplete
        id={id}
        options={constructBasicFoodOptions(
          glossary,
          basicFoodTagOrder || [],
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
      <CreateBasicFoodDialog
        open={openCreateBasicFoodDialog}
        createBasicFood={createBasicFood}
        setCreateBasicFood={setCreateBasicFood}
        handleSelectedFood={setNewFoodId}
        onClose={() => {
          setOpenCreateBasicFoodDialog(false);
          setCreateBasicFood({});
        }}
      />
    </>
  );
}

export default BasicFoodAutocomplete;
