import { getDatabase, ref, onValue } from "firebase/database";
import { User } from "firebase/auth";

import Typography, { TypographyProps } from "@mui/material/Typography";
import Stack, { StackProps } from "@mui/material/Stack";
import Button from "@mui/material/Button";

import { sendAuthorizationRequest } from "../../utils/requests";

import GoogleLoginButton from "./GoogleLoginButton";
import { useEffect, useState } from "react";
import UserCard from "../Utils/UserCard";
import { AddAlert } from "../../types";

const textStyles: TypographyProps["sx"] = {
  color: "primary.main",
  textAlign: "center",
};

const MainStack = (props: Partial<StackProps>) => (
  <Stack
    {...props}
    sx={{ paddingTop: 1.5 }}
    spacing={1.5}
    alignItems="center"
  />
);

function UnauthorizedUser(props: { user: User; addAlert: AddAlert }) {
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
    <MainStack>
      <Typography sx={textStyles}>
        You must be approved to create and save data.
      </Typography>
      <Button color="primary" variant="contained" onClick={handleNotifyClick}>
        <Typography>Request Access</Typography>
      </Button>
      <UserCard user={user} addAlert={addAlert} useOutlinedButton={true} />
    </MainStack>
  );

  const renderHasRequestedMessage = () => (
    <MainStack>
      <Typography sx={textStyles}>
        You have requested access. Check back here shortly.
      </Typography>
      <UserCard user={user} addAlert={addAlert} />
    </MainStack>
  );

  if (!!user) {
    if (!didRequest) {
      return rendeRequestMessageAndButton();
    }
    return renderHasRequestedMessage();
  }

  return (
    <MainStack>
      <Typography sx={textStyles}>
        Login or sign up with your Google account
      </Typography>
      <GoogleLoginButton addAlert={addAlert} />
    </MainStack>
  );
}

export default UnauthorizedUser;
