import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { transformCookbookFromImport } from "../../utils/dataTransfer";
import { updateFromCookbookImport } from "../../utils/requests";

import {
  UserContext,
  DatabaseContext,
  DataPathsContext,
  AddAlertContext,
} from "../Contexts";

function ShareRecipe(props) {
  const { isAuthorized } = props;

  let navigate = useNavigate();
  let location = useLocation();
  const user = useContext(UserContext);
  const addAlert = useContext(AddAlertContext);

  const database = useContext(DatabaseContext);
  const { glossary: _glossary, recipeOrder: _recipeOrder } = database;
  const glossary = _glossary || { basicFoods: {}, recipeTags: {} };
  const recipeOrder = _recipeOrder || [];

  const dataPaths = useContext(DataPathsContext);
  const { glossaryPath, cookbookPath } = dataPaths;

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

  const handleSave = () => {
    const transformedData = transformCookbookFromImport(
      { recipe },
      glossary,
      glossaryPath,
      cookbookPath
    );

    const updateHandler = (alert) => {
      navigate(`/recipe/${Object.keys(transformedData.formattedCookbook)[0]}`);
      addAlert(alert);
    };

    updateFromCookbookImport(
      transformedData,
      dataPaths,
      recipeOrder,
      updateHandler
    );
  };

  const renderControls = () => {
    console.log("isAuthorized:", isAuthorized);
    console.log("user:", user);
    if (isAuthorized) {
      return (
        <Button
          color="primary"
          variant="contained"
          onClick={handleSave}
          sx={{ width: "85%" }}
        >
          <Typography>Save recipe to cookbook</Typography>
        </Button>
      );
    }
  };

  const renderRecipeBody = () => {
    console.log("recipe:", recipe);
    return <></>;
  };

  return (
    <Stack sx={{ paddingTop: 2 }} spacing={2} alignItems="center">
      {renderControls()}
      {renderRecipeBody()}
    </Stack>
  );
}

export default ShareRecipe;
