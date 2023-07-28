import { useNavigate, useLocation } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

function ShareRecipe(props) {
  const { isAuthorized } = props;

  let navigate = useNavigate();
  let location = useLocation();
  const { search } = location;
  const params = new URLSearchParams(search);
  const recipeData = params.get("recipeData");

  if (!recipeData) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ paddingTop: 2 }}>
        <Typography variant="h6">
          It looks like there is no recipe being shared.
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            navigate("/");
          }}
        >
          Go to home page
        </Button>
      </Stack>
    );
  }
}

export default ShareRecipe;
