import emailjs from "@emailjs/browser";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import { sendAuthorizationRequest } from "../../utils/utility";

import GoogleLoginButton from "./GoogleLoginButton";

const textStyles = {
  color: "primary.main",
  textAlign: "center",
  width: "85%",
};

function UnauthorizedUser(props) {
  const { user, addAlert } = props;

  const handleNotifyClick = () => {
    sendAuthorizationRequest(user, addAlert);
  };

  if (!!user) {
    return (
      <Stack sx={{ paddingTop: "15px" }} spacing={3} alignItems="center">
        <Typography sx={textStyles}>
          You must be authorized with the admin before you are able to use the
          site.
        </Typography>
        <Typography sx={textStyles}>
          You can notify the admin that you would like to be an authorized user.
        </Typography>
        <Button
          color="secondary"
          variant="outlined"
          onClick={handleNotifyClick}
        >
          <Typography>Notify admin</Typography>
        </Button>
      </Stack>
    );
  }

  return (
    <Stack sx={{ paddingTop: "15px" }} spacing={3} alignItems="center">
      <Typography sx={textStyles}>
        Please sign in with Google to use the app.
      </Typography>
      <GoogleLoginButton addAlert={addAlert} />
    </Stack>
  );
}

export default UnauthorizedUser;
