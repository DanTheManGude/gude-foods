import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function SharedRecipes(props) {
  const { sharedRecipes, accounts } = props;

  const renderSharedRecipe = ([sharedId, sharedRecipe]) => {
    const { info, recipeData, lastViewed } = sharedRecipe;
    const { recipeId, shareDate, userId } = info;
    const { name } = recipeData;

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
          <Typography variant="h6">{name}</Typography>
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
                  console.log("remove");
                }}
              >
                <Typography>Remove</Typography>
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
    </div>
  );
}

export default SharedRecipes;
