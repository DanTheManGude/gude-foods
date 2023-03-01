import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function AiRecipe(props) {
  const { database, dataPaths, addAlert, givenRecipe } = props;

  const {
    name: givenName,
    ingredients: givenIngredients,
    instructions: givenInstructions,
  } = givenRecipe;

  const renderName = () => {
    return (
      <Typography
        key="title"
        variant="h5"
        sx={{
          color: "primary.main",
          textAlign: "left",
          width: "100%",
          marginBottom: 1,
        }}
      >
        {givenName}
      </Typography>
    );
  };

  return (
    <Stack
      sx={{ paddingTop: "15px", width: "100%" }}
      spacing={0}
      alignItems="center"
    >
      {/* {renderTopButtonControls()} */}
      <Stack key="contents" spacing={2} sx={{ width: "95%", marginTop: 3 }}>
        {renderName()}
        {/* {renderIngredients()}
        {renderInstructions()}
        {renderNotes()}
        {renderTags()} */}
      </Stack>
    </Stack>
  );
}

export default AiRecipe;
