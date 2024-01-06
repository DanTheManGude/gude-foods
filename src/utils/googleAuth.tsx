import React from "react";
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import Typography from "@mui/material/Typography";

import { AddAlert } from "../types";
import { setHasLoggedInBefore } from "./utility";

export const signInGoogle = (addAlert: AddAlert) => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });

  signInWithPopup(auth, provider)
    .then((result) => {
      console.log(`login ${result.user.uid}`);
      setHasLoggedInBefore();
    })
    .catch((error) => {
      const { name, code } = error;
      addAlert({
        message: <Typography>{code}</Typography>,
        title: <Typography>{name}</Typography>,
        alertProps: { severity: "error" },
      });
    });
};

export const signOutGoogle = (addAlert: AddAlert) => {
  const auth = getAuth();

  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.log("no user currently logged in");
    return;
  }

  signOut(auth)
    .then(() => {
      console.log(`logout ${currentUser.uid}`);
    })
    .catch((error: Error) => {
      const { name, message } = error;
      addAlert({
        message: <Typography>{message}</Typography>,
        title: <Typography>{name}</Typography>,
        alertProps: { severity: "error" },
      });
    });
};
