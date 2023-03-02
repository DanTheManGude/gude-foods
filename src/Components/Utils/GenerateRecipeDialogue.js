import { useEffect, useState } from "react";

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

import BasicFoodMultiSelect from "./BasicFoodMultiSelect";
import RecipeTagsMultiSelect from "./RecipeTagsMultiSelect";

import { generateRecipe, parseResponse } from "../../utils/ai";

const PromptTypography = (props) => <Typography component="span" {...props} />;
const promptPrefix = (
  <PromptTypography key="prefix">Generate a recipe</PromptTypography>
);

function GenerateRecipeDialogue(props) {
  const {
    open,
    onClose,
    openAIKey,
    addAlert,
    glossary,
    basicFoodTagOrder,
    basicFoodTagAssociation,
  } = props;

  const [prompt, setPrompt] = useState([promptPrefix]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [freeForm, setFreeForm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseText, setResponseText] = useState("");

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  const handleClose = () => {
    setIngredientsList([]);
    setTagsList([]);
    setFreeForm("");
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
    if (tagsList.length) {
      newPrompt.push(
        <PromptTypography key="tagsStarter"> with attributes </PromptTypography>
      );
      newPrompt.push(
        <PromptTypography key="tagsList" sx={{ fontStyle: "italic" }}>
          {tagsList.map((tagId) => glossary.recipeTags[tagId]).join(", ")}
        </PromptTypography>
      );
    }
    if (freeForm) {
      newPrompt.push(
        <PromptTypography key="freeFormStarter"> that </PromptTypography>
      );
      newPrompt.push(
        <PromptTypography
          key="freeFormText"
          sx={{ textDecoration: "underline" }}
        >
          {freeForm}
        </PromptTypography>
      );
    }

    newPrompt.push(<PromptTypography key="closer">.</PromptTypography>);
    setPrompt(newPrompt);
  }, [ingredientsList, tagsList, freeForm, glossary]);

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
        let generatedRecipe;
        try {
          generatedRecipe = parseResponse(_responseText);
          handleClose();
          console.log(generatedRecipe);
          // Navigate to Recipe with generatedRecipe
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
          tagsList={tagsList}
          updateTagsList={setTagsList}
        />
        <Paper elevation={2} sx={{ width: "100%" }}>
          <Box sx={{ padding: 2 }}>
            <TextField
              label="Additional details"
              fullWidth={true}
              multiline={true}
              value={freeForm}
              onChange={(event) => {
                setFreeForm(event.target.value);
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

  const renderMainContent = () => {
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
          {renderMainContent()}
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
