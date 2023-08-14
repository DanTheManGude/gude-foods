import { useLocation, useNavigate } from "react-router-dom";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import DescriptionSharpIcon from "@mui/icons-material/DescriptionSharp";
import MenuBookSharpIcon from "@mui/icons-material/MenuBookSharp";
import SettingsSharpIcon from "@mui/icons-material/SettingsSharp";
import FormatListBulletedSharpIcon from "@mui/icons-material/FormatListBulletedSharp";
import HouseSharp from "@mui/icons-material/HouseSharp";
import BuildSharpIcon from "@mui/icons-material/BuildSharp";

import { getPages, presentationNames } from "../../constants";

const pageIcons = {
  glossary: <DescriptionSharpIcon />,
  shoppingList: <FormatListBulletedSharpIcon />,
  cookbook: <MenuBookSharpIcon />,
  home: <HouseSharp />,
  settings: <SettingsSharpIcon />,
  admin: <BuildSharpIcon />,
};

function BottomNav(props) {
  const { isAdmin } = props;
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <BottomNavigation
      showLabels={true}
      value={pathname.slice(1)}
      onChange={(event, newValue) => {
        navigate(`/${newValue}`);
      }}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: "10px",
        height: "80px",
        alignItems: "flex-start",
        zIndex: 1100,
        display: { md: "none" },
      }}
    >
      {getPages(isAdmin).map((page) => (
        <BottomNavigationAction
          key={page}
          value={page}
          label={presentationNames[page]}
          icon={pageIcons[page]}
          sx={isAdmin ? { minWidth: "50px" } : {}}
        />
      ))}
    </BottomNavigation>
  );
}

export default BottomNav;
