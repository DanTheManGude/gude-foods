import { useState, useEffect } from "react";

import Stack from "@mui/material/Stack";
import NavBar from "./AppPieces/NavBar";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import { offlineCookbookKey } from "../constants";

import RecipeData from "./Utils/RecipeData";
import OfflineCookbook from "./Utils/OfflineCookbook";

function OfflineMode(props) {
  const { disableUsingOffline } = props;

  const [showAlert, setShowAlert] = useState(true);
  const [cookbook, setCookbook] = useState({});
  const [recipe, setRecipe] = useState();
  const clearRecipe = () => setRecipe();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(offlineCookbookKey)) || {};
    setCookbook(data);
  }, []);

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
      alignItems="stretch"
      spacing={2}
      width={"100%"}
    >
      <Button
        variant="contained"
        sx={{ flexGrow: "1" }}
        onClick={disableUsingOffline}
      >
        <Typography>
          <span>Stop using</span>
          <br />
          <span>offline mode</span>
        </Typography>
      </Button>
      {!recipe ? (
        <Button variant="outlined" sx={{ flexGrow: "1" }} onClick={clearRecipe}>
          <Typography>
            <span>View other recipe</span>
            <br />
            <span></span>
          </Typography>
        </Button>
      ) : (
        <Button variant="outlined" sx={{ flexGrow: "1" }}>
          <Typography>
            <span>Import recipe</span>
            <br />
            <span>from device</span>
          </Typography>
        </Button>
      )}
    </Stack>
  );

  const renderRecipeOrCookbook = () => {
    if (recipe) {
      return <RecipeData recipe={recipe} />;
    }

    return <OfflineCookbook cookbook={cookbook} />;
  };

  return (
    <>
      <NavBar isAuthorized={false} />
      <Stack alignItems="center" spacing={2} width={"100%"} paddingTop={2}>
        {renderAlert()}
        {renderActionButtons()}
        {renderRecipeOrCookbook()}
      </Stack>
    </>
  );
}

export default OfflineMode;
