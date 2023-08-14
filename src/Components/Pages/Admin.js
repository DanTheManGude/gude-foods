import { useNavigate } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";

function Settings(props) {
  const { actingUser, clearActingUser } = props;

  let navigate = useNavigate();

  const renderActingUserCard = () => {
    if (actingUser) {
      return (
        <Box sx={{ width: "95%" }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Acting as user
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
  };

  const renderUserManagmentCard = () => {
    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              User managment
            </Typography>
            <Typography>
              Change setting to allow any user access to an account without
              authorization and act as other users.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              color="secondary"
              variant="contained"
              onClick={() => navigate("/users")}
            >
              <Typography>View all users</Typography>
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  };

  const renderAppCard = () => {
    return (
      <Box sx={{ width: "95%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Application
            </Typography>
            <Typography>
              Current version: <strong>{process.env.REACT_APP_VERSION}</strong>
            </Typography>
            <Typography>
              The source code for this website is hosted&nbsp;
              <Link
                underline="none"
                href="https://github.com/DanTheManGude/gude-foods"
                target="_blank"
                rel="noopener"
                color="secondary"
              >
                {"here "}
                <OpenInNewIcon
                  fontSize="inherit"
                  sx={{ verticalAlign: "sub" }}
                />
              </Link>
              .
            </Typography>
          </CardContent>
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
        Admin
      </Typography>
      <Stack sx={{ paddingTop: "15px" }} spacing={3} alignItems="center">
        {renderActingUserCard()}
        {renderUserManagmentCard()}
        {renderAppCard()}
      </Stack>
    </div>
  );
}

export default Settings;
