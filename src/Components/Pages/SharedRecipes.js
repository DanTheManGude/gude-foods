import { useContext, useState } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { removeSharedRecipe } from "../../utils/requests";

import { AddAlertContext, DataPathsContext } from "../Contexts";

import DeleteDialog from "../Utils/DeleteDialog";

function SharedRecipes(props) {
  const { sharedRecipes, accounts } = props;

  //let navigate = useNavigate();
  const addAlert = useContext(AddAlertContext);
  const dataPaths = useContext(DataPathsContext);
  const { cookbookPath } = dataPaths;

  const [deleteSharedId, setDeleteSharedId] = useState();

  const closeDeleteDialog = () => {
    setDeleteSharedId();
  };

  if (!accounts) {
    return null;
  }

  const renderSharedRecipe = ([sharedId, sharedRecipe]) => {
    const { info, recipeData, lastViewed } = sharedRecipe;
    const { recipeId, shareDate, userId } = info;
    const { name: recipeName } = recipeData;

    const lastViewedMessage = lastViewed
      ? `Last viewed: ${new Date(lastViewed).toLocaleString()}`
      : "Not viewed";

    const sharedDateMessage = `Shared on: ${new Date(
      shareDate
    ).toLocaleDateString()}`;

    const createdByMessage = `Created by: ${accounts[userId].name}`;

    return (
      <Accordion key={sharedId} sx={{ width: "95%" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{recipeName}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <Typography key="details">
              {lastViewedMessage}
              <br />
              {sharedDateMessage}
              <br />
              {createdByMessage}
            </Typography>
            <Stack
              key="actions"
              spacing={2}
              direction="row"
              justifyContent="space-around"
              alignItems="center"
            >
              <Button
                color="error"
                variant="outlined"
                size="large"
                sx={{ flex: 1 }}
                onClick={() => {
                  setDeleteSharedId(sharedId);
                }}
              >
                <Typography>Delete</Typography>
              </Button>
              <Button
                color="primary"
                variant="contained"
                size="large"
                sx={{ flex: 1 }}
                onClick={() => {
                  console.log("view");
                  //navigate(`/recipe/${recipeId}`);
                }}
              >
                <Typography color="primary.contrastText">
                  View recipe
                </Typography>
              </Button>
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderSharedRecipes = () => {
    if (!sharedRecipes) {
      return <Typography>Ope, there are no shared recipes.</Typography>;
    }

    return Object.entries(sharedRecipes)
      .sort((entryA, entryB) => entryB[1].lastViewed - entryA[1].lastViewed)
      .map(renderSharedRecipe);
  };

  const getDeleteMessage = () => {
    if (!deleteSharedId) {
      return "";
    }

    const {
      recipeData: { name: recipeName },
      info: { userId },
    } = sharedRecipes[deleteSharedId];

    return `the recipe ${recipeName} created by ${accounts[userId].name}`;
  };

  return (
    <div>
      <Typography
        variant="h4"
        sx={{
          color: "primary.main",
          textAlign: "center",
          paddingY: 2,
        }}
      >
        Shared Recipes
      </Typography>
      <Stack spacing={2} alignItems="center">
        {renderSharedRecipes()}
      </Stack>
      <DeleteDialog
        open={!!deleteSharedId}
        onClose={closeDeleteDialog}
        titleDO="shared recipe"
        comfirmationMessageDO={getDeleteMessage()}
        handleDelete={() => {
          closeDeleteDialog();
          removeSharedRecipe(
            deleteSharedId,
            `${cookbookPath}/${sharedRecipes[deleteSharedId].info.recipeId}`,
            addAlert
          );
        }}
      />
    </div>
  );
}

export default SharedRecipes;
