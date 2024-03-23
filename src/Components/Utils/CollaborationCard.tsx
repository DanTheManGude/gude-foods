import { useContext } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import IconButton from "@mui/material/IconButton/IconButton";

import {
  AddAlertContext,
  DataPathsContext,
  DatabaseContext,
  UserContext,
} from "../Contexts";

function CollaborationCard() {
  const user = useContext(UserContext);
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
              ID to allow them to view your data. You can specify which parts
              they can edit.
            </Typography>
            <Stack direction={"row"} flexWrap={"wrap"} alignItems={"center"}>
              <Typography>
                Share your UID for somone else to give you access. &nbsp;
              </Typography>
              <Typography>
                <code>{user.uid}</code>
              </Typography>
              <IconButton
                size={"small"}
                color="primary"
                onClick={() => {
                  navigator.clipboard.writeText(user.uid);
                }}
              >
                <ContentCopyRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CollaborationCard;
