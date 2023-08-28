import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDatabase, ref, child, get } from "firebase/database";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { transformCookbookFromImport } from "../../utils/dataTransfer";
import {
  updateFromCookbookImport,
  updateLastViewedSharedRecipe,
} from "../../utils/requests";

import UnauthorizedUser from "../AppPieces/UnauthorizedUser";
import Loading from "../Utils/Loading";
import InstructionList from "../Utils/InstructionList";
import IngredientList from "../Utils/IngredientList";
import { renderNotesContainer, renderTagList } from "../Utils/RecipeParts";

import {
  UserContext,
  DatabaseContext,
  DataPathsContext,
  AddAlertContext,
} from "../Contexts";

function ShareRecipe(props) {
  const { isAuthorized } = props;

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

    if (!isAuthorized) {
      return;
    }

    get(child(ref(getDatabase()), `shared/${shareId}/info`))
      .then((snapshot) => {
        const sharedRecipeInfo = snapshot.exists() && snapshot.val();
        if (sharedRecipeInfo) {
          setRecipeInfo(sharedRecipeInfo);
        }
      })
      .catch(() => {});
  }, [shareId]);

  useEffect(() => {
    if (!recipeInfo && shareId) {
      updateLastViewedSharedRecipe(shareId);
    }
  }, [recipeInfo, shareId]);

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
          Go to home page
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
          <Typography>View recipe in cookbook</Typography>
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

  const { name, description, ingredients, instructions = [], notes } = recipe;

  return (
    <Stack spacing={2} alignItems="center">
      {renderControls()}
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
    </Stack>
  );
}

export default ShareRecipe;
