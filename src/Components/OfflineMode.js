import { useState } from "react";

import Stack from "@mui/material/Stack";
import NavBar from "./AppPieces/NavBar";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

function OfflineMode() {
  const [showAlert, setShowAlert] = useState(true);

  const renderAlert = () => (
    <Collapse in={showAlert}>
      <Alert
        sx={{ width: { xs: "85%", md: "60%" } }}
        severity="info"
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              setShowAlert(false);
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle>Offline Mode</AlertTitle>
        Only viewing recipes that you import is available.
      </Alert>
    </Collapse>
  );

  return (
    <Stack alignItems="center">
      <NavBar isAuthorized={false} />
      {renderAlert()}
      {"More content"}
    </Stack>
  );
}

export default OfflineMode;
