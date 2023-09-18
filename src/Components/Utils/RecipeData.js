import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import InstructionList from "../Utils/InstructionList";
import IngredientList from "../Utils/IngredientList";
import { renderNotesContainer, renderTagList } from "../Utils/RecipeParts";

function RecipeData(props) {
  const { recipe } = props;

  const { name, description, ingredients, instructions = [], notes } = recipe;

  const renderTags = () => {
    const { tags = [], isFavorite = false } = recipe;

    const imatatedGlossaryRecipeTags = tags.reduce(
      (acc, tag) => ({ ...acc, [tag]: tag }),
      {}
    );
    return renderTagList(
      false,
      { tags, isFavorite },
      () => {},
      () => {},
      imatatedGlossaryRecipeTags
    );
  };

  return (
    <Stack key="contents" spacing={2} sx={{ width: "95%" }}>
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
      <IngredientList
        ingredients={ingredients}
        editable={false}
        idsAsNames={true}
      />
      <InstructionList instructions={instructions} editable={false} />
      {notes &&
        renderNotesContainer(
          <Typography style={{ whiteSpace: "pre-line" }}>{notes}</Typography>
        )}
      {renderTags()}
    </Stack>
  );
}

export default RecipeData;
