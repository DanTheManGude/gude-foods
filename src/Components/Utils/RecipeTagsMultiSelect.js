import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function RecipeTagsMultiSelect(props) {
  const { glossary, tagsList, updateTagsList } = props;
  return (
    <Stack
      key="tagsIncludes"
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1}
      sx={{ width: "100%" }}
    >
      <Box sx={{ width: "20%" }}>
        <Typography>Has tags:</Typography>
      </Box>
      <Box sx={{ width: "70%" }}>
        <Autocomplete
          multiple={true}
          limitTags={3}
          id="multiple-limit-tags"
          options={
            glossary && glossary.recipeTags
              ? Object.keys(glossary.recipeTags).map((tagId) => ({
                  tagId,
                  title: glossary.recipeTags[tagId],
                }))
              : []
          }
          getOptionLabel={(option) => option.title}
          getOptionDisabled={(option) => tagsList.includes(option.tagId)}
          isOptionEqualToValue={(optionA, optionB) =>
            optionA.tagId === optionB.tagId
          }
          value={tagsList.map((tagId) => ({
            tagId,
            title: glossary.recipeTags[tagId],
          }))}
          onChange={(event, selection) => {
            const newTagsList = selection.map((option) => option.tagId);
            updateTagsList(newTagsList);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Tags" placeholder="Enter tags" />
          )}
          ChipProps={{
            color: "tertiary",
            variant: "contained",
          }}
        />
      </Box>
    </Stack>
  );
}

export default RecipeTagsMultiSelect;
