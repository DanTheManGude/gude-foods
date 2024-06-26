import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import { deleteRecipe, saveRecipe } from "../../utils/requests";

import DeleteDialog from "../Utils/Dialogs/DeleteDialog";
import {
  renderEditingButtons,
  renderNameInput,
  renderDescriptionInput,
  renderNotesContainer,
  renderNotesInput,
  renderTagList,
  renderTagControls,
} from "../Utils/RecipeParts";
import InstructionList from "../Utils/InstructionList";
import IngredientList from "../Utils/IngredientList";
import AddToShoppingListDialog from "../Utils/Dialogs/AddToShoppingListDialog";
import ShareRecipeDialog from "../Utils/Dialogs/ShareRecipeDialog";

import {
  DatabaseContext,
  AddAlertContext,
  DataPathsContext,
  UserContext,
} from "../Contexts";

function Recipe(props) {
  const { isAdmin } = props;

  const user = useContext(UserContext);
  const addAlert = useContext(AddAlertContext);
  const dataPaths = useContext(DataPathsContext);
  const {
    cookbookPath,
    recipeOrderPath,
    shoppingListPath,
    glossaryPath,
    menuPath,
  } = dataPaths;
  const database = useContext(DatabaseContext);
  const {
    glossary: _glossary,
    cookbook: _cookbook,
    recipeOrder: _recipeOrder,
    shoppingList,
  } = database;

  const recipeOrder = _recipeOrder || [];
  const glossary = _glossary || {};
  const userDisplayName = user ? user.displayName : "";

  let navigate = useNavigate();
  const { recipeId: pathParam } = useParams();
  const [recipeId, setRecipeId] = useState();
  const [originalRecipe, setOriginalRecipe] = useState();
  const [recipeEntry, setRecipeEntry] = useState({
    name: "",
    tags: [],
    instructions: [],
    ingredients: {},
    isFavorite: false,
    notes: "",
    shareId: "",
    supplementalIngredientInfo: {},
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [addToShoppingListDialogOpen, setAddToShoppingListDialogOpen] =
    useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);

  useEffect(() => {
    const cookbook = _cookbook || {};

    if (pathParam === "create") {
      setIsEditing(true);
      setIsCreating(true);
    } else if (cookbook.hasOwnProperty(pathParam)) {
      const _originalRecipe = {
        ...{
          name: "",
          tags: [],
          instructions: [],
          ingredients: {},
          isFavorite: false,
          notes: "",
        },
        ...cookbook[pathParam],
      };
      setOriginalRecipe(_originalRecipe);
      setRecipeEntry(JSON.parse(JSON.stringify(_originalRecipe)));
      setRecipeId(pathParam);
    }
  }, [pathParam, _cookbook, cookbookPath]);

  const updateRecipe = (param) => {
    const setter = typeof param === "function" ? param : () => param;
    setRecipeEntry((_recipeEntry) => ({
      ..._recipeEntry,
      ...setter(_recipeEntry),
    }));
  };

  const updateName = (name) => {
    updateRecipe({ name });
  };
  const updateDescription = (description) => {
    updateRecipe({ description });
  };
  const updateIngredients = (setter) => {
    updateRecipe((_recipeEntry) => ({
      ingredients: setter(_recipeEntry.ingredients),
    }));
  };
  const updateSupplementalIngredientInfo = (setter) => {
    updateRecipe((_recipeEntry) => ({
      supplementalIngredientInfo: setter(
        _recipeEntry.supplementalIngredientInfo || {}
      ),
    }));
  };
  const updateInstructions = (setter) => {
    updateRecipe((_recipeEntry) => ({
      instructions: setter(_recipeEntry.instructions),
    }));
  };
  const updateNotes = (notes) => {
    updateRecipe({ notes });
  };
  const updateIsFavorite = (isFavorite) => {
    updateRecipe({ isFavorite });
  };
  const updateTags = (setter) => {
    updateRecipe((_recipeEntry) => ({ tags: setter(_recipeEntry.tags) }));
  };

  const getDeleteTag = (tagId) => () => {
    updateTags((_tags) => _tags.filter((tag) => tag !== tagId));
  };
  const addTag = (tagId) => {
    updateTags((_tags) => _tags.concat(tagId));
  };

  if (!recipeId && !isCreating) {
    return (
      <Typography
        variant="h6"
        sx={{
          color: "primary.main",
          textAlign: "center",
        }}
      >
        Ope, recipe does not exist
      </Typography>
    );
  }

  const handleCancel = () => {
    if (isCreating) {
      navigate("/cookbook");
    } else {
      setRecipeEntry(JSON.parse(JSON.stringify(originalRecipe)));
      setIsEditing(false);
    }
  };

  const saveSuccessHandler = () => {
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleSave = () => {
    saveRecipe(
      recipeEntry,
      recipeId,
      { cookbookPath, recipeOrderPath, shoppingListPath, menuPath },
      { recipeOrder, glossary, shoppingList },
      addAlert,
      saveSuccessHandler,
      navigate,
      originalRecipe,
      { isAdmin, displayName: userDisplayName }
    );
  };

  const handleDelete = () => {
    deleteRecipe(
      recipeId,
      { shoppingList, recipeOrder, glossary },
      { shoppingListPath, cookbookPath, menuPath, recipeOrderPath },
      addAlert,
      navigate,
      recipeEntry
    );
  };

  const renderTopButtonControls = () => (
    <Stack
      key="buttonControl"
      direction="row"
      justifyContent="space-around"
      alignItems="center"
      sx={{ width: "95%" }}
      spacing={2}
    >
      {isEditing ? (
        <>
          {!isCreating && (
            <Button
              key="delete"
              color="error"
              variant="contained"
              size="small"
              sx={{ flexGrow: "1" }}
              onClick={() => {
                setOpenDeleteDialog(true);
              }}
            >
              <Typography>Delete</Typography>
            </Button>
          )}
          {renderEditingButtons(handleCancel, handleSave)}
        </>
      ) : (
        <>
          <Button
            key="export"
            color="primary"
            variant="outlined"
            size="small"
            sx={{ height: "50px", flexGrow: "1" }}
            onClick={() => {
              setOpenShareDialog(true);
            }}
          >
            <Typography>Share</Typography>
          </Button>
          <Button
            key="shoppingList"
            color="primary"
            variant="contained"
            size="small"
            sx={{ height: "50px", flexGrow: "1" }}
            onClick={() => {
              setAddToShoppingListDialogOpen(true);
            }}
          >
            <Typography>
              <span>Add to</span>
              <br />
              <span>shopping list</span>
            </Typography>
          </Button>
          <Button
            key="edit"
            color="secondary"
            variant="contained"
            size="small"
            sx={{ height: "50px", flexGrow: "1" }}
            onClick={() => {
              setIsEditing(true);
            }}
          >
            <Typography>Edit</Typography>
          </Button>
        </>
      )}
    </Stack>
  );

  const renderName = () => {
    const { name = "" } = recipeEntry;

    if (isEditing) {
      const error = !isCreating && !name.length;
      return renderNameInput(name, updateName, error);
    }

    return (
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
    );
  };

  const renderDescription = () => {
    const { description = "" } = recipeEntry;

    if (isEditing) {
      return renderDescriptionInput(description, updateDescription);
    }

    if (!description) {
      return null;
    }

    return (
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
    );
  };

  const renderNotes = () => {
    const { notes = "" } = recipeEntry;

    if (!notes.length && !isEditing) {
      return null;
    }

    const contents = isEditing ? (
      renderNotesInput(notes, updateNotes)
    ) : (
      <Typography style={{ whiteSpace: "pre-line" }}>{notes}</Typography>
    );

    return renderNotesContainer(contents);
  };

  const renderTags = () => {
    const { tags = [], isFavorite = false } = recipeEntry;

    const glossaryRecipeTags = glossary.recipeTags || [];
    return (
      <>
        {renderTagList({
          editable: isEditing,
          recipe: { tags, isFavorite },
          updateIsFavorite,
          getDeleteTagHandler: getDeleteTag,
          glossaryRecipeTags,
        })}

        {isEditing
          ? renderTagControls(tags, addTag, glossaryRecipeTags, glossaryPath)
          : null}
      </>
    );
  };

  return (
    <div>
      <Stack
        sx={{ paddingTop: 3, width: "100%" }}
        spacing={0}
        alignItems="center"
      >
        {renderTopButtonControls()}
        <Stack key="contents" spacing={2} sx={{ width: "95%", marginTop: 2 }}>
          {renderName()}
          {renderDescription()}
          <IngredientList
            ingredients={recipeEntry.ingredients}
            supplementalIngredientInfo={recipeEntry.supplementalIngredientInfo}
            editable={isEditing}
            updateIngredients={updateIngredients}
            updateSupplementalIngredientInfo={updateSupplementalIngredientInfo}
          />
          <InstructionList
            instructions={recipeEntry.instructions || []}
            setInstructions={updateInstructions}
            editable={isEditing}
            recipeId={recipeId}
          />
          {renderNotes()}
          {renderTags()}
        </Stack>
      </Stack>
      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
        }}
        titleDO="recipe"
        comfirmationMessageDO={`"${recipeEntry.name}"`}
        handleDelete={handleDelete}
      />
      <AddToShoppingListDialog
        open={addToShoppingListDialogOpen}
        onClose={() => {
          setAddToShoppingListDialogOpen(false);
        }}
        recipeId={addToShoppingListDialogOpen && recipeId}
      />
      <ShareRecipeDialog
        open={openShareDialog}
        onClose={() => {
          setOpenShareDialog(false);
        }}
        recipe={recipeEntry}
        recipeId={recipeId}
      />
    </div>
  );
}

export default Recipe;
