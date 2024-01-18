import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";

import { removeRecipeFromMenuAndShoppingList } from "../../utils/requests";
import {
  downloadData,
  transformCookbookForExport,
} from "../../utils/dataTransfer";

import RecipeSearchInput from "../Utils/RecipeSearchInput";
import AdvancedFiltersDialog from "../Utils/Dialogs/AdvancedFiltersDialog";
import ImportFileButton from "../Utils/ImportFileButton";
import NewRecipeDialog from "../Utils/Dialogs/NewRecipeDialog";
import AddToShoppingListDialog from "../Utils/Dialogs/AddToShoppingListDialog";

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
  const [openNewRecipeDialog, setOpenNewRecipeDialog] = useState("");
  const [advancedFiltersDialogOpen, setAdvancedFiltersDialogOpen] =
    useState(false);
  const {
    searchTerm = "",
    ingredientsList = [],
    tagsList = [],
    isFavoriteFilter = false,
  } = filteringOptions;

  const handleBookmarkClick = (recipeId) => {
    if (menu.hasOwnProperty(recipeId)) {
      removeRecipeFromMenuAndShoppingList(
        recipeId,
        { shoppingList, cookbook, menu },
        { menuPath, shoppingListPath },
        addAlert
      );
    } else {
      setAddToShoppingListRecipeId(recipeId);
    }
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
            color="primary"
            variant="outlined"
            sx={{ width: "100%" }}
            onClick={() => {
              setAdvancedFiltersDialogOpen(true);
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

  const renderRecipe = (recipeId, forMenu = false) => {
    return (
      <Paper
        key={recipeId}
        elevation={2}
        onClick={() => {
          navigate(`/recipe/${recipeId}`);
        }}
      >
        <Stack
          direction={"row"}
          sx={{ margin: 1.5 }}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" sx={{ cursor: "pointer" }}>
            {cookbook[recipeId].name || "Unknown name"}
          </Typography>
          <IconButton
            color="secondary"
            onClick={(event) => {
              handleBookmarkClick(recipeId);
              event.stopPropagation();
            }}
          >
            {forMenu ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        </Stack>
      </Paper>
    );
  };

  const renderRecipeStack = (recipeList, forMenu = false) => (
    <Stack sx={{ width: "100%" }} spacing={1}>
      {recipeList
        .filter((recipeId) => Object.keys(menu).includes(recipeId) === forMenu)
        .map((recipeId) => {
          return renderRecipe(recipeId, forMenu);
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
          <Stack direction="row">
            <Typography color={"text.primary"}>
              Need an idea for a recipe?
            </Typography>
            &nbsp;&nbsp;
            <Link
              component="button"
              onClick={() => {
                setOpenNewRecipeDialog("GenerateRecipe");
              }}
            >
              <Typography>Try generating one with AI.</Typography>
            </Link>
          </Stack>
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
          const cookbookData = transformCookbookForExport({
            cookbook,
            glossary,
          });

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
        bottom: { xs: "107px", md: "20px" },
        right: "35px",
      }}
      onClick={() => {
        setOpenNewRecipeDialog("OPEN");
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
      <AdvancedFiltersDialog
        open={advancedFiltersDialogOpen}
        onClose={() => {
          setAdvancedFiltersDialogOpen(false);
        }}
        filteringOptions={filteringOptions}
        setFilteringOptions={setFilteringOptions}
      />
      <NewRecipeDialog
        open={openNewRecipeDialog}
        onClose={() => {
          setOpenNewRecipeDialog("");
        }}
        filteringOptions={filteringOptions}
        setExternalRecipe={setExternalRecipe}
      />
      <AddToShoppingListDialog
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
