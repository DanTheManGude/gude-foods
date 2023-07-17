import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

import { signOutGoogle } from "../../utils/googleAuth";

function UserCard(props) {
  const { user, actingUser, clearActingUser, addAlert } = props;

  const handleLogout = () => {
    signOutGoogle(addAlert);
  };

  if (actingUser) {
    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Current user
            </Typography>
            <Typography>
              You are currently acting as:&nbsp;
              <strong>{actingUser.displayName}</strong>
              <br />
              <code>{actingUser.uid}</code>
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              color="primary"
              variant="contained"
              onClick={clearActingUser}
            >
              <Typography>Back to own user</Typography>
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  }

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
          <Button color="primary" variant="contained" onClick={handleLogout}>
            <Typography>Logout</Typography>
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}

export default UserCard;
