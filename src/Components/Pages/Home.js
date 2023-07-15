import { Link, useNavigate } from "react-router-dom";
import { useContext, useMemo } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

import newUserData from "../../newUserData.json";
import {
  setAllData,
  removeUserFromRequestedUsers,
  approveRequestedUser,
} from "../../utils/requests";

import {
  AddAlertContext,
  DataPathsContext,
  DatabaseContext,
} from "../Contexts";

import ColorCard from "../Utils/ColorCard";

function Home(props) {
  const { requestedUsers, hasThemeSaved } = props;

  let navigate = useNavigate();
  const addAlert = useContext(AddAlertContext);
  const dataPaths = useContext(DataPathsContext);
  const database = useContext(DatabaseContext);
  const { glossary, basicFoodTagAssociation, shoppingList, cookbook, menu } =
    database;

  const renderThemeSettingsCard = () => {
    if (hasThemeSaved) {
      return null;
    }

    return <ColorCard />;
  };

  const renderRequestedUsersCard = () => {
    if (!requestedUsers) {
      return null;
    }

    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Requested Users
            </Typography>
            <Typography>There are users who requested access.</Typography>
            <Stack sx={{ paddingTop: "15px" }} spacing={3} alignItems="left">
              {Object.keys(requestedUsers).map((uid) => (
                <Stack
                  direction="row"
                  alignItems="flex-end"
                  spacing={2}
                  key={uid}
                >
                  <Typography fontSize={20}>{requestedUsers[uid]}:</Typography>
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() => removeUserFromRequestedUsers(uid)}
                  >
                    Reject
                  </Button>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => approveRequestedUser(uid)}
                  >
                    Accept
                  </Button>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderNewUserCard = () => {
    if (glossary) {
      return null;
    }

    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Welcome to Gude Foods
            </Typography>
            <Typography>
              Looks like you are a new user. To help get you going, there is
              starter data with some neat recipes.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                setAllData(newUserData, dataPaths, addAlert);
              }}
            >
              <Typography>Add starter data</Typography>
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  };

  const renderMenuCard = () => {
    let messageContent = null;

    if (menu) {
      const menuList = Object.keys(menu);
      const recipeId = menuList[Math.floor(Math.random() * menuList.length)];
      messageContent = (
        <>
          <Typography>
            There are <strong>{menuList.length}</strong> recipes on the menu.
          </Typography>
          <Typography>
            Checkout this one:&nbsp;
            <Link to={`/recipe/${recipeId}`}>
              <Typography variant="span" color="secondary">
                {cookbook[recipeId].name}{" "}
              </Typography>
            </Link>
          </Typography>
        </>
      );
    } else {
      messageContent = (
        <Typography>
          There are <strong>NO</strong> recipes on the menu.
        </Typography>
      );
    }

    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Menu
            </Typography>
            {messageContent}
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                navigate(`/cookbook`);
              }}
            >
              <Typography>Go to cookbook</Typography>
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  };

  const memoMenuCard = useMemo(renderMenuCard, [menu, cookbook, navigate]);

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
          color="primary"
          variant="outlined"
          onClick={() => {
            navigate(`/recipe/create`);
          }}
        >
          <Typography>Create a recipe</Typography>
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
            <strong>Ingredients:</strong>&nbsp;
            {Object.keys(ingredients)
              .map((foodId) => glossary.basicFoods[foodId])
              .join(", ")}
          </Typography>
          {(tags || isFavorite) && (
            <Typography>
              <strong>Tags:</strong>&nbsp;
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
          <Typography>Go to recipe</Typography>
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

  const memoRecipeCard = useMemo(renderRecipeCard, [
    cookbook,
    glossary,
    navigate,
  ]);

  const renderGlossaryCard = () => {
    const count =
      glossary &&
      glossary.basicFoods &&
      Object.keys(glossary.basicFoods).filter(
        (foodId) => !basicFoodTagAssociation || !basicFoodTagAssociation[foodId]
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
              color="primary"
              variant="outlined"
              onClick={() => {
                navigate(`/glossary`);
              }}
            >
              <Typography>Go to Glossary</Typography>
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
            There are <strong>{counts.unchecked} unchecked</strong> items on the
            list.
          </Typography>
          <Typography>
            There are <strong>{counts.checked} checked</strong> items on the
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
              color="primary"
              variant="outlined"
              onClick={() => {
                navigate(`/shoppingList`);
              }}
            >
              <Typography>Go to Shopping List</Typography>
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
              There are <strong>{count} recipes</strong> in the cookbook.
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
              <Typography>Go to Cookbook</Typography>
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
        {renderRequestedUsersCard()}
        {renderNewUserCard()}
        {renderThemeSettingsCard()}
        {memoMenuCard}
        {renderShoppingListCard()}
        {renderGlossaryCard()}
        {memoRecipeCard}
        {renderCookbookCard()}
      </Stack>
    </div>
  );
}

export default Home;
