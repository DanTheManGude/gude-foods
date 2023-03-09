import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import {
  updateRequest,
  addRecipeToShoppingList,
  shoppingListDeletesByRecipe,
  saveRecipe,
} from "../../utils/requests";
import {
  downloadData,
  transformRecipeForExport,
} from "../../utils/dataTransfer";

import DeleteDialog from "../Utils/DeleteDialog";
import {
  renderEditingButtons,
  renderNameInput,
  renderNotesContainer,
  renderNotesInput,
  renderTagList,
  renderTagControls,
} from "../Utils/RecipeParts";
import InstructionList from "../Utils/InstructionList";
import IngredientList from "../Utils/IngredientList";

function Recipe(props) {
  const {
    database: {
      glossary: _glossary,
      basicFoodTagAssociation,
      cookbook: _cookbook,
      recipeOrder: _recipeOrder,
      shoppingList,
      basicFoodTagOrder,
      menu: _menu,
    },
    dataPaths: {
      cookbookPath,
      recipeOrderPath,
      shoppingListPath,
      glossaryPath,
      basicFoodTagAssociationPath,
      menuPath,
    },
    addAlert,
  } = props;
  const recipeOrder = _recipeOrder || [];
  const menu = _menu || {};
  const glossary = _glossary || {};

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
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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
  const updateIngredients = (setter) => {
    updateRecipe((_recipeEntry) => ({
      ingredients: setter(_recipeEntry.ingredients),
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
      { cookbookPath, recipeOrderPath },
      recipeOrder,
      addAlert,
      saveSuccessHandler,
      navigate
    );
  };

  const handleDelete = () => {
    const shoppingListDeletes = shoppingListDeletesByRecipe(
      recipeId,
      shoppingList,
      shoppingListPath
    );

    updateRequest(
      [
        `${cookbookPath}/${recipeId}`,
        `${menuPath}/${recipeId}`,
        ...shoppingListDeletes,
      ].reduce((acc, deletePath) => ({ ...acc, [deletePath]: null }), {
        [recipeOrderPath]: recipeOrder.filter(
          (_recipeId) => recipeId !== _recipeId
        ),
      }),
      (successAlert) => {
        addAlert(successAlert);
        navigate(`/cookbook`);
      },
      addAlert
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
              variant="outlined"
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
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ height: "50px", flexGrow: "1" }}
            onClick={() => {
              const recipeData = transformRecipeForExport(
                recipeEntry,
                glossary
              );

              downloadData(recipeData, recipeData.name);
            }}
          >
            <Typography>Export</Typography>
          </Button>
          <Button
            key="shoppingList"
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ height: "50px", flexGrow: "1" }}
            onClick={() => {
              addRecipeToShoppingList(
                originalRecipe.ingredients,
                recipeId,
                { recipeOrder, menu },
                { shoppingListPath, recipeOrderPath, menuPath },
                addAlert
              );
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
            color="success"
            variant="outlined"
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
        {renderTagList(
          isEditing,
          { tags, isFavorite },
          updateIsFavorite,
          getDeleteTag,
          glossaryRecipeTags
        )}

        {isEditing
          ? renderTagControls(tags, addTag, glossaryRecipeTags, glossaryPath)
          : null}
      </>
    );
  };

  return (
    <div>
      <Stack
        sx={{ paddingTop: "15px", width: "100%" }}
        spacing={0}
        alignItems="center"
      >
        {renderTopButtonControls()}
        <Stack key="contents" spacing={2} sx={{ width: "95%", marginTop: 3 }}>
          {renderName()}
          <IngredientList
            ingredients={recipeEntry.ingredients}
            editable={isEditing}
            basicFoodTagAssociation={basicFoodTagAssociation}
            basicFoodTagOrder={basicFoodTagOrder}
            glossary={glossary}
            basicFoodTagAssociationPath={basicFoodTagAssociationPath}
            glossaryPath={glossaryPath}
            updateIngredients={updateIngredients}
          />
          <InstructionList
            instructions={recipeEntry.instructions || []}
            setInstructions={updateInstructions}
            editable={isEditing}
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
    </div>
  );
}

export default Recipe;
