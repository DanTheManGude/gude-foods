import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import { saveRecipe, updateFoodAndTagsFromImport } from "../../utils/requests";

import {
  renderEditingButtons,
  renderTagList,
  renderNotesContainer,
} from "../Utils/RecipeParts";
import InstructionList from "../Utils/InstructionList";
import IngredientList from "../Utils/IngredientList";

import {
  AddAlertContext,
  DataPathsContext,
  DatabaseContext,
  UserContext,
} from "../Contexts";

function ExternalRecipe(props) {
  const { givenRecipe, isAdmin } = props;

  const user = useContext(UserContext);
  const addAlert = useContext(AddAlertContext);
  const dataPaths = useContext(DataPathsContext);
  const { cookbookPath, recipeOrderPath, shoppingListPath, menuPath } =
    dataPaths;
  const database = useContext(DatabaseContext);
  const { recipeOrder: _recipeOrder, glossary, shoppingList } = database;

  const recipeOrder = _recipeOrder || [];
  const userDisplayName = user ? user.displayName : "";

  const { externalRecipe, newFoods = {}, newTags = {} } = givenRecipe;

  const {
    name,
    description = "",
    ingredients,
    instructions,
    tags,
    notes,
    ingredientText = [],
    supplementalIngredientInfo,
  } = externalRecipe;

  let navigate = useNavigate();

  const isFavorite = false;

  const handleCancel = () => {
    navigate("/cookbook");
  };

  const handleSave = () => {
    if (
      (newFoods && Object.keys(newFoods).length) ||
      (newTags && Object.keys(newTags).length)
    ) {
      updateFoodAndTagsFromImport({
        newFoods,
        newTags,
        glossaryPath: dataPaths.glossaryPath,
      });
    }

    saveRecipe(
      { name, ingredients, instructions, tags, isFavorite, notes, description },
      undefined,
      { cookbookPath, recipeOrderPath, shoppingListPath, menuPath },
      { recipeOrder, glossary, shoppingList },
      addAlert,
      () => {},
      navigate,
      undefined,
      { isAdmin, displayName: userDisplayName }
    );
  };

  const renderGivenIngredients = () => (
    <Box sx={{ width: "100%" }}>
      <Card variant="outlined">
        <CardContent>
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
            sx={{ fontStyle: "italic" }}
          >
            Given Ingredients
          </Typography>
          {ingredientText.map((ingredientLine, index) => (
            <Typography key={`ingredientLine-${index}`}>
              {ingredientLine}
            </Typography>
          ))}
        </CardContent>
      </Card>
    </Box>
  );

  const glossaryRecipeTags = {
    ...((glossary && glossary.recipeTags) || {}),
    ...Object.entries(newTags).reduce(
      (acc, [tagName, tagId]) => ({
        ...acc,
        [tagId]: tagName,
      }),
      {}
    ),
  };

  return (
    <Stack
      sx={{ paddingTop: 3, width: "100%" }}
      spacing={0}
      alignItems="center"
    >
      <Stack
        key="buttonControl"
        direction="row"
        justifyContent="space-around"
        alignItems="center"
        sx={{ width: "95%" }}
        spacing={2}
      >
        {renderEditingButtons(handleCancel, handleSave)}
      </Stack>
      <Stack key="contents" spacing={2} sx={{ width: "95%", marginTop: 2 }}>
        <Typography
          key="title"
          variant="h5"
          sx={{
            color: "primary.main",
            textAlign: "left",
            width: "100%",
            marginBottom: 1,
          }}
        >
          {name}
        </Typography>
        {description && (
          <Typography
            key="description"
            sx={{
              color: "text.primary",
              textAlign: "left",
              width: "100%",
              marginBottom: 1,
              fontWeight: "fontWeightMedium",
            }}
          >
            {description}
          </Typography>
        )}
        {ingredientText.length && renderGivenIngredients()}
        <IngredientList
          ingredients={ingredients}
          editable={false}
          supplementalIngredientInfo={supplementalIngredientInfo}
          additionalBasicFoods={Object.entries(newFoods).reduce(
            (acc, [foodName, foodId]) => ({
              ...acc,
              [foodId]: foodName,
            }),
            {}
          )}
        />
        <InstructionList instructions={instructions} editable={false} />
        {renderNotesContainer(
          <Typography style={{ whiteSpace: "pre-line" }}>{notes}</Typography>
        )}

        {renderTagList({
          editable: false,
          recipe: { tags, isFavorite },
          glossaryRecipeTags,
        })}
      </Stack>
    </Stack>
  );
}

export default ExternalRecipe;
