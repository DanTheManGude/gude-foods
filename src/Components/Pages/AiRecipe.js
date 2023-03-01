import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { renderNameInput } from "../Utils/RecipeParts";

function AiRecipe(props) {
  const { database, dataPaths, addAlert, givenRecipe } = props;

  const {
    name: givenName,
    ingredients: givenIngredients,
    instructions: givenInstructions,
  } = givenRecipe;

  const [name, setName] = useState(givenName);

  return (
    <Stack
      sx={{ paddingTop: "15px", width: "100%" }}
      spacing={0}
      alignItems="center"
    >
      {/* {renderTopButtonControls()} */}
      <Stack key="contents" spacing={2} sx={{ width: "95%", marginTop: 3 }}>
        {renderNameInput(name, setName, !name)}
        {/* {renderIngredients()}
        {renderInstructions()}
        {renderNotes()}
        {renderTags()} */}
      </Stack>
    </Stack>
  );
}

export default AiRecipe;
