import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

import { signOutGoogle } from "../../utils/googleAuth";

function UserCard(props) {
  const { user, addAlert } = props;

  const handleLogout = () => {
    signOutGoogle(addAlert);
  };

  if (!user) {
    return;
  }
  return (
    <Box sx={{ width: "95%" }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Current user
          </Typography>
          <Typography>
            You are currently logged in as: <strong>{user.email}</strong>
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button color="secondary" variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}

export default UserCard;