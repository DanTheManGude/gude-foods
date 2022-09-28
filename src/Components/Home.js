import { useNavigate } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

function Home(props) {
  const { glossary, basicFoodTagAssociation, shoppingList, cookbook } = props;
  let navigate = useNavigate();

  const renderRecipeCard = () => {
    let messageContent = null;
    let renderedButton = null;

    if (!cookbook) {
      messageContent = (
        <Typography>
          There are <strong>NO</strong> recipes in the cookbook.
        </Typography>
      );

      renderedButton = (
        <Button
          color="secondary"
          variant="outlined"
          onClick={() => {
            navigate(`/recipe/create`);
          }}
        >
          <Typography color="secondary">Create a recipe</Typography>
        </Button>
      );
    } else {
      const recipeList = Object.keys(cookbook);
      const recipeId =
        recipeList[Math.floor(Math.random() * recipeList.length)];

      const { name, ingredients, isFavorite, tags } = cookbook[recipeId];

      messageContent = (
        <>
          <Typography>
            Checkout this recipe <strong>{name}.</strong>
          </Typography>
          <Typography>
            Ingredients:&nbsp;
            {Object.keys(ingredients)
              .map((foodId) => glossary.basicFoods[foodId])
              .join(", ")}
          </Typography>
          {(tags || isFavorite) && (
            <Typography>
              Tags:&nbsp;
              {[
                ...(isFavorite ? ["favorite"] : []),
                ...(tags
                  ? tags.map((tagId) => glossary.recipeTags[tagId])
                  : []),
              ].join(", ")}
            </Typography>
          )}
        </>
      );

      renderedButton = (
        <Button
          color="secondary"
          variant="outlined"
          onClick={() => {
            navigate(`/recipe/${recipeId}`);
          }}
        >
          <Typography color="secondary">Go to recipe</Typography>
        </Button>
      );
    }

    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Recipe
            </Typography>
            {messageContent}
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            {renderedButton}
          </CardActions>
        </Card>
      </Box>
    );
  };

  const renderGlossaryCard = () => {
    const count =
      glossary &&
      glossary.basicFoods &&
      Object.keys(glossary.basicFoods).filter(
        (foodId) =>
          !basicFoodTagAssociation ||
          !basicFoodTagAssociation.hasOwnProperty(foodId)
      ).length;

    if (!count) {
      return null;
    }

    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Glossary
            </Typography>
            <Typography>
              There are <strong>{count}</strong> basic foods with no department.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              color="secondary"
              variant="outlined"
              onClick={() => {
                navigate(`/glossary`);
              }}
            >
              <Typography color="secondary">Go to Glossary</Typography>
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  };

  const renderShoppingListCard = () => {
    let messageContent = null;

    if (!!shoppingList) {
      const counts = Object.values(shoppingList).reduce(
        (acc, foodEntry) => {
          if (foodEntry.isChecked) {
            acc.checked = acc.checked + 1;
          } else {
            acc.unchecked = acc.unchecked + 1;
          }

          return acc;
        },
        { checked: 0, unchecked: 0 }
      );
      messageContent = (
        <>
          <Typography>
            There are <strong>{counts.unchecked}</strong> unchecked items on the
            list.
          </Typography>
          <Typography>
            There are <strong>{counts.checked}</strong> checked items on the
            list.
          </Typography>
        </>
      );
    } else {
      messageContent = (
        <Typography>There are no items in the shopping list.</Typography>
      );
    }

    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Shopping List
            </Typography>
            {messageContent}
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              color="secondary"
              variant="outlined"
              onClick={() => {
                navigate(`/shoppingList`);
              }}
            >
              <Typography color="secondary">Go to Shopping List</Typography>
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  };

  const renderCookbookCard = () => {
    const count = cookbook && Object.keys(cookbook).length;

    if (!count) {
      return null;
    }

    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Cookbook
            </Typography>
            <Typography>
              There are <strong>{count}</strong> recipes in the cookbook.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              color="secondary"
              variant="outlined"
              onClick={() => {
                navigate(`/cookbook`);
              }}
            >
              <Typography color="secondary">Go to Cookbook</Typography>
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  };

  return (
    <div>
      <Typography
        variant="h4"
        sx={{
          color: "primary.main",
          textAlign: "center",
          paddingY: 2,
        }}
      >
        Home
      </Typography>
      <Stack sx={{ paddingTop: "15px" }} spacing={3} alignItems="center">
        {renderRecipeCard()}
        {renderGlossaryCard()}
        {renderShoppingListCard()}
        {renderCookbookCard()}
      </Stack>
    </div>
  );
}

export default Home;
