import { Link } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

function Home(props) {
  const { glossary, basicFoodTagAssociation } = props;

  const renderGlossaryCard = () => {
    const count =
      glossary &&
      glossary.basicFoods &&
      basicFoodTagAssociation &&
      Object.keys(glossary.basicFoods).filter(
        (foodId) => !basicFoodTagAssociation.hasOwnProperty(foodId)
      ).length;

    if (!count) {
      return null;
    }

    return (
      <Box sx={{ width: "90%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Glossary
            </Typography>
            <Typography>
              There are <strong>{count}</strong> basic foods with no department.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button color="secondary" variant="outlined">
              <Link to={`/glossary`}>
                <Typography color="secondary">Go to Glossary</Typography>
              </Link>
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
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
        Home
      </Typography>
      <Stack sx={{ paddingTop: "15px" }} spacing={3} alignItems="center">
        {renderGlossaryCard()}
        {/* {renderShoppingListCard()}
        {renderCookbookCard()}
        {renderRecipeCard()} */}
      </Stack>
    </div>
  );
}

export default Home;
