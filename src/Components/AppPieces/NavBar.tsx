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

const NavBar = ({
  isAuthorized,
  isActingAsUser = false,
}: {
  isAuthorized: boolean;
  isActingAsUser?: boolean;
}) => {
  let navigate = useNavigate();
  const theme = useTheme();

  const otherStripe = `${theme.palette.background.paper
    .split("")
    .map((item, _index, array) =>
      item === "#" || array.length === 7 ? item : item + item
    )
    .join("")}aa`;
  const stripeColor = `${theme.palette.primary.main}30`;

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: "100%",
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            height: "68px",
            ...(isActingAsUser
              ? {
                  background: `repeating-linear-gradient(-45deg, ${otherStripe}, ${otherStripe} 10px, ${stripeColor} 10px, ${stripeColor} 20px)`,
                }
              : {}),
          }}
        >
          <Toolbar
            sx={{
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography
              variant="h4"
              noWrap={true}
              component="span"
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
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: isAuthorized ? "flex" : "none" },
              }}
            >
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
                right: "0",
                bottom: "14px",
              }}
              position="absolute"
            >
              <Link to={`/`}>
                <img
                  width="32px"
                  src={"/logo.png"}
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
