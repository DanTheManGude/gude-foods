import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

import {
  generateRecipe,
  parseResponse,
  reportAiError,
} from "../../../utils/ai";
import { DatabaseContext, AddAlertContext, UserContext } from "../../Contexts";
import BasicFoodMultiSelect from "../BasicFoodMultiSelect";
import RecipeTagsMultiSelect from "../RecipeTagsMultiSelect";

const PromptTypography = (props) => <Typography component="span" {...props} />;
const promptPrefix = (
  <PromptTypography key="prefix">Generate a recipe</PromptTypography>
);

function GenerateRecipeDialog(props) {
  const { open, onClose, setExternalRecipe, filteringOptions } = props;

  const [reportErrorValues, setReportErrorValues] = useState();
  const addAlert = useContext(AddAlertContext);
  const database = useContext(DatabaseContext);
  const { glossary, basicFoodTagOrder, basicFoodTagAssociation } = database;
  const user = useContext(UserContext);

  let navigate = useNavigate();

  const [prompt, setPrompt] = useState([promptPrefix]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [tags, setTags] = useState([]);
  const [recipeName, setRecipeName] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [length, setLength] = useState(600);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  const handleClose = () => {
    setRecipeName("");
    setIngredientsList([]);
    setTags([]);
    setAdditionalNotes("");
    stopLoading();
    setResponseText("");

    onClose();
  };

  useEffect(() => {
    if (!open) {
      const {
        ingredientsList: filteredIngredientsList = [],
        tagsList: filteredTagsList = [],
      } = filteringOptions;
      setIngredientsList(filteredIngredientsList);
      setTags(filteredTagsList);
    }
  }, [open, filteringOptions]);

  useEffect(() => {
    const newPrompt = [promptPrefix];

    if (recipeName) {
      newPrompt.push(
        <PromptTypography key="recipeNameStarter">{` for `}</PromptTypography>
      );
      newPrompt.push(
        <PromptTypography key="recipeName" sx={{ textDecoration: "underline" }}>
          {`${recipeName}`}
        </PromptTypography>
      );
    }
    if (ingredientsList.length) {
      newPrompt.push(
        <PromptTypography key="ingredientStarter">
          {` with foods `}
        </PromptTypography>
      );
      newPrompt.push(
        <PromptTypography key="ingredientList" sx={{ fontWeight: "bold" }}>
          {ingredientsList
            .map((foodId) => glossary.basicFoods[foodId])
            .join(", ")}
        </PromptTypography>
      );
    }
    if (tags.length) {
      newPrompt.push(
        <PromptTypography key="tagsStarter">{` with attributes `}</PromptTypography>
      );
      newPrompt.push(
        <PromptTypography key="tags" sx={{ fontStyle: "italic" }}>
          {tags.map((tagId) => glossary.recipeTags[tagId]).join(", ")}
        </PromptTypography>
      );
    }
    if (additionalNotes) {
      newPrompt.push(
        <PromptTypography key="additionalNotesStarter">{` that `}</PromptTypography>
      );
      newPrompt.push(
        <PromptTypography key="additionalNotesText">
          {additionalNotes}
        </PromptTypography>
      );
    }

    newPrompt.push(<PromptTypography key="closer">.</PromptTypography>);
    setPrompt(newPrompt);
  }, [recipeName, ingredientsList, tags, additionalNotes, glossary]);

  const handleGenerate = () => {
    startLoading();

    const promptText = prompt.reduce((acc, promptElement) => {
      const promptElementText = promptElement.props.children;
      return `${acc}${promptElementText}`;
    }, "");

    generateRecipe(
      { promptText, length },
      user,
      (_responseText) => {
        try {
          const generatedRecipe = parseResponse(_responseText);

          const aiTag =
            glossary.recipeTags &&
            Object.keys(glossary.recipeTags).find(
              (tagId) => glossary.recipeTags[tagId] === "AI"
            );

          const tagsList = tags;
          if (aiTag && !tagsList.includes(aiTag)) {
            tagsList.unshift(aiTag);
          }

          const saltIngredient = Object.keys(glossary.basicFoods).find(
            (foodId) => ["salt", "Salt"].includes(glossary.basicFoods[foodId])
          );

          const ingredients = ingredientsList.reduce(
            (acc, ingredientId) => ({ ...acc, [ingredientId]: "" }),
            {}
          );
          if (saltIngredient) {
            ingredients[saltIngredient] = "a grain";
          }

          const notes = `${additionalNotes}\n${generatedRecipe.ingredientText.join(
            `\n`
          )}`;

          const maybeDescription =
            recipeName && generatedRecipe.name !== recipeName
              ? { description: recipeName }
              : {};

          handleClose();
          setExternalRecipe({
            ...generatedRecipe,
            tags: tagsList,
            ingredients,
            notes,
            ...maybeDescription,
          });
          navigate("/externalRecipe");
        } catch (error) {
          setResponseText(_responseText);
          console.warn(error);
          setReportErrorValues({
            promptText,
            response: _responseText,
            error: error.toString(),
          });
        }

        stopLoading();
      },
      (error) => {
        stopLoading();
        addAlert(
          {
            message: <Typography>{error.toString()}</Typography>,
            title: <Typography>Error when generating recipe</Typography>,
            alertProps: { severity: "error" },
          },
          6000
        );
      }
    );
  };

  const renderLoading = () => <CircularProgress color="primary" />;

  const renderResponseTextCard = () => (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <Paper elevation={2}>
        <CardContent>
          <Typography style={{ whiteSpace: "pre-line" }}>
            {responseText}
          </Typography>
        </CardContent>
      </Paper>
    </Card>
  );

  const renderControls = () => {
    return (
      <>
        <Stack
          key="ingredientsIncludes"
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ width: "100%" }}
        >
          <Box sx={{ width: "20%" }}>
            <Typography>Recipe name:</Typography>
          </Box>
          <Box sx={{ width: "80%" }}>
            <TextField
              label="Recipe Name"
              fullWidth={true}
              value={recipeName}
              onChange={(event) => {
                setRecipeName(event.target.value);
              }}
              variant="outlined"
              inputProps={{
                autoCapitalize: "none",
              }}
            />
          </Box>
        </Stack>

        <BasicFoodMultiSelect
          glossary={glossary}
          basicFoodTagAssociation={basicFoodTagAssociation}
          basicFoodTagOrder={basicFoodTagOrder}
          ingredientsList={ingredientsList}
          updateIngredientsList={setIngredientsList}
        />
        <RecipeTagsMultiSelect
          glossary={glossary}
          tagsList={tags}
          updateTagsList={setTags}
        />

        <Paper elevation={2} sx={{ width: "100%" }}>
          <Box sx={{ padding: 2 }}>
            <TextField
              label="Additional details"
              fullWidth={true}
              multiline={true}
              value={additionalNotes}
              onChange={(event) => {
                setAdditionalNotes(event.target.value);
              }}
              variant="standard"
              inputProps={{
                autoCapitalize: "none",
              }}
            />
          </Box>
        </Paper>

        <Box sx={{ width: "100%" }}>
          <Typography>Length</Typography>
          <Slider
            onChange={(event, newValue) => {
              setLength(newValue);
            }}
            value={length}
            valueLabelDisplay="off"
            min={200}
            max={1100}
          />
        </Box>
      </>
    );
  };

  const maybeRenderControls = () => {
    if (responseText || isLoading) {
      return null;
    }
    return renderControls();
  };

  const renderPromptCard = () => (
    <Box sx={{ width: "100%" }}>
      <Card variant="outlined">
        <CardContent>{prompt}</CardContent>
      </Card>
    </Box>
  );

  const handleReportError = () => {
    reportAiError(addAlert, {
      ...reportErrorValues,
      who: `${user.displayName} - ${user.uid}`,
    });
    setReportErrorValues();
  };

  const renderDiaglogContentAndActions = () => {
    return (
      <>
        <DialogContent dividers>
          <Stack sx={{ width: "100%" }} spacing={2} alignItems="center">
            {maybeRenderControls()}
            {renderPromptCard()}
            {isLoading && renderLoading()}
            {responseText && renderResponseTextCard()}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="contained">
            <Typography>Close</Typography>
          </Button>
          {responseText ? (
            <>
              <Button
                color="primary"
                variant="outlined"
                onClick={handleReportError}
                disabled={!reportErrorValues}
              >
                <Typography>Report error</Typography>
              </Button>
              <Button
                color="primary"
                variant="contained"
                endIcon={<ContentCopyRoundedIcon />}
                onClick={() => {
                  navigator.clipboard.writeText(responseText);
                }}
              >
                <Typography>Copy</Typography>
              </Button>
            </>
          ) : (
            <Button
              disabled={isLoading}
              variant="contained"
              onClick={handleGenerate}
              color="primary"
            >
              <Typography>Generate</Typography>
            </Button>
          )}
        </DialogActions>
      </>
    );
  };

  return (
    <Dialog
      sx={{
        "& .MuiDialog-paper": {
          width: "85%",
        },
        "& .MuiDialog-container": {
          marginBottom: "100px",
        },
      }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle color="primary">Generate Recipe with AI</DialogTitle>
      {renderDiaglogContentAndActions()}
    </Dialog>
  );
}

export default GenerateRecipeDialog;
