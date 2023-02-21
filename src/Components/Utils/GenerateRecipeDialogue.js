import { useEffect, useState } from "react";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

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
  }, [recipeList, freeForm]);

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

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%" } }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle color="primary">Generate Recipe with AI</DialogTitle>
      <DialogContent dividers>
        <Typography>{prompt}</Typography>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose} color="secondary">
          <Typography>Close</Typography>
        </Button>
        <Button disabled={isLoading} onClick={handleGenerate} color="tertiary">
          <Typography>Generate</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GenerateRecipeDialogue;
