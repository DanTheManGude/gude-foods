import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Chip from "@mui/material/Chip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import FavoriteTag from "../Utils/FavoriteTag";

function OfflineCookbook(props) {
  const { cookbook, setRecipe } = props;

  return (
    <Stack spacing={1} width={"95%"}>
      {Object.entries(cookbook).map(([name, recipeData], index) => {
        const { description, tags, isFavorite } = recipeData;
        const fullRecipe = { name, ...recipeData };

        return (
          <Accordion key={`recipe-${index}`}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {description && (
                  <Typography key="description" fontWeight="fontWeightMedium">
                    {description}
                  </Typography>
                )}
                <Stack
                  spacing={2}
                  direction="row"
                  justifyContent="space-around"
                  alignItems="center"
                >
                  <Button
                    color="secondary"
                    variant="outlined"
                    size="medium"
                    sx={{ flex: 1 }}
                    onClick={() => {}}
                  >
                    <Typography>Download</Typography>
                  </Button>
                  <Button
                    color="primary"
                    variant="contained"
                    size="medium"
                    sx={{ flex: 1 }}
                    onClick={() => {
                      setRecipe(fullRecipe);
                    }}
                  >
                    <Typography color="primary.contrastText">
                      View recipe
                    </Typography>
                  </Button>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap={true}
                >
                  {isFavorite && <FavoriteTag />}
                  {tags.map((tagName, index) => (
                    <Chip
                      key={`tag-${index}`}
                      label={<Typography>{tagName}</Typography>}
                      size="small"
                      variant="contained"
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
}

export default OfflineCookbook;
