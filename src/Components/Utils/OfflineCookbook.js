import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

function OfflineCookbook(props) {
  const { cookbook, setRecipe } = props;

  return (
    <Stack spacing={2} width={"95%"}>
      {Object.entries(cookbook).map(([name, recipeData], index) => (
        <Button
          key={index}
          variant="outlined"
          color="secondary"
          onClick={() => setRecipe({ name, ...recipeData })}
        >
          <Typography>{name}</Typography>
        </Button>
      ))}
    </Stack>
  );
}

export default OfflineCookbook;
