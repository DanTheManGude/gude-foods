import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";

import DescriptionSharpIcon from "@mui/icons-material/DescriptionSharp";
import MenuBookSharpIcon from "@mui/icons-material/MenuBookSharp";
import SettingsSharpIcon from "@mui/icons-material/SettingsSharp";
import FormatListBulletedSharpIcon from "@mui/icons-material/FormatListBulletedSharp";
import Paper from "@mui/material/Paper";

function BottomNav(props) {
  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <BottomNavigation
        showLabels
        onChange={(event, newValue) => {
          console.log(newValue);
        }}
      >
        <BottomNavigationAction
          label="Glossary"
          icon={<DescriptionSharpIcon />}
        />
        <BottomNavigationAction
          label="Shopping"
          icon={<FormatListBulletedSharpIcon />}
        />
        <BottomNavigationAction label="Cookbook" icon={<MenuBookSharpIcon />} />
        <BottomNavigationAction label="Settings" icon={<SettingsSharpIcon />} />
        <BottomNavigationAction
          label="Login"
          icon={
            <img
              width="24px"
              src="/media/googleLogin/G.png"
              alt="Login with Google"
            />
          }
        />
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
