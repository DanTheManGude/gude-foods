import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import DescriptionSharpIcon from "@mui/icons-material/DescriptionSharp";
import MenuBookSharpIcon from "@mui/icons-material/MenuBookSharp";
import SettingsSharpIcon from "@mui/icons-material/SettingsSharp";
import FormatListBulletedSharpIcon from "@mui/icons-material/FormatListBulletedSharp";

import { signInGoogle } from "../../utils/signIn";

import { pages, presentationNames } from "../../constants";

const pageIcons = {
  glossary: <DescriptionSharpIcon />,
  shoppingList: <FormatListBulletedSharpIcon />,
  cookbook: <MenuBookSharpIcon />,
  settings: <SettingsSharpIcon />,
};

const navActionSxProp = { paddingX: "4px" };

function BottomNav(props) {
  const { addAlert } = props;

  const [currentPageIndex, setCurrentPageIndex] = useState(-1);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPageIndex(pages.findIndex((page) => pathname.includes(page)));
  }, [pathname]);

  return (
    <BottomNavigation
      showLabels={true}
      value={currentPageIndex}
      onChange={(event, newValue) => {
        if (newValue < pages.length) {
          navigate(`/${pages[newValue]}`);
        } else {
          signInGoogle(addAlert);
        }
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
      {pages.map((page) => (
        <BottomNavigationAction
          key={page}
          label={presentationNames[page]}
          icon={pageIcons[page]}
          sx={navActionSxProp}
        />
      ))}
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
        sx={navActionSxProp}
      />
    </BottomNavigation>
  );
}

export default BottomNav;
