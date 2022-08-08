import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";

import { createKey } from "../utils";

function Recipe(props) {
  const { glossary, cookbook = {}, readOnly } = props;

  const { recipeId: pathParam } = useParams();
  const [recipeId, setRecipeId] = useState();
  const [recipeEntry, setRecipeEntry] = useState({
    name: "",
    tags: [],
    instructions: [],
    ingredients: {},
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!glossary) {
      return;
    }

    if (pathParam === "create") {
      setIsEditing(true);
      setRecipeId(createKey("cookbook"));
    } else if (glossary.cookbook.hasOwnProperty(pathParam)) {
      setRecipeId(pathParam);
      setRecipeEntry({ ...recipeEntry, ...cookbook[pathParam] });
    }
  }, [pathParam, glossary, cookbook]);

  if (!glossary) {
    return null;
  }

  console.log(recipeId);
  console.log(isEditing);
  console.log(recipeEntry);

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
        {glossary.cookbook[recipeId]}
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
