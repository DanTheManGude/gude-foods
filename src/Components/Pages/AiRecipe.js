import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import {
  renderEditingButtons,
  renderNameInput,
  renderNotesContainer,
  renderNotesInput,
  renderTagList,
  renderTagControls,
} from "../Utils/RecipeParts";
import InstructionList from "../Utils/InstructionList";

import { saveRecipe } from "../../utils/requests";
import IngredientList from "../Utils/IngredientList";

function AiRecipe(props) {
  const {
    database: {
      recipeOrder: _recipeOrder,
      glossary,
      basicFoodTagAssociation,
      basicFoodTagOrder,
    },
    dataPaths: {
      cookbookPath,
      recipeOrderPath,
      glossaryPath,
      basicFoodTagAssociationPath,
    },
    addAlert,
    givenRecipe,
  } = props;
  const recipeOrder = _recipeOrder || [];

  const {
    name: givenName,
    ingredients: givenIngredients,
    instructions: givenInstructions,
    tags: givenTags,
    notes: givenNotes,
    ingredientText,
  } = givenRecipe;

  let navigate = useNavigate();

  const [name, setName] = useState(givenName);
  const [ingredients, setIngredients] = useState(givenIngredients);
  const [instructions, setInstructions] = useState(givenInstructions);
  const [notes, setNotes] = useState(givenNotes);
  const [tags, setTags] = useState(givenTags);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCancel = () => {
    navigate("/cookbook");
  };

  const handleSave = () => {
    saveRecipe(
      { name, ingredients, instructions, tags, isFavorite, notes },
      undefined,
      { cookbookPath, recipeOrderPath },
      recipeOrder,
      addAlert,
      () => {},
      navigate
    );
  };

  const getDeleteTagHandler = (removedTagId) => () => {
    setTags((oldTags) => oldTags.filter((tagId) => tagId !== removedTagId));
  };

  const addTag = (newTagId) => {
    setTags((oldTags) => oldTags.concat(newTagId));
  };

  const renderGivenInstructions = () => (
    <Box sx={{ width: "100%" }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
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

  const glossaryRecipeTags = (glossary && glossary.recipeTags) || [];

  return (
    <Stack
      sx={{ paddingTop: "15px", width: "100%" }}
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
      <Stack key="contents" spacing={2} sx={{ width: "95%", marginTop: 3 }}>
        {renderNameInput(name, setName, !name)}
        {renderGivenInstructions()}
        <IngredientList
          ingredients={ingredients}
          editable={true}
          basicFoodTagAssociation={basicFoodTagAssociation}
          basicFoodTagOrder={basicFoodTagOrder}
          glossary={glossary}
          basicFoodTagAssociationPath={basicFoodTagAssociationPath}
          glossaryPath={glossaryPath}
          updateIngredients={setIngredients}
        />
        <InstructionList
          instructions={instructions}
          setInstructions={setInstructions}
          editable={true}
        />
        {renderNotesContainer(renderNotesInput(notes, setNotes))}
        {renderTagList(
          true,
          { tags, isFavorite },
          setIsFavorite,
          getDeleteTagHandler,
          glossaryRecipeTags
        )}
        {renderTagControls(tags, addTag, glossaryRecipeTags, glossaryPath)}
      </Stack>
    </Stack>
  );
}

export default AiRecipe;
