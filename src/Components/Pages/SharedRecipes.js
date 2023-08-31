import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function SharedRecipes(props) {
  const { sharedRecipes } = props;

  const renderSharedRecipe = ([sharedId, sharedRecipe]) => {
    const { info, recipeData, lastViewed } = sharedRecipe;
    const { recipeId, shareDate, userId } = info;
    const { name } = recipeData;

    return (
      <Accordion key={sharedId}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Typography key="lastViewed">{lastViewed}</Typography>
            <Typography key="shareDate">{shareDate}</Typography>
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
