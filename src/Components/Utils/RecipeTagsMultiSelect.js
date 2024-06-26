import { useContext } from "react";

import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { DataPathsContext } from "../Contexts";
import { createRecipeTag } from "../../utils/requests";

function RecipeTagsMultiSelect(props) {
  const { glossary, tagsList, updateTagsList } = props;

  const { glossaryPath } = useContext(DataPathsContext);

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
      <Box sx={{ width: "80%" }}>
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
          filterOptions={(options, params) => {
            const { inputValue, getOptionLabel } = params;
            const filtered = options.filter((option) =>
              getOptionLabel(option)
                .toLocaleUpperCase()
                .includes(inputValue.toUpperCase())
            );
            const isExisting = options.some(
              (option) => inputValue === option.title
            );
            if (inputValue !== "" && !isExisting) {
              filtered.push({
                inputValue,
                title: `Create "${inputValue}"`,
              });
            }
            return filtered;
          }}
          value={tagsList.map((tagId) => ({
            tagId,
            title: glossary.recipeTags[tagId],
          }))}
          onChange={(event, selection) => {
            const inputValue = selection.length && selection.at(-1).inputValue;
            if (inputValue) {
              createRecipeTag(
                glossaryPath,
                (newTagId) => {
                  const newTagsList = selection
                    .toSpliced(-1, 1, { tagId: newTagId })
                    .map((option) => option.tagId);
                  updateTagsList(newTagsList);
                },
                inputValue
              );
              return;
            }
            updateTagsList(selection.map((option) => option.tagId));
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
