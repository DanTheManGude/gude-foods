import { useState, useContext } from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";

import {
  AddAlertContext,
  DataPathsContext,
  DatabaseContext,
} from "../Contexts";
import FavoriteTag from "./FavoriteTag";

import { defaultColorKey, colorOptions } from "../../constants";
import { uploadColors } from "../../utils/requests";

const labelText = "Select theme";

function ColorCard({ showingOnHome }) {
  const dataPaths = useContext(DataPathsContext);
  const database = useContext(DatabaseContext);
  const addAlert = useContext(AddAlertContext);

  const { colorKeyPath } = dataPaths;
  const { colorKey: _colorKey } = database;
  const colorKey = _colorKey || defaultColorKey;

  const [shouldShowPreview, setShouldShowPreview] = useState(false);

  const updateColors = (givenColorKey) => {
    uploadColors(colorKeyPath, givenColorKey, addAlert);
  };

  const renderPreview = () => {
    if (!shouldShowPreview) {
      return null;
    }

    return (
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-around"
        >
          <Button color="primary" variant="contained">
            <Typography>Primary filled</Typography>
          </Button>
          <Button color="secondary" variant="contained">
            <Typography>Secondary filled</Typography>
          </Button>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-around"
        >
          <Button color="error" variant="contained">
            <Typography>Delete action</Typography>
          </Button>
          <Button color="secondary" variant="outlined">
            <Typography>Secondary outlined</Typography>
          </Button>
        </Stack>

        <Stack direction="row" spacing={1}>
          <FavoriteTag />
          <Chip
            label={<Typography>Tag A</Typography>}
            size="small"
            variant="contained"
            color="tertiary"
          />
          <Chip
            label={<Typography>Tag B</Typography>}
            size="small"
            variant="contained"
            color="tertiary"
          />
        </Stack>
      </Stack>
    );
  };

  return (
    <Box sx={{ width: "95%" }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Theme
          </Typography>
          <Stack sx={{ width: "100%" }} spacing={3}>
            <Typography style={{ whiteSpace: "pre-line" }}>
              Change the colors used in the app for your account.
              {showingOnHome &&
                "\nYou can change these settings later on the Settings page."}
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="flex-end"
            >
              <Button
                color="primary"
                variant="outlined"
                onClick={() => {
                  setShouldShowPreview(!shouldShowPreview);
                }}
              >
                <Typography>
                  {shouldShowPreview ? "Hide preview" : "Show preview"}
                </Typography>
              </Button>
              <FormControl
                size="small"
                variant="outlined"
                sx={{ width: "80%", maxWidth: "200px" }}
              >
                <InputLabel>{labelText}</InputLabel>
                <Select
                  value={colorKey}
                  onChange={(event) => {
                    updateColors(event.target.value);
                    setShouldShowPreview(true);
                  }}
                  label={labelText}
                >
                  {colorOptions.map((option) => (
                    <MenuItem key={option.key} value={option.key}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            {renderPreview()}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ColorCard;
