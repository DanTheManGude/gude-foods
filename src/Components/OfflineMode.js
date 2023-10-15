import { useState, useEffect } from "react";

import Stack from "@mui/material/Stack";
import NavBar from "./AppPieces/NavBar";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { offlineCookbookKey } from "../constants";

import RecipeData from "./Utils/RecipeData";
import OfflineCookbook from "./Utils/OfflineCookbook";
import ImportFileButton from "./Utils/ImportFileButton";

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
    <Collapse in={showAlert} sx={{ width: { xs: "85%", md: "60%" } }}>
      <Alert severity="info" onClose={() => setShowAlert(false)}>
        <AlertTitle>Offline Mode</AlertTitle>
        Only viewing recipes is available.
      </Alert>
    </Collapse>
  );

  const renderActionButtons = () => (
    <Stack
      direction="row"
      justifyContent="space-around"
      alignItems="stretch"
      spacing={2}
      width={"95%"}
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
      {recipe ? (
        <Button variant="outlined" sx={{ flexGrow: "1" }} onClick={clearRecipe}>
          <Typography>View other recipes</Typography>
        </Button>
      ) : (
        <ImportFileButton
          customHandler={setRecipe}
          shouldUseCustomHandler={true}
          buttonProps={{
            variant: "outlined",
            sx: { height: "100%", width: "100%" },
          }}
          containerProps={{ style: { flexGrow: "1" } }}
          buttonText={
            <>
              <span>Import recipe</span>
              <br />
              <span>from device</span>
            </>
          }
          typographyProps={{ sx: { textAlign: "center" } }}
          id="import-offline-recipe"
        />
      )}
    </Stack>
  );

  const renderRecipeOrCookbook = () => {
    if (recipe) {
      return <RecipeData recipe={recipe} setRecipe={setRecipe} />;
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
