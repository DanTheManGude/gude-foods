import { useState } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

import BasicFoodAutocomplete from "./BasicFoodAutocomplete";

import { waitForElm } from "../../utils/utility";

const getIngredientSorting =
  (basicFoodTagAssociation, basicFoodTagOrder) =>
  (ingredientIdA, ingredientIdB) => {
    if (!basicFoodTagAssociation || !basicFoodTagOrder) {
      return 0;
    }
    const tagA = basicFoodTagAssociation[ingredientIdA];
    const tagB = basicFoodTagAssociation[ingredientIdB];

    if (!tagA) {
      if (!tagB) {
        return 0;
      }
      return 1;
    }
    if (!tagB) {
      return -1;
    }

    const indexA = basicFoodTagOrder.indexOf(tagA);
    const indexB = basicFoodTagOrder.indexOf(tagB);

    return indexA - indexB;
  };

function IngredientList(props) {
  const {
    ingredients = {},
    editable,
    basicFoodTagAssociation,
    basicFoodTagOrder,
    glossary,
    basicFoodTagAssociationPath,
    glossaryPath,
    updateIngredients,
  } = props;

  const [newIngredientId, setNewIngredientId] = useState(null);

  const setIngredient = (ingredientId, value) => {
    updateIngredients((_ingredients) => ({
      ..._ingredients,
      [ingredientId]: value,
    }));
  };
  const addIngredient = (ingredientId) => {
    updateIngredients((_ingredients) => {
      return { ..._ingredients, [ingredientId]: "" };
    });

    waitForElm(`#${ingredientId}-amount-input`).then((elm) => {
      elm.focus();
    });
    setNewIngredientId(null);
  };
  const getRemoveIngredient = (ingredientId) => () => {
    updateIngredients((_ingredients) => {
      const { [ingredientId]: removedIngredient, ...restIngredients } =
        _ingredients;
      return restIngredients;
    });
  };

  const renderIngredientText = (ingredientId) => (
    <>
      <Typography sx={{ fontWeight: "bold" }}>
        {glossary.basicFoods[ingredientId]}:
      </Typography>
      <Typography>{ingredients[ingredientId]}</Typography>
    </>
  );

  const renderIngredientControl = (ingredientId) => (
    <>
      <Typography sx={{ fontWeight: "bold", minWidth: "130px" }}>
        {glossary.basicFoods[ingredientId]}:
      </Typography>
      <TextField
        id={`${ingredientId}-amount-input`}
        placeholder="Edit amount"
        value={ingredients[ingredientId]}
        onChange={(event) => {
          setIngredient(ingredientId, event.target.value);
        }}
        size="small"
        fullWidth={true}
        variant="outlined"
        inputProps={{
          autoCapitalize: "none",
        }}
      />
      <HighlightOffIcon
        color="secondary"
        onClick={getRemoveIngredient(ingredientId)}
      />
    </>
  );

  const renderItems = () =>
    Object.keys(ingredients)
      .sort(getIngredientSorting(basicFoodTagAssociation, basicFoodTagOrder))
      .map((ingredientId) => (
        <Stack
          key={ingredientId}
          direction="row"
          spacing={1}
          alignItems="center"
        >
          {editable
            ? renderIngredientControl(ingredientId)
            : renderIngredientText(ingredientId)}
        </Stack>
      ));

  const renderAddItemControl = () => (
    <Stack
      key={"addIngredient"}
      direction="row"
      spacing={2}
      alignItems="center"
    >
      <BasicFoodAutocomplete
        id="addIngredientSelect"
        foodMap={ingredients}
        newFoodId={newIngredientId}
        setNewFoodId={setNewIngredientId}
        extraProps={{ fullWidth: true }}
        glossary={glossary}
        basicFoodTagAssociation={basicFoodTagAssociation}
        basicFoodTagOrder={basicFoodTagOrder}
        glossaryPath={glossaryPath}
        basicFoodTagAssociationPath={basicFoodTagAssociationPath}
      />
      <Button
        id={`add-ingredient-button`}
        color="secondary"
        variant="outlined"
        size="small"
        onClick={() => addIngredient(newIngredientId)}
        disabled={!newIngredientId}
        sx={{ minWidth: "fit-content" }}
      >
        <Typography>Add item</Typography>
      </Button>
    </Stack>
  );

  return (
    <>
      <Accordion key={"ingredients"} sx={{ width: "100%" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Ingredients</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={editable ? 2 : 1}>
            {renderItems().concat(editable && renderAddItemControl())}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default IngredientList;
