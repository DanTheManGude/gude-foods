import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";

import FavoriteSwitch from "../Utils/FavoriteSwitch";
import FavoriteTag from "../Utils/FavoriteTag";

import { createKey, updateRequest } from "../../utils/requests";

export const renderEditingButtons = (onCancel, onSave) => (
  <>
    <Button
      key="cancel"
      color="secondary"
      variant="contained"
      size="small"
      sx={{ flexGrow: "1" }}
      onClick={onCancel}
    >
      <Typography>Cancel</Typography>
    </Button>
    <Button
      key="save"
      color="primary"
      variant="contained"
      size="small"
      onClick={onSave}
      sx={{ flexGrow: "1" }}
    >
      <Typography>Save</Typography>
    </Button>
  </>
);

export const renderNameInput = (name, updateName, error) => (
  <TextField
    label="Name"
    variant="filled"
    error={error}
    helperText={error && "Enter something"}
    multiline={true}
    value={name}
    onChange={(event) => {
      updateName(event.target.value);
    }}
  />
);

export const renderDescriptionInput = (description, updateDescription) => (
  <TextField
    label="Description"
    variant="standard"
    multiline={true}
    value={description}
    onChange={(event) => {
      updateDescription(event.target.value);
    }}
  />
);

export const renderNotesContainer = (renderedContents) => (
  <Paper elevation={2} sx={{ width: "100%" }}>
    <Box sx={{ padding: 2 }}>{renderedContents}</Box>
  </Paper>
);

export const renderNotesInput = (notes, updateNotes) => (
  <TextField
    label="Enter Notes"
    fullWidth={true}
    multiline={true}
    value={notes}
    onChange={(event) => {
      updateNotes(event.target.value);
    }}
    variant="standard"
  />
);

const renderFavorite = (editable, isFavorite, updateIsFavorite) => {
  if (editable) {
    return (
      <FavoriteSwitch isChecked={isFavorite} updateChecked={updateIsFavorite} />
    );
  }

  if (isFavorite) {
    return <FavoriteTag />;
  }

  return null;
};

export const renderTagList = (
  editable,
  { tags, isFavorite },
  updateIsFavorite,
  getDeleteTagHandler,
  glossaryRecipeTags
) => (
  <Stack
    direction="row"
    spacing={1}
    key="tags"
    sx={{ width: "95%" }}
    alignItems={"center"}
    flexWrap="wrap"
    useFlexGap="true"
  >
    {renderFavorite(editable, isFavorite, updateIsFavorite)}
    {tags.map((tagId) => (
      <Chip
        key={tagId}
        label={<Typography>{glossaryRecipeTags[tagId]}</Typography>}
        size="small"
        variant="contained"
        color="tertiary"
        onDelete={editable ? getDeleteTagHandler(tagId) : undefined}
      />
    ))}
  </Stack>
);

export const renderTagControls = (
  tags,
  addTag,
  glossaryRecipeTags,
  glossaryPath
) => (
  <Autocomplete
    id={"addtagSelect"}
    options={
      glossaryRecipeTags
        ? Object.keys(glossaryRecipeTags).map((tagId) => ({
            tagId,
            title: glossaryRecipeTags[tagId],
          }))
        : []
    }
    getOptionLabel={(option) => option.title}
    getOptionDisabled={(option) => tags.includes(option.tagId)}
    filterOptions={(options, params) => {
      const { inputValue, getOptionLabel } = params;
      const filtered = options.filter((option) =>
        getOptionLabel(option)
          .toLocaleUpperCase()
          .includes(inputValue.toUpperCase())
      );
      const isExisting = options.some((option) => inputValue === option.title);
      if (inputValue !== "" && !isExisting) {
        filtered.push({
          inputValue,
          title: `Create "${inputValue}"`,
        });
      }
      return filtered;
    }}
    value={null}
    onChange={(event, selectedOption) => {
      const { tagId: _tagId, inputValue } = selectedOption;
      let tagId = _tagId;
      if (inputValue) {
        tagId = createKey(`${glossaryPath}/recipeTags`);
        updateRequest({
          [`${glossaryPath}/recipeTags/${tagId}`]: inputValue,
        });
      }
      addTag(tagId);
    }}
    renderInput={(params) => (
      <TextField {...params} label="Enter tag" size="small" />
    )}
    blurOnSelect={true}
    clearOnBlur={true}
  />
);
