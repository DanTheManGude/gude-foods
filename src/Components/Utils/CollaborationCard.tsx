import { useContext } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import {
  AddAlertContext,
  DataPathsContext,
  DatabaseContext,
} from "../Contexts";

function CollaborationCard() {
  const dataPaths = useContext(DataPathsContext);
  const database = useContext(DatabaseContext);
  const addAlert = useContext(AddAlertContext);

  const { collaboration } = database;

  console.log(collaboration);

  return (
    <Box sx={{ width: "95%" }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Collaboration
          </Typography>
          <Stack sx={{ width: "100%" }} spacing={3}>
            <Typography>
              Alow other users to view/ edit your information. Paste their User
              ID to allow them to view all of your data. You can specift which
              parts they can edit.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CollaborationCard;
