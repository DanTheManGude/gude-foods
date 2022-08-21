import emailjs from "emailjs-com";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

const emailConfig = {
  serviceId: "service_sbv0ia4",
  templateId: "template_214p9la",
  userId: "user_2K4sBJkaEW2m7T8CPrYhp",
};
const getEmailLink = ({ displayName, email }) =>
  `mailto:dgude31@outlook.com?subject=Gude%20Foods%20Authirization&body=Hello%2C%0D%0A%0D%0AI%20would%20like%20to%20have%20access%20to%20the%20Gude%20Foods%20website%20functionality%2C%20but%20the%20request%20button%20did%20not%20work.%20My%20name%20is%2C%20${displayName}%2C%20and%20my%20email%20is%2C%20${email}.%0D%0A%0D%0AThhank%20you!`;

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
function UnauthorizedUser(props) {
  const { user, addAlert } = props;
  if (!!user) {
    return (
      <Stack sx={{ paddingTop: "15px" }} spacing={3} alignItems="center">
        <Typography
          sx={{
            color: "primary.main",
            textAlign: "center",
            width: "80%",
          }}
        >
          You must be authorized with the admin before you are able to use the
          site.
        </Typography>
        <Typography
          sx={{
            color: "primary.main",
            textAlign: "center",
            width: "80%",
          }}
        >
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
      <Typography
        sx={{
          color: "primary.main",
          textAlign: "center",
          width: "80%",
        }}
      >
        Please sign in with Google to use the app.
      </Typography>
    </Stack>
  );
}

export default UnauthorizedUser;
