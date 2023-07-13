import Chip from "@mui/material/Chip";
import StarIcon from "@mui/icons-material/Star";

function FavoriteTag() {
  return (
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
  );
}

export default FavoriteTag;
