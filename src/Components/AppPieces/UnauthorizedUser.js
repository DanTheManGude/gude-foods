import emailjs from "@emailjs/browser";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import { getEmailLink } from "../../utils/utility";
import { emailConfig } from "../../constants";

import GoogleLoginButton from "./GoogleLoginButton";

const getSendAuthorizationRequest = (user, addAlert) => () => {
  const { serviceId, templateId, userId } = emailConfig;
  const { displayName, email } = user;
  const userInfo = { displayName, email };

  emailjs.send(serviceId, templateId, userInfo, userId).then(
    (response) => {
      addAlert(
        {
          message: (
            <span>
              Succesfully sent authorization request. You should recieve a
              confirmation email shortly (be sure to check your junk folder).
            </span>
          ),
          alertProps: { severity: "success" },
        },
        5000
      );
    },
    (error) => {
      addAlert(
        {
          message: (
            <span>
              An error occured when sending authorization request. You can reach
              out to&nbsp;
              <a href={getEmailLink(userInfo)}>dgude31@outlook.com</a>
              &nbsp;directly.
            </span>
          ),
          alertProps: { severity: "error" },
        },
        7000
      );
    }
  );
};

const textStyles = {
  color: "primary.main",
  textAlign: "center",
  width: "85%",
};

function UnauthorizedUser(props) {
  const { user, addAlert } = props;
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
          onClick={getSendAuthorizationRequest(user, addAlert)}
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
