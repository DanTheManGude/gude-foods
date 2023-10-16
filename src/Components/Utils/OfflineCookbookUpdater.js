import { useEffect, useState, useContext, useRef } from "react";

//import { saveCookbookToLocalStorage } from "../../utils/dataTransfer";
import { DatabaseContext, AddAlertContext } from "../Contexts";

function OfflineCookbookUpdater() {
  const addAlert = useContext(AddAlertContext);
  const { cookbook, glossary } = useContext(DatabaseContext);

  const [didInitialize, setDidInitialize] = useState(false);

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
      cookbook &&
      glossaryRef.current &&
      addAlertRef.current
    ) {
      console.log(
        "cookbook-glossary-addAlert",
        cookbook,
        glossaryRef.current,
        addAlertRef.current
      );
    }
  }, [cookbook]);

  useEffect(() => {
    if (!didInitialize && cookbook && glossary && addAlert) {
      console.log("all true, initial");
      setDidInitialize(true);
    }
  }, [cookbook, glossary, addAlert, didInitialize]);
}

export default OfflineCookbookUpdater;
