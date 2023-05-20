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
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { updateOpenAIKey } from "../../utils/requests";
import { generateRecipe, parseResponse, reportAiError } from "../../utils/ai";
import {
  DatabaseContext,
  DataPathsContext,
  AddAlertContext,
} from "../Contexts";
import BasicFoodMultiSelect from "./BasicFoodMultiSelect";
import RecipeTagsMultiSelect from "./RecipeTagsMultiSelect";
import { Link } from "@mui/material";

const PromptTypography = (props) => <Typography component="span" {...props} />;
const promptPrefix = (
  <PromptTypography key="prefix">Generate a recipe</PromptTypography>
);

function GenerateRecipeDialogue(props) {
  const { open, onClose, setAiGeneratedRecipe, userDisplayName } = props;

  const [reportErrorValues, setReportErrorValues] = useState();
  const addAlert = useContext(AddAlertContext);
  const dataPaths = useContext(DataPathsContext);
  const { openAIKeyPath } = dataPaths;
  const database = useContext(DatabaseContext);
  const {
    glossary,
    basicFoodTagOrder,
    basicFoodTagAssociation,
    openAIKey: savedOpenAiKey,
  } = database;

  let navigate = useNavigate();

  const [prompt, setPrompt] = useState([promptPrefix]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [tags, setTags] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [enteredOpenAIKey, setEnteredOpenAIKey] = useState("");
  const [usableOpenAIKey, setUseableOpenAIKey] = useState();

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  if (savedOpenAiKey && usableOpenAIKey !== savedOpenAiKey) {
    setUseableOpenAIKey(savedOpenAiKey);
  }

  const handleClose = () => {
    setIngredientsList([]);
    setTags([]);
    setAdditionalNotes("");
    stopLoading();
    setResponseText("");

    onClose();
  };

  useEffect(() => {
    const newPrompt = [promptPrefix];

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
        <PromptTypography key="tagsStarter"> with attributes </PromptTypography>
      );
      newPrompt.push(
        <PromptTypography key="tags" sx={{ fontStyle: "italic" }}>
          {tags.map((tagId) => glossary.recipeTags[tagId]).join(", ")}
        </PromptTypography>
      );
    }
    if (additionalNotes) {
      newPrompt.push(
        <PromptTypography key="additionalNotesStarter"> that </PromptTypography>
      );
      newPrompt.push(
        <PromptTypography
          key="additionalNotesText"
          sx={{ textDecoration: "underline" }}
        >
          {additionalNotes}
        </PromptTypography>
      );
    }

    newPrompt.push(<PromptTypography key="closer">.</PromptTypography>);
    setPrompt(newPrompt);
  }, [ingredientsList, tags, additionalNotes, glossary]);

  const handleGenerate = () => {
    startLoading();

    const promptText = prompt.reduce((acc, promptElement) => {
      const promptElementText = promptElement.props.children;
      return `${acc}${promptElementText}`;
    }, "");

    generateRecipe(
      usableOpenAIKey,
      promptText,
      (_responseText, response) => {
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
            (foodId) => glossary.basicFoods[foodId] === "salt"
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

          handleClose();
          setAiGeneratedRecipe({
            ...generatedRecipe,
            tags: tagsList,
            ingredients,
            notes,
          });
          navigate("/aiRecipe");
        } catch (error) {
          setResponseText(_responseText);
          console.warn(error);
          setReportErrorValues({
            promptText,
            response: JSON.stringify(response),
            error: error.toString(),
          });
        }

        stopLoading();
      },
      (error) => {
        stopLoading();
        addAlert(
          {
            message: error.toString(),
            title: "Error when generating recipe",
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

  const handleSaveOpenAIKey = () => {
    updateOpenAIKey(enteredOpenAIKey, openAIKeyPath, addAlert);
  };

  const handleEnteredOpenAIKey = () => {
    setUseableOpenAIKey(enteredOpenAIKey);
  };

  const handleRemoveApiKey = () => {
    if (savedOpenAiKey) {
      updateOpenAIKey(null, openAIKeyPath, addAlert);
    }
    setUseableOpenAIKey();
  };

  const handleReportError = () => {
    reportAiError(addAlert, { ...reportErrorValues, userDisplayName });
    setReportErrorValues();
  };

  const renderDiaglogContentAndActions = () => {
    if (!usableOpenAIKey) {
      return (
        <>
          <DialogContent dividers>
            <Stack sx={{ width: "100%" }} spacing={2} alignItems="center">
              <Typography>
                Use OpenAI to create a recipe. Gude Foods will craft the prompt,
                make the request, and parse the response into a cookbook ready
                recipe.
              </Typography>
              <Typography fontWeight={600}>
                An OpenAPI account is required and your api keys can be found
                <Link
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                  rel="noopener"
                  color="secondary"
                >
                  {" here."}
                  <OpenInNewIcon
                    fontSize="inherit"
                    sx={{ verticalAlign: "sub" }}
                  />
                </Link>
              </Typography>
              <Typography>
                Save the key to Gude Foods for future use, or only use it now.
              </Typography>
              <TextField
                label="Enter your OpenAI API key"
                fullWidth={true}
                value={enteredOpenAIKey}
                onChange={(event) => {
                  setEnteredOpenAIKey(event.target.value);
                }}
                variant="outlined"
                inputProps={{
                  autoCapitalize: "none",
                }}
                color="info"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={handleClose} color="secondary">
              <Typography>Close</Typography>
            </Button>

            <Button
              disabled={!enteredOpenAIKey}
              variant="outlined"
              onClick={handleEnteredOpenAIKey}
              color="primary"
            >
              <Typography>Use only now</Typography>
            </Button>
            <Button
              disabled={!enteredOpenAIKey}
              variant="contained"
              onClick={handleSaveOpenAIKey}
              color="primary"
            >
              <Typography>Save</Typography>
            </Button>
          </DialogActions>
        </>
      );
    }

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
          {!isLoading && !responseText && (
            <Button
              autoFocus
              variant="outlined"
              onClick={handleRemoveApiKey}
              color="error"
            >
              <Typography>Delete key</Typography>
            </Button>
          )}

          <Button
            autoFocus
            onClick={handleClose}
            color="secondary"
            variant="outlined"
          >
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
          width: "80%",
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

export default GenerateRecipeDialogue;
