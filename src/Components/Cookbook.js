import { useState } from "react";
import { Link } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import StarIcon from "@mui/icons-material/Star";
import Tooltip from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Box from "@mui/material/Box";

import { updateRequest } from "../utils";

function Cookbook(props) {
  const {
    glossary,
    cookbook = {},
    updatePath,
    addAlert,
    filteringOptions = {},
    setFilteringOptions,
  } = props;

  const [advancedFiltersTooltipOpen, setAdvancedFiltersTooltipOpen] =
    useState(false);
  const { searchTerm = "" } = filteringOptions;

  const renderSearchAndFilters = () =>
    !cookbook ? null : (
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-around"
        alignItems="center"
        sx={{ width: "95%" }}
      >
        <TextField
          key="search"
          variant="outlined"
          sx={{ flexGrow: "1" }}
          label={<Typography>Search</Typography>}
          value={searchTerm}
          onChange={(event) => {
            setFilteringOptions((_filteringOptions) => ({
              ..._filteringOptions,
              searchTerm: event.target.value.toUpperCase(),
            }));
          }}
          InputProps={{
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  sx={{ color: "alt.main" }}
                  onClick={() => {
                    setFilteringOptions((_filteringOptions) => ({
                      ..._filteringOptions,
                      searchTerm: "",
                    }));
                  }}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ flexGrow: "3", maxWidth: "40%" }}>
          <ClickAwayListener
            onClickAway={() => {
              setAdvancedFiltersTooltipOpen(false);
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Tooltip
                PopperProps={{
                  disablePortal: true,
                }}
                open={advancedFiltersTooltipOpen}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                arrow
                placement="top"
                title="Advanced filters coming soon"
              >
                <span
                  onClick={() => {
                    setAdvancedFiltersTooltipOpen(
                      (_advancedFiltersTooltipOpen) =>
                        !_advancedFiltersTooltipOpen
                    );
                  }}
                >
                  <Button
                    color="secondary"
                    variant="outlined"
                    disabled={true}
                    sx={{ width: "100%" }}
                  >
                    <Typography>
                      <span>Advanced</span>
                      <br />
                      <span>filters</span>
                    </Typography>
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </ClickAwayListener>
        </Box>
      </Stack>
    );

  const renderRecipeStack = () => {
    if (!cookbook) {
      return null;
    }
    const recipeList = Object.keys(cookbook);
    return (
      <Stack sx={{ width: "95%" }} spacing={1}>
        {recipeList
          .filter((recipeId) =>
            cookbook[recipeId].name.toUpperCase().includes(searchTerm)
          )
          .map((recipeId) => {
            const {
              name = "Unknown name",
              ingredients = [],
              tags = [],
              isFavorite = false,
            } = cookbook[recipeId];

            return (
              <Accordion key={recipeId}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={3}>
                    <Stack
                      spacing={2}
                      direction="row"
                      justifyContent="space-around"
                      alignItems="center"
                    >
                      <Button
                        color="secondary"
                        variant="outlined"
                        size="large"
                        sx={{ flex: 1 }}
                      >
                        <Link to={`/recipe/${recipeId}/`}>
                          <Typography color="secondary">
                            View full recipe
                          </Typography>
                        </Link>
                      </Button>
                      <Button
                        color="secondary"
                        variant="outlined"
                        size="large"
                        sx={{ flex: 1 }}
                        onClick={() => {
                          updateRequest(
                            Object.keys(ingredients).reduce(
                              (updates, foodId) => ({
                                ...updates,
                                [`${updatePath}/${foodId}/list/${recipeId}`]: true,
                              }),
                              {}
                            ),
                            addAlert
                          );
                        }}
                      >
                        <Typography>Add to shopping list</Typography>
                      </Button>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      {isFavorite && (
                        <Chip
                          key={"favorite"}
                          label={
                            <StarIcon
                              sx={{
                                "&&": {
                                  color: "alt.main",
                                  verticalAlign: "bottom",
                                },
                              }}
                              fontSize="small"
                            />
                          }
                          size="small"
                          variant="outlined"
                          color="tertiary"
                        />
                      )}
                      {tags.map((tagId) => (
                        <Chip
                          key={tagId}
                          label={
                            <Typography>
                              {glossary.recipeTags[tagId]}
                            </Typography>
                          }
                          size="small"
                          variant="outlined"
                          color="tertiary"
                        />
                      ))}
                    </Stack>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
      </Stack>
    );
  };

  return (
    <div>
      <Typography
        variant="h4"
        sx={{
          color: "primary.main",
          textAlign: "center",
          paddingY: 2,
        }}
      >
        Cookbook
      </Typography>
      <Stack sx={{ paddingTop: "15px" }} spacing={3} alignItems="center">
        {renderSearchAndFilters()}
        <Button color="primary" variant="contained">
          <Link to={`/recipe/create`}>
            <Typography color="primary.contrastText">Add new recipe</Typography>
          </Link>
        </Button>
        {renderRecipeStack()}
      </Stack>
    </div>
  );
}

export default Cookbook;
