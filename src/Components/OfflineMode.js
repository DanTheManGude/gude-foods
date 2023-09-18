import { useState } from "react";

import Stack from "@mui/material/Stack";
import NavBar from "./AppPieces/NavBar";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import OfflineRecipeDialogue from "./Utils/OfflineRecipeDialogue";

function OfflineMode(props) {
  const { disableUsingOffline } = props;

  const [showAlert, setShowAlert] = useState(true);
  const [openSelectionDialogue, setOpenSelectionDialogue] = useState(false);
  const [recipe, setRecipe] = useState();

  const renderAlert = () => (
    <Collapse in={showAlert}>
      <Alert
        severity="info"
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              setShowAlert(false);
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle>Offline Mode</AlertTitle>
        Only viewing recipes that you saved is available.
      </Alert>
    </Collapse>
  );

  const renderActionButtons = () => (
    <Stack
      direction="row"
      justifyContent="space-around"
      alignItems="center"
      spacing={2}
      width={"100%"}
    >
      <Button
        variant="outlined"
        sx={{ flexGrow: "1" }}
        onClick={disableUsingOffline}
      >
        <Typography>
          <span>Stop using</span>
          <br />
          <span>offline mode</span>
        </Typography>
      </Button>
      <Button
        variant="contained"
        sx={{ flexGrow: "1" }}
        onClick={() => setOpenSelectionDialogue(true)}
      >
        <Typography>
          <span>Select recipe</span>
          <br />
          <span>to view</span>
        </Typography>
      </Button>
    </Stack>
  );

  const renderRecipe = () => {
    if (!recipe) {
      return null;
    }

    console.log(recipe);
    return "recipe";
  };

  return (
    <>
      <NavBar isAuthorized={false} />
      <Stack alignItems="center" spacing={2} width={"100%"}>
        {renderAlert()}
        {renderActionButtons()}
        {renderRecipe()}
      </Stack>
      <OfflineRecipeDialogue
        open={openSelectionDialogue}
        onClose={() => setOpenSelectionDialogue(false)}
        setRecipe={setRecipe}
      />
    </>
  );
}

export default OfflineMode;
