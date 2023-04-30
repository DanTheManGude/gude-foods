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

import { generateRecipe, parseResponse } from "../../utils/ai";
import { DatabaseContext, AddAlertContext } from "../Contexts";
import BasicFoodMultiSelect from "./BasicFoodMultiSelect";
import RecipeTagsMultiSelect from "./RecipeTagsMultiSelect";

const PromptTypography = (props) => <Typography component="span" {...props} />;
const promptPrefix = (
  <PromptTypography key="prefix">Generate a recipe</PromptTypography>
);

function GenerateRecipeDialogue(props) {
  const { open, onClose, setAiGeneratedRecipe } = props;

  const addAlert = useContext(AddAlertContext);
  const database = useContext(DatabaseContext);
  const { glossary, basicFoodTagOrder, basicFoodTagAssociation, openAIKey } =
    database;

  let navigate = useNavigate();

  const [prompt, setPrompt] = useState([promptPrefix]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [tags, setTags] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseText, setResponseText] = useState("");

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

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
      openAIKey,
      promptText,
      (_responseText) => {
        try {
          const generatedRecipe = parseResponse(_responseText);

          const aiTag = Object.keys(glossary.recipeTags).find(
            (tagId) => glossary.recipeTags[tagId] === "AI"
          );
          const saltIngredient = Object.keys(glossary.basicFoods).find(
            (foodId) => glossary.basicFoods[foodId] === "salt"
          );

          const tagsList = tags;
          if (aiTag && !tagsList.includes(aiTag)) {
            tagsList.unshift(aiTag);
          }

          const ingredients = ingredientsList.reduce(
            (acc, ingredientId) => ({ ...acc, [ingredientId]: "" }),
            {}
          );
          if (saltIngredient) {
            ingredients[saltIngredient] = "a grain";
          }

          handleClose();
          setAiGeneratedRecipe({
            ...generatedRecipe,
            tags: tagsList,
            ingredients,
            notes: additionalNotes,
          });
          navigate("/aiRecipe");
        } catch (error) {
          setResponseText(_responseText);
        }

        stopLoading();
      },
      (error) => {
        handleClose();
        addAlert({
          message: error.toString(),
          title: "Error when generating recipe",
          alertProps: { severity: "error" },
        });
      }
    );
  };

  const renderLoading = () => <CircularProgress color="secondary" />;

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

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%" } }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle color="primary">Generate Recipe with AI</DialogTitle>
      <DialogContent dividers>
        <Stack sx={{ width: "100%" }} spacing={2} alignItems="center">
          {maybeRenderControls()}
          {renderPromptCard()}
          {isLoading && renderLoading()}
          {responseText && renderResponseTextCard()}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose} color="secondary">
          <Typography>Close</Typography>
        </Button>
        {responseText ? (
          <Button
            color="primary"
            variant="outlined"
            endIcon={<ContentCopyRoundedIcon />}
            onClick={() => {
              navigator.clipboard.writeText(responseText);
            }}
          >
            <Typography>Copy</Typography>
          </Button>
        ) : (
          <Button
            disabled={isLoading || !!responseText}
            variant="outlined"
            onClick={handleGenerate}
            color="primary"
          >
            <Typography>Generate</Typography>
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default GenerateRecipeDialogue;
