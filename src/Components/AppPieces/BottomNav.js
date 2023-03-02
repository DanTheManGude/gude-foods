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

  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <BottomNavigation
      showLabels={true}
      value={pathname.slice(1)}
      onChange={(event, newValue) => {
        if (pages.includes(newValue)) {
          navigate(`/${newValue}`);
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
        zIndex: 9001,
      }}
    >
      {pages.map((page) => (
        <BottomNavigationAction
          key={page}
          value={page}
          label={presentationNames[page]}
          icon={pageIcons[page]}
          sx={navActionSxProp}
        />
      ))}
      <BottomNavigationAction
        label="Login"
        value={"googleLogin"}
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
