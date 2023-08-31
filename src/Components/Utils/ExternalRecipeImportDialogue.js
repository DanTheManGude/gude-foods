import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";

import { fetchRecipeFromUrl } from "../../utils/utility";

function NewRecipeDialogue(props) {
  const { open, onClose, setExternalRecipe } = props;

  let navigate = useNavigate();

  const [externalUrl, setExternalUrl] = useState("");
  const [errorString, setErrorString] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setErrorString();
    onClose();
  };

  const handleImportFromUrl = () => {
    setErrorString();
    setLoading(true);

    fetchRecipeFromUrl(externalUrl)
      .then((externalRecipe) => {
        setExternalRecipe(externalRecipe);
        navigate("/externalRecipe");
      })
      .catch((error) => {
        setErrorString(error.toString());
        setLoading(false);
        console.log(error);
      });
  };

  const maybeRenderError = () => {
    if (!errorString) {
      return null;
    }
    return (
      <>
        <Typography>
          <Typography
            color="error"
            sx={{ fontWeight: "medium" }}
            variant="span"
          >
            An Error occured:
          </Typography>
          <br />
          <Typography variant="span">{errorString}</Typography>
        </Typography>
      </>
    );
  };

  return (
    <>
      <Dialog
        sx={{
          "& .MuiDialog-paper": {
            width: "80%",
          },
        }}
        maxWidth="xs"
        open={open}
      >
        <DialogTitle color="primary">
          <Stack direction="row" alignItems="baseline" spacing={2}>
            <span>Import recipe from URL</span>
          </Stack>
        </DialogTitle>
        <DialogContent dividers={true}>
          <Stack spacing={2}>
            <Typography>
              Paste a URL of a website that features a recipe. The recipe will
              available for editing before it is saved to your cookbook.
            </Typography>
            {maybeRenderError()}
            <TextField
              size="small"
              onChange={(event) => {
                setExternalUrl(event.target.value);
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={handleClose} variant="contained">
            <Typography>Cancel</Typography>
          </Button>
          <Button
            color="primary"
            onClick={handleImportFromUrl}
            variant="contained"
            disabled={!externalUrl || loading}
          >
            {loading ? (
              <>
                <Typography sx={{ marginRight: "12px" }}>Loading</Typography>
                <CircularProgress color="primary" size="24px" />
              </>
            ) : (
              <Typography>Import</Typography>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default NewRecipeDialogue;
