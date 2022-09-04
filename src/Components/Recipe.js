import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import { createKey, updateRequest } from "../utils";

function Recipe(props) {
  const { glossary, cookbook = {}, updatePath, addAlert } = props;

  const { recipeId: pathParam } = useParams();
  const [recipeId, setRecipeId] = useState();
  const [recipeEntry, setRecipeEntry] = useState({
    name: "",
    tags: [],
    instructions: [],
    ingredients: {},
    isFavorited: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (pathParam === "create") {
      setIsEditing(true);
      setIsCreating(true);
      setRecipeId(createKey("cookbook"));
    } else if (cookbook.hasOwnProperty(pathParam)) {
      setRecipeId(pathParam);
      setRecipeEntry(cookbook[pathParam]);
    }
  }, [pathParam, cookbook]);

  if (!glossary) {
    return null;
  }

  if (!recipeId) {
    return (
      <Typography
        variant="h6"
        sx={{
          color: "primary.main",
          textAlign: "center",
        }}
      >
        Ope, recipe does not exist
      </Typography>
    );
  }

  const handleSaveRecipe = () => {
    const { name, instructions, ingredients } = recipeEntry;

    if (!(!!name.length && !!instructions.length && !!ingredients.length)) {
      addAlert({
        message: <span>Please fill out the required fields.</span>,
        alertProps: { severity: "warning" },
      });
      return;
    }

    updateRequest(
      { [`${updatePath}/${recipeId}`]: recipeEntry },
      (successAlert) => {
        addAlert(successAlert);
        setIsCreating(false);
        setIsEditing(false);
      },
      addAlert
    );
  };

  return (
    <div>
      <Stack
        sx={{ paddingTop: "15px", width: "100%" }}
        spacing={3}
        alignItems="center"
      >
        <Stack
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          sx={{ width: "95%" }}
          spacing={3}
        >
          <Button color="secondary" variant="outlined" size="small">
            <Link to={`/cookbook`}>
              <Typography color="secondary">Back to cookbook</Typography>
            </Link>
          </Button>
          {isEditing ? (
            <Button
              color="secondary"
              variant="outlined"
              size="small"
              onClick={handleSaveRecipe}
            >
              <Typography>Save recipe</Typography>
            </Button>
          ) : (
            <Button
              color="secondary"
              variant="outlined"
              size="small"
              onClick={() => {
                setIsEditing(true);
              }}
            >
              <Typography>Edit recipe</Typography>
            </Button>
          )}
        </Stack>
        <Typography
          variant="h4"
          sx={{
            color: "primary.main",
            textAlign: "center",
          }}
        >
          {`${
            isCreating ? "Creating new" : isEditing ? "Editing" : "Viewing"
          } recipe`}
        </Typography>
      </Stack>
    </div>
  );
}

export default Recipe;
