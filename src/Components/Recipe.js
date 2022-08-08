import { useParams } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";

function Recipe(props) {
  const { glossary, readOnly } = props;
  const { recipeId } = useParams();

  if (!glossary) {
    return null;
  }

  const doesRecipeExist = glossary.cookbook.hasOwnProperty(recipeId);
  if (!doesRecipeExist) {
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
