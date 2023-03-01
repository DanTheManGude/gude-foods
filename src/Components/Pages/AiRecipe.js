import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Stack from "@mui/material/Stack";

import {
  renderEditingButtons,
  renderNameInput,
  renderNotesContainer,
  renderNotesInput,
} from "../Utils/RecipeParts";

import { createKey, updateRequest } from "../../utils/requests";

function AiRecipe(props) {
  const {
    database: { recipeOrder: _recipeOrder },
    dataPaths: { cookbookPath, recipeOrderPath },
    addAlert,
    givenRecipe,
  } = props;
  const recipeOrder = _recipeOrder || [];

  const {
    name: givenName,
    ingredients: givenIngredients,
    instructions: givenInstructions,
  } = givenRecipe;

  let navigate = useNavigate();

  const [name, setName] = useState(givenName);
  const [notes, setNotes] = useState("");

  const handleCancel = () => {
    navigate("/cookbook");
  };

  const handleSave = () => {
    const recipe = { name, notes };
    const recipeId = createKey(cookbookPath);

    const updates = {
      [`${cookbookPath}/${recipeId}`]: recipe,
      [recipeOrderPath]: [recipeId, ...recipeOrder],
    };

    updateRequest(updates, addAlert);
  };

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
        {/* {renderIngredients()}
        {renderInstructions()} */}
        {renderNotesContainer(renderNotesInput(notes, setNotes))}
        {/* {renderTags()}  */}
      </Stack>
    </Stack>
  );
}

export default AiRecipe;
