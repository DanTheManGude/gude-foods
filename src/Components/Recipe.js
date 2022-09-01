import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import { createKey } from "../utils";

function Recipe(props) {
  const { glossary, cookbook = {} } = props;

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
      setRecipeEntry((_recipeEntry) => ({
        ..._recipeEntry,
        ...cookbook[pathParam],
      }));
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

  return (
    <div>
      <Typography
        variant="h4"
        sx={{
          color: "primary.main",
          textAlign: "center",
        }}
      >
        {`${
          isEditing ? (isCreating ? "Creating new" : "Editing") : "Viewing"
        } recipe`}
      </Typography>
      <Stack
        sx={{ paddingTop: "15px" }}
        spacing={3}
        alignItems="center"
      ></Stack>
    </div>
  );
}

export default Recipe;
