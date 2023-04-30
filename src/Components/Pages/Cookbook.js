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
import StarIcon from "@mui/icons-material/Star";

import {
  addRecipeToShoppingList,
  removeRecipeFromMenuAndShoppingList,
  updateFromCookbookImport,
} from "../../utils/requests";
import {
  downloadData,
  transformRecipeForExport,
  transformCookbookFromImport,
} from "../../utils/dataTransfer";

import RecipeSearchInput from "../Utils/RecipeSearchInput";
import AdvancedFiltersDialogue from "../Utils/AdvancedFiltersDialogue";
import ImportFileButton from "../Utils/ImportFileButton";
import GenerateRecipeDialogue from "../Utils/GenerateRecipeDialogue";

import {
  DatabaseContext,
  DataPathsContext,
  AddAlertContext,
} from "../Contexts";

function Cookbook(props) {
  const {
    filteringOptions = {},
    setFilteringOptions,
    setAiGeneratedRecipe,
  } = props;
  const database = useContext(DatabaseContext);
  const addAlert = useContext(AddAlertContext);

  const {
    glossary: _glossary,
    cookbook: _cookbook,
    recipeOrder: _recipeOrder,
    shoppingList,
    menu: _menu,
    openAIKey,
  } = database;
  const glossary = _glossary || { basicFoods: {}, recipeTags: {} };
  const cookbook = _cookbook || {};
  const menu = _menu || {};
  const recipeOrder = _recipeOrder || [];

  const dataPaths = useContext(DataPathsContext);
  const { shoppingListPath, menuPath, glossaryPath, cookbookPath } = dataPaths;

  let navigate = useNavigate();

  const [openGenerateRecipeDialogue, setOpenGenerateRecipeDialogue] =
    useState(false);
  const [advancedFiltersDialogueOpen, setAdvancedFiltersDialogueOpen] =
    useState(false);
  const {
    searchTerm = "",
    ingredientsList = [],
    tagsList = [],
    isFavoriteFilter = false,
  } = filteringOptions;

  const handleImportedData = (importedCookbook) => {
    const transformedData = transformCookbookFromImport(
      importedCookbook,
      glossary,
      glossaryPath,
      cookbookPath
    );

    updateFromCookbookImport(transformedData, dataPaths, recipeOrder, addAlert);
  };

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
            color="secondary"
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
          <Stack spacing={3}>
            <Stack
              spacing={2}
              direction="row"
              justifyContent="space-around"
              alignItems="center"
            >
              <Button
                color="secondary"
                variant="outlined"
                size="large"
                sx={{ flex: 1 }}
                onClick={() => {
                  navigate(`/recipe/${recipeId}`);
                }}
              >
                <Typography color="secondary">View full recipe</Typography>
              </Button>
              <Button
                color="secondary"
                variant="outlined"
                size="large"
                sx={{ flex: 1 }}
                onClick={() => {
                  addRecipeToShoppingList(
                    ingredients,
                    recipeId,
                    { recipeOrder, menu },
                    dataPaths,
                    addAlert
                  );
                }}
              >
                <Typography>Add to shopping list</Typography>
              </Button>
            </Stack>
            {menu.hasOwnProperty(recipeId) && (
              <Button
                color="warning"
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
              {isFavorite && (
                <Chip
                  key={"favorite"}
                  label={
                    <StarIcon
                      sx={{
                        "&&": {
                          color: "alt.main",
                          verticalAlign: "bottom",
                        },
                      }}
                      fontSize="small"
                    />
                  }
                  size="small"
                  variant="outlined"
                  color="tertiary"
                />
              )}
              {tags.map((tagId) => (
                <Chip
                  key={tagId}
                  label={<Typography>{glossary.recipeTags[tagId]}</Typography>}
                  size="small"
                  variant="outlined"
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

  const renderNewRecipeButtons = () => (
    <Stack direction="row" sx={{ width: "100%" }} justifyContent="space-evenly">
      <Button
        disabled={!openAIKey}
        color="primary"
        variant="outlined"
        onClick={() => {
          setOpenGenerateRecipeDialogue(true);
        }}
      >
        <Typography>Generate Recipe with AI</Typography>
      </Button>
      <ImportFileButton
        onSuccess={(recipeData) => {
          handleImportedData({ recipe: recipeData });
        }}
        buttonProps={{ color: "secondary", variant: "outlined" }}
        buttonText="Import recipe"
        id="import-recipe"
      />
    </Stack>
  );

  const renderRecipeList = () => {
    if (!cookbook) {
      return null;
    }
    const recipeList = calculateRecipeList();
    if (!recipeList.length) {
      return (
        <Typography fontWeight="bold" color="white">
          Looks like there are no recipes.
        </Typography>
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
        variant="outlined"
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
        onSuccess={(cookbookData) => {
          handleImportedData(cookbookData);
        }}
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
        navigate(`/recipe/create`);
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
        {renderNewRecipeButtons()}
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
      <GenerateRecipeDialogue
        open={openGenerateRecipeDialogue}
        onClose={() => {
          setOpenGenerateRecipeDialogue(false);
        }}
        setAiGeneratedRecipe={setAiGeneratedRecipe}
      />
    </div>
  );
}

export default Cookbook;
