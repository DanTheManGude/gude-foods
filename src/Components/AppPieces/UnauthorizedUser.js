import { getDatabase, ref, onValue } from "firebase/database";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import { sendAuthorizationRequest } from "../../utils/requests";

import GoogleLoginButton from "./GoogleLoginButton";
import { useEffect, useState } from "react";

const textStyles = {
  color: "primary.main",
  textAlign: "center",
  width: "85%",
};

function UnauthorizedUser(props) {
  const { user, addAlert } = props;

  const [didRequest, setDidRequest] = useState(false);

  useEffect(() => {
    if (user) {
      onValue(ref(getDatabase(), `requestedUsers/${user.uid}`), (snapshot) => {
        if (snapshot.exists()) {
          setDidRequest(true);
        }
      });
    }
  }, [user]);

  const handleNotifyClick = () => {
    sendAuthorizationRequest(user, addAlert);
  };

  const rendeRequestMessageAndButton = () => (
    <Stack sx={{ paddingTop: "15px" }} spacing={3} alignItems="center">
      <Typography sx={textStyles}>
        You must be authorized to use the site.
      </Typography>
      <Typography sx={textStyles}>
        You can request that you would like to be authorized.
      </Typography>
      <Button color="primary" variant="contained" onClick={handleNotifyClick}>
        <Typography>Request Access</Typography>
      </Button>
    </Stack>
  );

  const renderHasRequestedMessage = () => (
    <Stack sx={{ paddingTop: "15px" }} alignItems="center">
      <Typography sx={textStyles}>
        You have requested access. Check back here shortly.
      </Typography>
    </Stack>
  );

  if (!!user) {
    if (!didRequest) {
      return rendeRequestMessageAndButton();
    }
    return renderHasRequestedMessage();
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
