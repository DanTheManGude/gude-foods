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
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SubdirectoryArrowRightOutlinedIcon from "@mui/icons-material/SubdirectoryArrowRightOutlined";

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
    supplementalIngredientInfo: __supplementalIngredientInfo,
    editable,
    updateIngredients,
    updateSupplementalIngredientInfo,
    isForShoppingList = false,
    idsAsNames = false,
  } = props;
  const supplementalIngredientInfo = __supplementalIngredientInfo || {};

  const database = useContext(DatabaseContext);
  const { basicFoodTagAssociation, basicFoodTagOrder, glossary } = database;

  const [newIngredientId, setNewIngredientId] = useState<string>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>(null);
  const [menuIngredientId, setMenuIngredientId] = useState<string>(null);
  const [addingSubstitution, setAddingSubstitution] = useState<string>(null);
  const [newSubstitutionFoodId, setNewSubstitutionFoodId] =
    useState<string>(null);

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
    const originalIngredinetAmount = ingredients[ingredientId];
    const originalSubstitution =
      supplementalIngredientInfo[ingredientId].substitution;

    updateIngredients((_ingredients) => {
      const { [ingredientId]: removedIngredient, ...restIngredients } =
        _ingredients;

      return {
        ...restIngredients,
        [originalSubstitution.foodId]: originalSubstitution.amount,
      };
    });

    updateSupplementalIngredientInfo(
      (_supplementalIngredientInfo: SupplementalIngredientInfo) => {
        const { substitution, ...existingInfo } =
          _supplementalIngredientInfo[ingredientId] || {};

        return {
          ..._supplementalIngredientInfo,
          [originalSubstitution.foodId]: {
            ...existingInfo,
            substitution: {
              foodId: ingredientId,
              amount: originalIngredinetAmount,
            },
          },
        };
      }
    );
  };

  const addSubstitutionControls = (ingredientId: string) => {
    setNewIngredientId(null);
    setAddingSubstitution(ingredientId);
  };

  const getAddSubstitution = (ingredientId: string) => (foodId: string) => {
    updateSupplementalIngredientInfo(
      (_supplementalIngredientInfo: SupplementalIngredientInfo) => {
        const existingInfo = _supplementalIngredientInfo[ingredientId] || {};

        return {
          ..._supplementalIngredientInfo,
          [ingredientId]: {
            ...existingInfo,
            substitution: { foodId, amount: "" },
          },
        };
      }
    );
    setAddingSubstitution(null);
    setNewSubstitutionFoodId(null);

    waitForElm(`#${foodId}-amount-input-substitution`).then((elm) => {
      elm.focus();
    });
  };

  const updateSubstitutionAmount = (ingredientId: string, amount: string) => {
    updateSupplementalIngredientInfo(
      (_supplementalIngredientInfo: SupplementalIngredientInfo) => {
        const { substitution, ...existingInfo } =
          _supplementalIngredientInfo[ingredientId] || {};

        return {
          ..._supplementalIngredientInfo,
          [ingredientId]: {
            ...existingInfo,
            substitution: { ...substitution, amount },
          },
        };
      }
    );
  };

  const renderIngredientText = (
    foodId: string,
    isOptional: boolean,
    amount: string,
    withIndentArrow?: boolean
  ) => (
    <>
      {withIndentArrow && <SubdirectoryArrowRightOutlinedIcon />}
      <Typography
        sx={{
          fontWeight: "bold",
          fontStyle: isOptional ? "italic" : "inherit",
          marginLeft: "0px !important",
        }}
      >
        {idsAsNames ? foodId : glossary.basicFoods[foodId]}:
      </Typography>
      <Typography>{amount}</Typography>
    </>
  );

  const renderIngredientTexts = (ingredientId: string) => {
    const { isOptional = false, substitution } =
      supplementalIngredientInfo[ingredientId] || {};

    const ingredientTexts: React.JSX.Element[] = [
      renderIngredientText(ingredientId, isOptional, ingredients[ingredientId]),
    ];

    if (substitution && substitution.foodId) {
      const { foodId, amount } = substitution;
      ingredientTexts.push(renderIngredientText(foodId, false, amount, true));
    }

    return ingredientTexts;
  };

  const renderSubstitutionControl = (
    ingredientId: string,
    { foodId, amount }: SupplementalIngredientInfo[string]["substitution"]
  ) => (
    <>
      <SubdirectoryArrowRightOutlinedIcon />
      <Typography
        sx={{ fontWeight: "bold", flexGrow: 1, marginLeft: "0px !important" }}
      >
        {glossary.basicFoods[foodId]}:
      </Typography>
      <TextField
        id={`${foodId}-amount-input-substitution`}
        placeholder="Edit amount"
        value={amount}
        onChange={(event) =>
          updateSubstitutionAmount(ingredientId, event.target.value)
        }
        size="small"
        fullWidth={true}
        variant="outlined"
        inputProps={{ autoCapitalize: "none" }}
        sx={{ flexGrow: 1, minWidth: "130px", maxWidth: "50%" }}
      />
      <IconButton
        onClick={() => removeSubstitution(ingredientId)}
        color="secondary"
        sx={{ padding: 0 }}
      >
        <CloseOutlinedIcon />
      </IconButton>
    </>
  );

  const renderIngredientControls = (ingredientId: string) => {
    const shouldUseMenu =
      !isForShoppingList || supplementalIngredientInfo[ingredientId];

    const { isOptional, substitution } =
      supplementalIngredientInfo[ingredientId] || {};

    const controls = [
      <>
        <Typography
          sx={{
            fontWeight: "bold",
            flexGrow: 1,
            fontStyle: isOptional ? "italic" : "inherit",
          }}
        >
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
          sx={{ flexGrow: 1, minWidth: "130px", maxWidth: "50%" }}
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
          sx={{ padding: 0 }}
        >
          {shouldUseMenu ? (
            <ArrowDropDownCircleOutlinedIcon />
          ) : (
            <HighlightOffIcon />
          )}
        </IconButton>
      </>,
    ];

    if (addingSubstitution === ingredientId) {
      controls.push(
        renderAddItemControl(
          ingredientId,
          getAddSubstitution(ingredientId),
          setNewSubstitutionFoodId,
          newSubstitutionFoodId
        )
      );
    }

    if (substitution) {
      controls.push(renderSubstitutionControl(ingredientId, substitution));
    }

    return controls;
  };

  const renderItems = () =>
    Object.keys(ingredients)
      .sort(getIngredientSorting(basicFoodTagAssociation, basicFoodTagOrder))
      .reduce(
        (acc: React.JSX.Element[], ingredientId) =>
          acc.concat(
            editable
              ? renderIngredientControls(ingredientId)
              : renderIngredientTexts(ingredientId)
          ),
        []
      )
      .map((element, index) => (
        <Stack
          key={`item-${editable}-${index}`}
          direction="row"
          spacing={1}
          alignItems="center"
        >
          {element}
        </Stack>
      ));

  const renderAddItemControl = (
    key: string,
    addItemHandler: (foodId: string) => void,
    setNewFoodId: (foodId: string) => void,
    newFoodId: string
  ) => (
    <Stack
      key={`addIngredient-${key}`}
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ flexGrow: 1 }}
    >
      <BasicFoodAutocomplete
        id={`addIngredientSelect-${key}`}
        foodMap={ingredients}
        newFoodId={newFoodId}
        setNewFoodId={setNewFoodId}
        extraProps={{ fullWidth: true }}
      />
      <Button
        id={`add-ingredient-button-${key}`}
        color="primary"
        variant="contained"
        size="small"
        onClick={() => addItemHandler(newFoodId)}
        disabled={!newFoodId}
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

        {substitution
          ? [
              <MenuItem onClick={withCloseMenu(removeSubstitution)}>
                Remove substitution
              </MenuItem>,
              <MenuItem onClick={withCloseMenu(swapSubstitution)}>
                Swap substitution
              </MenuItem>,
            ]
          : !isForShoppingList && (
              <MenuItem onClick={withCloseMenu(addSubstitutionControls)}>
                Add substitution
              </MenuItem>
            )}
      </Menu>
    );
  };
  const renderContents = () => (
    <>
      <Stack spacing={editable ? 2 : 1}>
        {renderItems().concat(
          editable &&
            renderAddItemControl(
              "newIngredient",
              addIngredient,
              setNewIngredientId,
              newIngredientId
            )
        )}
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
