import { Link, useNavigate } from "react-router-dom";

import { styled, useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";

import { pages, presentationNames } from "../../constants";
import { isDevelopment } from "../../utils/utility";

const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

const NavBar = () => {
  let navigate = useNavigate();
  const theme = useTheme();

  const inDevelopment = isDevelopment();
  const transparant = "#00000000";
  const stripeColor = `${theme.palette.primary.main}30`;

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          left: "2%",
          width: "96%",
        }}
      >
        <Container
          maxWidth="xl"
          sx={
            inDevelopment
              ? {
                  background: `repeating-linear-gradient(-45deg, ${transparant}, ${transparant} 10px, ${stripeColor} 10px, ${stripeColor} 20px)`,
                }
              : {}
          }
        >
          <Toolbar
            sx={{
              justifyContent: "center",
            }}
          >
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
              <Link style={{ color: theme.palette.text.primary }} to={`/`}>
                Gude Foods
              </Link>
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
              <Link style={{ color: theme.palette.text.primary }} to={`/`}>
                Gude Foods
              </Link>
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={() => {
                    navigate(`/${page}`);
                  }}
                  sx={{ my: 2, display: "block" }}
                >
                  <Typography color={"text.primary"}>
                    {presentationNames[page]}
                  </Typography>
                </Button>
              ))}
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
