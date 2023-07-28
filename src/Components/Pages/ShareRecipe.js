import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { UserContext } from "../Contexts";

function ShareRecipe(props) {
  const { isAuthorized } = props;

  let navigate = useNavigate();
  let location = useLocation();
  const user = useContext(UserContext);

  const [recipe, setRecipe] = useState();

  if (!recipe) {
    const { search } = location;
    const params = new URLSearchParams(search);
    const recipeData = params.get("recipeData");
    if (!recipeData) {
      return (
        <Stack alignItems="center" spacing={2} sx={{ paddingTop: 2 }}>
          <Typography variant="h6">
            It looks like there is no recipe being shared.
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              navigate("/");
            }}
          >
            Go to home page
          </Button>
        </Stack>
      );
    }

    const _recipe = JSON.parse(recipeData);
    setRecipe(_recipe);
    return null;
  }

  const renderControls = () => {
    console.log("isAuthorized:", isAuthorized);
    console.log("user:", user);
    return <></>;
  };

  const renderRecipeBody = () => {
    console.log("recipe:", recipe);
    return <></>;
  };

  return (
    <Stack sx={{ paddingTop: 2 }} spacing={1} alignItems="center">
      {renderControls()}
      {renderRecipeBody()}
    </Stack>
  );
}

export default ShareRecipe;
