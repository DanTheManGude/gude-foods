import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import styled from "@emotion/styled";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";

import GoogleLoginButton from "./GoogleLoginButton.js";

const presentationNames = {
  cookbook: "Cookbook",
  shoppingList: "Shopping List",
  glossary: "Glossary",
  settings: "Settings",
};

const pages = ["cookbook", "shoppingList", "glossary", "settings"];

const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

const NavBar = (props) => {
  const { addAlert } = props;
  let navigate = useNavigate();

  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ left: "2%", width: "96%" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: "center" }}>
            <Typography
              variant="h5"
              noWrap
              component="span"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "DancingScript",
                fontWeight: "bold",
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <Link to={`/`}>Gude Foods</Link>
            </Typography>

            <Typography
              variant="h4"
              noWrap
              component="span"
              href=""
              sx={{
                display: { xs: "flex", md: "none" },
                fontFamily: "DancingScript",
                fontWeight: "bold",
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <Link to={`/`}>Gude Foods</Link>
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={() => {
                    handleCloseNavMenu();
                    navigate(`/${page}`);
                  }}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  <Typography>{presentationNames[page]}</Typography>
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
              <GoogleLoginButton
                handleClick={handleCloseNavMenu}
                addAlert={addAlert}
              />
            </Box>
            <Box
              sx={{
                display: { md: "none" },
                right: "0",
                bottom: "7px",
              }}
              position="absolute"
            >
              <Link to={`/`}>
                <img
                  width="32px"
                  src={"/favicon-32x32.png"}
                  alt="App Logo"
                  style={{ borderRadius: "5px" }}
                />
              </Link>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Offset />
    </>
  );
};
export default NavBar;
