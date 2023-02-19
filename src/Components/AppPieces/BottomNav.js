import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";

import DescriptionSharpIcon from "@mui/icons-material/DescriptionSharp";
import MenuBookSharpIcon from "@mui/icons-material/MenuBookSharp";
import SettingsSharpIcon from "@mui/icons-material/SettingsSharp";
import FormatListBulletedSharpIcon from "@mui/icons-material/FormatListBulletedSharp";

function BottomNav(props) {
  return (
    <BottomNavigation
      showLabels={true}
      onChange={(event, newValue) => {
        console.log(newValue);
      }}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: "10px",
        height: "80px",
        alignItems: "flex-start",
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
            style={{ borderRadius: "24px" }}
          />
        }
      />
    </BottomNavigation>
  );
}

export default BottomNav;
