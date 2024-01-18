import { useEffect, useState, useContext, useRef } from "react";

import Typography from "@mui/material/Typography";

import { saveCookbookToLocalStorage } from "../../utils/dataTransfer";
import { DatabaseContext, AddAlertContext } from "../Contexts";

function OfflineCookbookUpdater() {
  const addAlert = useContext(AddAlertContext);
  const { cookbook, glossary } = useContext(DatabaseContext);

  const [didInitialize, setDidInitialize] = useState(false);

  const cookbookRef = useRef(cookbook);
  const glossaryRef = useRef(glossary);
  const addAlertRef = useRef(addAlert);
  const didInitializeRef = useRef(didInitialize);

  useEffect(() => {
    glossaryRef.current = glossary;
  }, [glossary]);

  useEffect(() => {
    addAlertRef.current = addAlert;
  }, [addAlert]);

  useEffect(() => {
    didInitializeRef.current = didInitialize;
  }, [didInitialize]);

  useEffect(() => {
    if (
      didInitializeRef.current &&
      glossaryRef.current &&
      addAlertRef.current &&
      cookbook &&
      JSON.stringify(cookbook) !== JSON.stringify(cookbookRef.current)
    ) {
      saveCookbookToLocalStorage(
        { cookbook, glossary: glossaryRef.current },
        addAlertRef.current
      );
    }
    cookbookRef.current = cookbook;
  }, [cookbook]);

  useEffect(() => {
    if (!didInitialize && cookbook && glossary && addAlert) {
      saveCookbookToLocalStorage(
        { cookbook, glossary },
        () => {
          addAlert({
            message: (
              <Typography>Cookbook has been saved for offline use.</Typography>
            ),
            alertProps: { severity: "info" },
          });
        },
        () => {
          addAlert({
            message: (
              <Typography>
                There was an error trying to save the cookbook for offline use.
              </Typography>
            ),
            alertProps: { severity: "error" },
          });
        }
      );
      setDidInitialize(true);
    }
  }, [cookbook, glossary, addAlert, didInitialize]);
}

export default OfflineCookbookUpdater;
