import { useState, useContext } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowDropDownCircleOutlinedIcon from "@mui/icons-material/ArrowDropDownCircleOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

import {
  BasicFoodTagAssociation,
  BasicFoodTagOrder,
  Ingredients,
  SupplementalIngredientInfo,
} from "../../types";
import { waitForElm } from "../../utils/utility";
import { DatabaseContext } from "../Contexts";
import BasicFoodAutocomplete from "./BasicFoodAutocomplete";

const getIngredientSorting =
  (
    basicFoodTagAssociation: BasicFoodTagAssociation,
    basicFoodTagOrder: BasicFoodTagOrder
  ) =>
  (ingredientIdA: string, ingredientIdB: string): number => {
    if (!basicFoodTagAssociation || !basicFoodTagOrder) {
      return 0;
    }
    const tagA = basicFoodTagAssociation[ingredientIdA];
    const tagB = basicFoodTagAssociation[ingredientIdB];

    if (!tagA) {
      if (!tagB) {
        return 0;
      }
      return 1;
    }
    if (!tagB) {
      return -1;
    }

    const indexA = basicFoodTagOrder.indexOf(tagA);
    const indexB = basicFoodTagOrder.indexOf(tagB);

    return indexA - indexB;
  };

function IngredientList(props: {
  ingredients: Ingredients;
  supplementalIngredientInfo?: SupplementalIngredientInfo;
  editable: boolean;
  updateIngredients: (
    setter: (newIngredients: Ingredients) => Ingredients
  ) => void;
  updateSupplementalIngredientInfo: (
    setter: (
      newSupplementalIngredientInfo: SupplementalIngredientInfo
    ) => SupplementalIngredientInfo
  ) => void;
  isForShoppingList: boolean;
  idsAsNames: boolean;
}) {
  const {
    ingredients = {},
    supplementalIngredientInfo: _supplementalIngredientInfo,
    editable,
    updateIngredients,
    updateSupplementalIngredientInfo,
    isForShoppingList = false,
    idsAsNames = false,
  } = props;
  const supplementalIngredientInfo = _supplementalIngredientInfo || {};

  const database = useContext(DatabaseContext);
  const { basicFoodTagAssociation, basicFoodTagOrder, glossary } = database;

  const [newIngredientId, setNewIngredientId] = useState<null | string>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIngredientId, setMenuIngredientId] = useState<null | string>(null);

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuIngredientId(null);
  };

  const setIngredient = (ingredientId: string, value: string) => {
    updateIngredients((_ingredients: Ingredients) => ({
      ..._ingredients,
      [ingredientId]: value,
    }));
  };

  const addIngredient = (ingredientId: string) => {
    updateIngredients((_ingredients) => {
      return { ..._ingredients, [ingredientId]: "" };
    });

    waitForElm(`#${ingredientId}-amount-input`).then((elm) => {
      elm.focus();
    });
    setNewIngredientId(null);
  };

  const removeIngredient = (ingredientId: string) => {
    updateIngredients((_ingredients) => {
      const { [ingredientId]: removedIngredient, ...restIngredients } =
        _ingredients;
      return restIngredients;
    });
    updateSupplementalIngredientInfo(
      (_supplementalIngredientInfo: SupplementalIngredientInfo) => {
        const { [ingredientId]: removedInfo, ...restInfo } =
          _supplementalIngredientInfo;
        return restInfo;
      }
    );
  };

  const getRemoveIngredient = (ingredientId: string) => () =>
    removeIngredient(ingredientId);

  const getSetOptional = (newOptional: boolean) => (ingredientId: string) => {
    updateSupplementalIngredientInfo(
      (_supplementalIngredientInfo: SupplementalIngredientInfo) => {
        const existingInfo = _supplementalIngredientInfo[ingredientId] || {};

        return {
          ..._supplementalIngredientInfo,
          [ingredientId]: { ...existingInfo, isOptional: newOptional },
        };
      }
    );
  };

  const removeSubstitution = (ingredientId: string) => {
    updateSupplementalIngredientInfo(
      (_supplementalIngredientInfo: SupplementalIngredientInfo) => {
        const { substitution, ...existingInfo } =
          _supplementalIngredientInfo[ingredientId] || {};

        return {
          ..._supplementalIngredientInfo,
          [ingredientId]: existingInfo,
        };
      }
    );
  };

  const swapSubstitution = (ingredientId: string) => {
    updateSupplementalIngredientInfo(
      (_supplementalIngredientInfo: SupplementalIngredientInfo) => {
        const {
          substitution: { foodId, amount },
          ...existingInfo
        } = _supplementalIngredientInfo[ingredientId] || {};

        updateIngredients((_ingredients) => {
          const { [ingredientId]: removedIngredient, ...restIngredients } =
            _ingredients;
          return { ...restIngredients, [foodId]: amount };
        });

        return {
          ..._supplementalIngredientInfo,
          [ingredientId]: {
            ...existingInfo,
            substitution: {
              foodId: menuIngredientId,
              amount: ingredients[menuIngredientId],
            },
          },
        };
      }
    );
  };

  const addSubstitution = (ingredientId: string) => {};

  const renderIngredientText = (foodId: string) => (
    <>
      <Typography sx={{ fontWeight: "bold" }}>
        {idsAsNames ? foodId : glossary.basicFoods[foodId]}:
      </Typography>
      <Typography>{ingredients[foodId]}</Typography>
    </>
  );

  const renderIngredientControl = (ingredientId: string) => {
    const shouldUseMenu =
      !isForShoppingList || supplementalIngredientInfo[ingredientId];

    return (
      <>
        <Typography sx={{ fontWeight: "bold", minWidth: "130px" }}>
          {glossary.basicFoods[ingredientId]}:
        </Typography>
        <TextField
          id={`${ingredientId}-amount-input`}
          placeholder="Edit amount"
          value={ingredients[ingredientId]}
          onChange={(event) => setIngredient(ingredientId, event.target.value)}
          size="small"
          fullWidth={true}
          variant="outlined"
          inputProps={{ autoCapitalize: "none" }}
        />
        <IconButton
          onClick={
            shouldUseMenu
              ? (event: React.MouseEvent<HTMLButtonElement>) => {
                  setMenuIngredientId(ingredientId);
                  setMenuAnchorEl(event.currentTarget);
                }
              : getRemoveIngredient(ingredientId)
          }
          color="secondary"
        >
          {shouldUseMenu ? (
            <ArrowDropDownCircleOutlinedIcon />
          ) : (
            <HighlightOffIcon />
          )}
        </IconButton>
      </>
    );
  };

  const renderItems = () =>
    Object.keys(ingredients)
      .sort(getIngredientSorting(basicFoodTagAssociation, basicFoodTagOrder))
      .map((ingredientId) => (
        <Stack
          key={ingredientId}
          direction="row"
          spacing={1}
          alignItems="center"
        >
          {editable
            ? renderIngredientControl(ingredientId)
            : renderIngredientText(ingredientId)}
        </Stack>
      ));

  const renderAddItemControl = () => (
    <Stack
      key={"addIngredient"}
      direction="row"
      spacing={2}
      alignItems="center"
    >
      <BasicFoodAutocomplete
        id="addIngredientSelect"
        foodMap={ingredients}
        newFoodId={newIngredientId}
        setNewFoodId={setNewIngredientId}
        extraProps={{ fullWidth: true }}
      />
      <Button
        id={`add-ingredient-button`}
        color="primary"
        variant="contained"
        size="small"
        onClick={() => addIngredient(newIngredientId)}
        disabled={!newIngredientId}
        sx={{ minWidth: "fit-content" }}
      >
        <Typography>Add item</Typography>
      </Button>
    </Stack>
  );

  const withCloseMenu = (handler: (inredientId: string) => void) => () => {
    handler(menuIngredientId);
    handleCloseMenu();
  };
  const renderMenu = () => {
    const { isOptional, substitution } =
      supplementalIngredientInfo[menuIngredientId] || {};

    return (
      <Menu
        id="ingredient-menu"
        anchorEl={menuAnchorEl}
        open={!!menuAnchorEl && !!menuIngredientId}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={withCloseMenu(getRemoveIngredient)}>Remove</MenuItem>

        {isOptional ? (
          <MenuItem onClick={withCloseMenu(getSetOptional(false))}>
            Make not optional
          </MenuItem>
        ) : (
          !isForShoppingList && (
            <MenuItem onClick={withCloseMenu(getSetOptional(true))}>
              Make optional
            </MenuItem>
          )
        )}

        {substitution ? (
          <>
            <MenuItem onClick={withCloseMenu(removeSubstitution)}>
              Remove substitution
            </MenuItem>
            <MenuItem onClick={withCloseMenu(swapSubstitution)}>
              Swap substitution
            </MenuItem>
          </>
        ) : (
          !isForShoppingList && (
            <MenuItem onClick={withCloseMenu(addSubstitution)}>
              Add substitution
            </MenuItem>
          )
        )}
      </Menu>
    );
  };
  const renderContents = () => (
    <>
      <Stack spacing={editable ? 2 : 1}>
        {renderItems().concat(editable && renderAddItemControl())}
      </Stack>
      {renderMenu()}
    </>
  );

  if (isForShoppingList) {
    return renderContents();
  }

  return (
    <>
      <Accordion key={"ingredients"} sx={{ width: "100%" }}>
        <AccordionSummary
          expandIcon={
            <IconButton>
              <ExpandMoreIcon />
            </IconButton>
          }
        >
          <Typography variant="h6">Ingredients</Typography>
        </AccordionSummary>
        <AccordionDetails>{renderContents()}</AccordionDetails>
      </Accordion>
    </>
  );
}

export default IngredientList;
