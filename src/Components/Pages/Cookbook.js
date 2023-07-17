import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { removeRecipeFromMenuAndShoppingList } from "../../utils/requests";
import {
  downloadData,
  transformRecipeForExport,
} from "../../utils/dataTransfer";

import RecipeSearchInput from "../Utils/RecipeSearchInput";
import AdvancedFiltersDialogue from "../Utils/AdvancedFiltersDialogue";
import ImportFileButton from "../Utils/ImportFileButton";
import NewRecipeDialogue from "../Utils/NewRecipeDialogue";
import FavoriteTag from "../Utils/FavoriteTag";
import AddToShoppingListDialogue from "../Utils/AddToShoppingListDialogue";

import {
  DatabaseContext,
  DataPathsContext,
  AddAlertContext,
} from "../Contexts";

function Cookbook(props) {
  const {
    filteringOptions = {},
    setFilteringOptions,
    setExternalRecipe,
  } = props;
  const database = useContext(DatabaseContext);
  const addAlert = useContext(AddAlertContext);

  const {
    glossary: _glossary,
    cookbook: _cookbook,
    recipeOrder: _recipeOrder,
    shoppingList,
    menu: _menu,
  } = database;
  const glossary = _glossary || { basicFoods: {}, recipeTags: {} };
  const cookbook = _cookbook || {};
  const menu = _menu || {};
  const recipeOrder = _recipeOrder || [];

  const dataPaths = useContext(DataPathsContext);
  const { shoppingListPath, menuPath } = dataPaths;

  let navigate = useNavigate();

  const [addToShoppingListRecipeId, setAddToShoppingListRecipeId] =
    useState(null);
  const [openNewRecipeDialogue, setOpenNewRecipeDialogue] = useState(false);
  const [advancedFiltersDialogueOpen, setAdvancedFiltersDialogueOpen] =
    useState(false);
  const {
    searchTerm = "",
    ingredientsList = [],
    tagsList = [],
    isFavoriteFilter = false,
  } = filteringOptions;

  const calculateRecipeList = () => {
    const recipeList = recipeOrder.filter((recipeId) => {
      const { name, tags = [], isFavorite = false } = cookbook[recipeId];

      if (isFavoriteFilter && !isFavorite) {
        return false;
      }

      if (!name.toUpperCase().includes(searchTerm)) {
        return false;
      }

      if (!tagsList.every((tagId) => tags.includes(tagId))) {
        return false;
      }

      return true;
    });

    if (!ingredientsList.length) {
      return recipeList;
    }

    return recipeList
      .map((recipeId) => {
        const value = {
          recipeId,
          ingredientMatchCount: ingredientsList.filter((ingredientId) =>
            cookbook[recipeId].ingredients.hasOwnProperty(ingredientId)
          ).length,
        };
        return value;
      })
      .sort(
        (recipeEntryA, recipeEntryB) =>
          recipeEntryB.ingredientMatchCount - recipeEntryA.ingredientMatchCount
      )
      .filter((recipeEntry) => recipeEntry.ingredientMatchCount)
      .map((recipeEntry) => recipeEntry.recipeId);
  };

  const renderSearchAndFilters = () =>
    !cookbook ? null : (
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-around"
        alignItems="center"
        sx={{ width: "95%" }}
      >
        <RecipeSearchInput
          searchTerm={searchTerm}
          setSearchTerm={(_searchTerm) => {
            setFilteringOptions((_filteringOptions) => ({
              ..._filteringOptions,
              searchTerm: _searchTerm,
            }));
          }}
        />
        <Box sx={{ flexGrow: "3", maxWidth: "40%" }}>
          <Button
            color="primary"
            variant="outlined"
            sx={{ width: "100%" }}
            onClick={() => {
              setAdvancedFiltersDialogueOpen(true);
            }}
          >
            <Typography>
              <span>Advanced</span>
              <br />
              <span>Filters</span>
            </Typography>
          </Button>
        </Box>
      </Stack>
    );

  const renderRecipe = (recipeId) => {
    const {
      name = "Unknown name",
      description = "",
      ingredients = [],
      tags = [],
      isFavorite = false,
    } = cookbook[recipeId];

    return (
      <Accordion key={recipeId}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {description && (
              <Typography key="description" fontWeight="fontWeightMedium">
                {description}
              </Typography>
            )}
            <Stack
              spacing={2}
              direction="row"
              justifyContent="space-around"
              alignItems="center"
            >
              <Button
                color="secondary"
                variant="contained"
                size="large"
                sx={{ flex: 1 }}
                onClick={() => {
                  setAddToShoppingListRecipeId(recipeId);
                }}
              >
                <Typography>Add to shopping list</Typography>
              </Button>
              <Button
                color="primary"
                variant="contained"
                size="large"
                sx={{ flex: 1 }}
                onClick={() => {
                  navigate(`/recipe/${recipeId}`);
                }}
              >
                <Typography color="primary.contrastText">
                  View full recipe
                </Typography>
              </Button>
            </Stack>
            {menu.hasOwnProperty(recipeId) && (
              <Button
                color="secondary"
                variant="outlined"
                onClick={() => {
                  removeRecipeFromMenuAndShoppingList(
                    recipeId,
                    shoppingList,
                    { menuPath, shoppingListPath },
                    addAlert
                  );
                }}
              >
                <Typography>Remove recipe from Menu</Typography>
              </Button>
            )}
            <Stack direction="row" spacing={1}>
              {isFavorite && <FavoriteTag />}
              {tags.map((tagId) => (
                <Chip
                  key={tagId}
                  label={<Typography>{glossary.recipeTags[tagId]}</Typography>}
                  size="small"
                  variant="contained"
                  color="tertiary"
                />
              ))}
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderRecipeStack = (recipeList, forMenu = false) => (
    <Stack sx={{ width: "100%" }} spacing={1}>
      {recipeList
        .filter((recipeId) => Object.keys(menu).includes(recipeId) === forMenu)
        .map((recipeId) => {
          return renderRecipe(recipeId);
        })}
    </Stack>
  );

  const renderRecipeList = () => {
    if (!cookbook) {
      return null;
    }
    const recipeList = calculateRecipeList();
    if (!recipeList.length) {
      return (
        <Stack sx={{ width: "95%" }} spacing={2} alignItems="center">
          <Typography fontWeight="bold" color={"text.primary"}>
            {Object.keys(cookbook).length
              ? "Looks like no recipes match that search."
              : "There are no recipes in the cookbook."}
          </Typography>
          <Typography color={"text.primary"}>
            Need an idea for a recipe? Try generating one with AI.
          </Typography>
        </Stack>
      );
    }
    return (
      <Stack sx={{ width: "95%" }} spacing={0.5}>
        {recipeList.some((recipeId) => menu.hasOwnProperty(recipeId)) && (
          <Paper elevation={0} sx={{ paddingY: "10px", paddingX: "10px" }}>
            {renderRecipeStack(recipeList, true)}
          </Paper>
        )}
        {renderRecipeStack(recipeList, false)}
      </Stack>
    );
  };

  const renderImportExportCookbookButtons = () => (
    <Stack direction="row" sx={{ width: "100%" }} justifyContent="space-evenly">
      <Button
        color="secondary"
        variant="contained"
        onClick={() => {
          const cookbookData = Object.keys(cookbook).reduce((acc, recipeId) => {
            const recipeEntry = cookbook[recipeId];
            const recipeData = transformRecipeForExport(recipeEntry, glossary);

            return {
              ...acc,
              [recipeEntry.name]: recipeData,
            };
          }, {});

          downloadData(cookbookData, "cookbook");
        }}
      >
        <Typography>Export Cookbook</Typography>
      </Button>
      <ImportFileButton
        buttonProps={{ color: "secondary", variant: "outlined" }}
        buttonText="Import cookbook"
        id="import-cookbook"
      />
    </Stack>
  );

  const renderCreateRecipeButton = () => (
    <Fab
      color="primary"
      size="large"
      sx={{
        position: "fixed",
        bottom: "107px",
        right: "35px",
      }}
      onClick={() => {
        setOpenNewRecipeDialogue(true);
      }}
    >
      <AddIcon />
    </Fab>
  );

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
        Cookbook
      </Typography>
      <Stack sx={{ paddingTop: "15px" }} spacing={3} alignItems="center">
        {renderSearchAndFilters()}
        {renderRecipeList()}
        {renderImportExportCookbookButtons()}
      </Stack>
      {renderCreateRecipeButton()}
      <AdvancedFiltersDialogue
        open={advancedFiltersDialogueOpen}
        onClose={() => {
          setAdvancedFiltersDialogueOpen(false);
        }}
        filteringOptions={filteringOptions}
        setFilteringOptions={setFilteringOptions}
      />
      <NewRecipeDialogue
        open={openNewRecipeDialogue}
        onClose={() => {
          setOpenNewRecipeDialogue(false);
        }}
        filteringOptions={filteringOptions}
        setExternalRecipe={setExternalRecipe}
      />
      <AddToShoppingListDialogue
        open={!!addToShoppingListRecipeId}
        onClose={() => {
          setAddToShoppingListRecipeId(null);
        }}
        recipeId={addToShoppingListRecipeId}
      />
    </div>
  );
}

export default Cookbook;
