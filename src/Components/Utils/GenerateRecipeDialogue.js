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

import { generateRecipe, parseResponse } from "../../utils/ai";

const promptPrefix = "Generate a recipe";

function GenerateRecipeDialogue(props) {
  const { open, onClose, openAIKey, addAlert } = props;

  const [prompt, setPrompt] = useState(promptPrefix);
  const [recipeList, setRecipeList] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [freeForm, setFreeForm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  useEffect(() => {
    let newPrompt = promptPrefix;

    if (recipeList.length) {
      newPrompt = `${newPrompt} with foods ${recipeList.join(", ")}`;
    }
    if (tagsList.length) {
      newPrompt = `${newPrompt} with types ${tagsList.join(", ")}`;
    }
    if (freeForm) {
      newPrompt = `${newPrompt} that ${freeForm}`;
    }

    newPrompt = `${newPrompt}.`;
    setPrompt(newPrompt);
  }, [recipeList, tagsList, freeForm]);

  const handleGenerate = () => {
    startLoading();

    generateRecipe(
      openAIKey,
      prompt,
      (textResponse) => {
        const generatedRecipe = parseResponse(textResponse);
        console.log(generatedRecipe);
        stopLoading();
      },
      (error) => {
        onClose();
        addAlert({
          message: error.toString(),
          title: "Error with generating recipe",
          alertProps: { severity: "error" },
        });
        stopLoading();
      }
    );
  };

  const renderLoading = () => <CircularProgress color="secondary" />;

  const renderControls = () => {
    return (
      <>
        {/* <Stack
          key="ingredientsIncludes"
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ width: "100%" }}
        >
          <Box sx={{ width: "20%" }}>
            <Typography>Includes foods:</Typography>
          </Box>
          <Box sx={{ width: "70%" }}>
            <Autocomplete
              multiple={true}
              limitTags={3}
              id="ingredient-input-multi"
              options={constructBasicFoodOptions(
                glossary,
                basicFoodTagOrder || [],
                unknownSectionName,
                calculateFoodSectionForOptions
              )}
              getOptionLabel={(option) => option.title}
              groupBy={(option) =>
                option.foodId
                  ? calculateFoodSectionForOptions(option.foodId)
                  : null
              }
              isOptionEqualToValue={(optionA, optionB) =>
                optionA.foodId === optionB.foodId
              }
              getOptionDisabled={(option) =>
                ingredientsList && ingredientsList.includes(option.foodId)
              }
              value={ingredientsList.map((foodId) => ({
                foodId,
                title: glossary.basicFoods[foodId],
              }))}
              onChange={(event, selection) => {
                const _ingredientsList = selection.map(
                  (option) => option.foodId
                );
                updateFilteringOptions({ ingredientsList: _ingredientsList });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ingredients"
                  placeholder="Enter item"
                />
              )}
              ChipProps={{
                color: "secondary",
                variant: "outlined",
              }}
            />
          </Box>
        </Stack>
        <Stack
          key="tagsIncludes"
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ width: "100%" }}
        >
          <Box sx={{ width: "20%" }}>
            <Typography>Has tags:</Typography>
          </Box>
          <Box sx={{ width: "70%" }}>
            <Autocomplete
              multiple={true}
              limitTags={3}
              id="multiple-limit-tags"
              options={
                glossary && glossary.recipeTags
                  ? Object.keys(glossary.recipeTags).map((tagId) => ({
                      tagId,
                      title: glossary.recipeTags[tagId],
                    }))
                  : []
              }
              getOptionLabel={(option) => option.title}
              getOptionDisabled={(option) => tagsList.includes(option.tagId)}
              isOptionEqualToValue={(optionA, optionB) =>
                optionA.tagId === optionB.tagId
              }
              value={tagsList.map((tagId) => ({
                tagId,
                title: glossary.recipeTags[tagId],
              }))}
              onChange={(event, selection) => {
                const _tagsList = selection.map((option) => option.tagId);
                updateFilteringOptions({ tagsList: _tagsList });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Enter tags" />
              )}
              ChipProps={{
                color: "tertiary",
                variant: "outlined",
              }}
            />
          </Box>
        </Stack> */}
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
            />
          </Box>
        </Paper>
      </>
    );
  };

  const renderPromptCard = () => (
    <Box sx={{ width: "100%" }}>
      <Card variant="outlined">
        <CardContent>
          <Typography>{prompt}</Typography>
        </CardContent>
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
          {isLoading ? renderLoading() : renderControls()}
          {renderPromptCard()}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose} color="warning">
          <Typography>Close</Typography>
        </Button>
        <Button
          disabled={isLoading}
          variant="outlined"
          onClick={handleGenerate}
          color="tertiary"
        >
          <Typography>Generate</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GenerateRecipeDialogue;
