import { useLocation, useNavigate } from "react-router-dom";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import DescriptionSharpIcon from "@mui/icons-material/DescriptionSharp";
import MenuBookSharpIcon from "@mui/icons-material/MenuBookSharp";
import SettingsSharpIcon from "@mui/icons-material/SettingsSharp";
import FormatListBulletedSharpIcon from "@mui/icons-material/FormatListBulletedSharp";
import HouseSharp from "@mui/icons-material/HouseSharp";

import { pages, presentationNames } from "../../constants";
import { Page } from "../../types";

const pageIcons: { [key in Page]: React.JSX.Element } = {
  glossary: <DescriptionSharpIcon />,
  shoppingList: <FormatListBulletedSharpIcon />,
  cookbook: <MenuBookSharpIcon />,
  home: <HouseSharp />,
  settings: <SettingsSharpIcon />,
};

function BottomNav() {
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
        "& .MuiButtonBase-root": { minWidth: "20vw" },
      }}
    >
      {pages.map((page) => (
        <BottomNavigationAction
          key={page}
          value={page}
          label={presentationNames[page]}
          icon={pageIcons[page]}
          sx={{
            paddingX: "1px",
          }}
        />
      ))}
    </BottomNavigation>
  );
}

export default BottomNav;
