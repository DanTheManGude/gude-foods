import Switch from "@mui/material/Switch";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarIcon from "@mui/icons-material/Star";

const iconSwitchStyles = {
  color: "alt.main",
  borderColor: "alt.main",
  borderWidth: "1px",
  borderStyle: "solid",
  borderRadius: "12px",
};

function FavoriteSwitch(props) {
  const { isChecked, updateChecked } = props;

  return (
    <Switch
      checked={isChecked}
      onChange={(event) => {
        updateChecked(event.target.checked);
      }}
      color="tertiary"
      checkedIcon={
        <StarIcon
          sx={{
            ...iconSwitchStyles,
            transform: "translate(-2px, -8px)",
          }}
          fontSize="small"
        />
      }
      icon={
        <StarOutlineIcon
          sx={{
            ...iconSwitchStyles,
            transform: "translate(-8px, -8px)",
          }}
          fontSize="small"
        />
      }
      sx={{
        padding: 0,
        height: "24px",
        width: "50px",
        borderRadius: "12px",
      }}
    />
  );
}

export default FavoriteSwitch;
