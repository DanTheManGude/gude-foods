import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDatabase, ref, child, get } from "firebase/database";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { transformCookbookFromImport } from "../../utils/dataTransfer";
import {
  updateFromCookbookImport,
  updateLastViewedSharedRecipe,
} from "../../utils/requests";
import { constructShareRecipePath } from "../../utils/utility";

import UnauthorizedUser from "../AppPieces/UnauthorizedUser";
import Loading from "../Utils/Loading";
import RecipeData from "../Utils/RecipeData";

import {
  UserContext,
  DatabaseContext,
  DataPathsContext,
  AddAlertContext,
} from "../Contexts";

function ShareRecipe(props) {
  const { isAuthorized, isAdmin, setActingUserByUid, accounts } = props;

  let navigate = useNavigate();
  const user = useContext(UserContext);
  const addAlert = useContext(AddAlertContext);

  const database = useContext(DatabaseContext);
  const { glossary: _glossary, recipeOrder: _recipeOrder } = database;
  const glossary = _glossary || { basicFoods: {}, recipeTags: {} };
  const recipeOrder = _recipeOrder || [];

  const dataPaths = useContext(DataPathsContext);
  const { glossaryPath, cookbookPath } = dataPaths;

  const { shareId } = useParams();
  const [recipe, setRecipe] = useState();
  const [recipeInfo, setRecipeInfo] = useState();
  const [isLoading, setIsLoading] = useState(Boolean(shareId));

  useEffect(() => {
    const recipeName = recipe && recipe.name;
    const searchName = new URLSearchParams(window.location.search).get("name");

    if (recipeName) {
      window.document.title = `${recipeName} - Gude Foods`;

      if (searchName && recipeName !== searchName) {
        const newPath = constructShareRecipePath(shareId, recipeName);
        navigate(newPath);
      }
    }

    return () => {
      window.document.title = "Gude Foods";
    };
  }, [recipe, shareId, navigate]);

  useEffect(() => {
    if (!shareId) {
      return;
    }

    get(child(ref(getDatabase()), `shared/${shareId}/recipeData`))
      .then((snapshot) => {
        const sharedRecipe = snapshot.exists() && snapshot.val();
        if (sharedRecipe) {
          setRecipe(sharedRecipe);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });

    get(child(ref(getDatabase()), `shared/${shareId}/info`))
      .then((snapshot) => {
        const sharedRecipeInfo = snapshot.exists() && snapshot.val();
        if (sharedRecipeInfo) {
          setRecipeInfo(sharedRecipeInfo);
        } else {
          updateLastViewedSharedRecipe(shareId);
        }
      })
      .catch(() => {
        updateLastViewedSharedRecipe(shareId);
      });
  }, [shareId, isAuthorized]);

  if (isLoading) {
    return <Loading />;
  }

  if (!recipe) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ paddingTop: 2 }}>
        <Typography variant="h6" color={"text.primary"}>
          It looks like there is no recipe being shared.
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            navigate("/");
          }}
        >
          <Typography>Go to home page</Typography>
        </Button>
      </Stack>
    );
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
    if (!isAuthorized) {
      return <UnauthorizedUser user={user} addAlert={addAlert} />;
    }

    if (recipeInfo && recipeInfo.userId === user.uid) {
      return (
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            navigate(`/recipe/${recipeInfo.recipeId}`);
          }}
          sx={{ width: "85%", marginTop: 1 }}
        >
          <Typography>View recipe in your cookbook</Typography>
        </Button>
      );
    }

    if (recipeInfo && isAdmin) {
      return (
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            setActingUserByUid(recipeInfo.userId);
            navigate(`/recipe/${recipeInfo.recipeId}`);
          }}
          sx={{ width: "85%", marginTop: 1 }}
        >
          <Typography>View recipe in their cookbook</Typography>
        </Button>
      );
    }

    return (
      <Button
        color="primary"
        variant="contained"
        onClick={handleSave}
        sx={{ width: "85%", marginTop: 1 }}
      >
        <Typography>Save recipe to cookbook</Typography>
      </Button>
    );
  };

  const renderInfo = () => {
    if (!recipeInfo || !accounts) {
      return null;
    }

    const { shareDate, userId, lastViewed } = recipeInfo;

    const lastViewedMessage = lastViewed
      ? `Last viewed: ${new Date(lastViewed).toLocaleString()}`
      : "Not viewed";

    const sharedDateMessage = `Shared on: ${new Date(
      shareDate
    ).toLocaleDateString()}`;

    const createdByMessage = `Created by: ${accounts[userId].name}`;

    return (
      <Card variant="outlined" sx={{ width: "95%" }}>
        <CardContent>
          <Typography key="details">
            {lastViewedMessage}
            <br />
            {sharedDateMessage}
            <br />
            {createdByMessage}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Stack spacing={2} alignItems="center" paddingTop={2}>
      {renderControls()}
      <RecipeData recipe={recipe} />
      {renderInfo()}
    </Stack>
  );
}

export default ShareRecipe;
