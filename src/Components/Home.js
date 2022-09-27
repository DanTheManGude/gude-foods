import { Link } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

function Home(props) {
  const { glossary, basicFoodTagAssociation, shoppingList, cookbook } = props;

  const renderRecipeCard = () => {
    let messageContent = null;
    let buttonContent = null;

    if (!cookbook) {
      messageContent = (
        <Typography>
          There are <strong>NO</strong> recipes in the cookbook.
        </Typography>
      );

      buttonContent = (
        <Link to={`/recipe/create`}>
          <Typography color="secondary">Create a recipe</Typography>
        </Link>
      );
    } else {
      const recipeList = Object.keys(cookbook);
      const recipeId =
        recipeList[Math.floor(Math.random() * recipeList.length)];

      const { name, ingredients, isFavorite, tags = [] } = cookbook[recipeId];

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

      buttonContent = (
        <Link to={`/recipe/${recipeId}`}>
          <Typography color="secondary">Go to recipe</Typography>
        </Link>
      );
    }

    return (
      <Box sx={{ width: "90%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Recipe
            </Typography>
            {messageContent}
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button color="secondary" variant="outlined">
              {buttonContent}
            </Button>
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
      <Box sx={{ width: "90%" }}>
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
            <Button color="secondary" variant="outlined">
              <Link to={`/glossary`}>
                <Typography color="secondary">Go to Glossary</Typography>
              </Link>
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
      <Box sx={{ width: "90%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Shopping List
            </Typography>
            {messageContent}
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button color="secondary" variant="outlined">
              <Link to={`/shoppingList`}>
                <Typography color="secondary">Go to Shopping List</Typography>
              </Link>
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
      <Box sx={{ width: "90%" }}>
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
            <Button color="secondary" variant="outlined">
              <Link to={`/cookbook`}>
                <Typography color="secondary">Go to Cookbook</Typography>
              </Link>
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
