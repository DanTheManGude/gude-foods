import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Stack from "@mui/material/Stack";

import {
  renderEditingButtons,
  renderNameInput,
  renderNotesContainer,
  renderNotesInput,
  renderTagList,
  renderTagControls,
} from "../Utils/RecipeParts";
import InstructionList from "../Utils/InstructionList";

import { createKey, updateRequest } from "../../utils/requests";

function AiRecipe(props) {
  const {
    database: { recipeOrder: _recipeOrder, glossary },
    dataPaths: { cookbookPath, recipeOrderPath, glossaryPath },
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
  const [instructions, setInstructions] = useState(givenInstructions);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

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

  const getDeleteTagHandler = (removedTagId) => () => {
    setTags((oldTags) => oldTags.filter((tagId) => tagId !== removedTagId));
  };

  const addTag = (newTagId) => {
    setTags((oldTags) => oldTags.concat(newTagId));
  };

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
        {/* {renderIngredients()} */}
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
