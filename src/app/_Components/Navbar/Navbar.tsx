"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { SvgIcon } from "@mui/material";
import { useUser } from "../UserContext/UserContext";
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';

interface Props {
  window?: () => Window;
  children: React.ReactElement;
}

function HideOnScroll(props: Props) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    threshold: 100,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const getPages = (hasToken: boolean) => {
  if (hasToken) {
    return [
      { text: "Home", path: "/" },
      { text: "Logout", path: "/signin" },
    ];
  }
  return [
    { text: "Sign in", path: "/signin" },
    { text: "Sign up", path: "/signup" },
  ];
};

const settings = ["Account", "Profile"];

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hasToken, setHasToken] = React.useState(false);
  const { userData } = useUser();

  const [anchorElNav, setAnchorElNav] = React.useState<HTMLElement | null>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    const token = localStorage.getItem("Token");
    setHasToken(!!token);

    const handleStorageChange = () => {
      const token = localStorage.getItem("Token");
      setHasToken(!!token);

      if (token && (pathname === "/signin" || pathname === "/signup")) {
        router.push("/");
      } else if (!token && pathname !== "/signin" && pathname !== "/signup") {
        router.push("/signin");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [pathname, router]);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavigation = (path: string, text: string) => {
    if (text === "Logout") {
      localStorage.removeItem("Token");
      setHasToken(false);
    }
    router.push(path);
    handleCloseNavMenu();
  };

  const handleSettingClick = (setting: string) => {
    if (setting === "Account") {
      router.push("/account");
    } else if (setting === "Profile"){
      router.push("/profile");
    }
    handleCloseUserMenu();
  };

  const pages = getPages(hasToken);

  const isAuthPage = pathname === "/signin" || pathname === "/signup";

  const navbar = (
    <AppBar sx={{ backgroundColor: "black" }} position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <SvgIcon
            sx={{
              display: { xs: "none", md: "flex" },
              mr: 1,
              fontSize: 50,
              position: { xs: isAuthPage ? "absolute" : "static", md: "static" },
              right: isAuthPage ? "16px" : "auto",
              left: {
                xs: isAuthPage ? "auto" : "50%",
                md: "auto",
              },
              transform: {
                xs: isAuthPage ? "none" : "translateX(-50%)",
                md: "none",
              },
            }}
            viewBox="0 0 208 208"
          >
            <circle cx="104" cy="104" r="95" fill="white" stroke="black" strokeWidth="2" />
            <text
              x="50%"
              y="50%"
              fontSize="45"
              fontFamily="Arial, sans-serif"
              fontWeight="700"
              fill="black"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              YONNA
            </text>
          </SvgIcon>

          <Box sx={{ flexGrow: { xs: isAuthPage ? 1 : 0, md: 1 }, display: { xs: "flex", md: "none" } }}>
            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem key={page.path} onClick={() => handleNavigation(page.path, page.text)}>
                  <Typography
                    sx={{
                      textAlign: "center",
                      color: page.text === "Logout" ? "#a31545" : pathname === page.path ? "info.main" : "inherit",
                    }}
                  >
                    {page.text}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <SvgIcon
            sx={{
              display: { xs: "flex", md: "none" },
              justifyContent: { xs: "center" },
              alignItems: { xs: "center" },
              textAlign: { xs: "center" },
              fontSize: 50,
              mx: isAuthPage ? undefined : { xs: "auto" },
              width: "max",
            }}
            viewBox="0 0 208 208"
          >
            <circle cx="104" cy="104" r="95" fill="white" stroke="black" strokeWidth="2" />
            <text
              x="50%"
              y="50%"
              fontSize="45"
              fontFamily="Arial, sans-serif"
              fontWeight="700"
              fill="black"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              YONNA
            </text>
          </SvgIcon>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.path}
                onClick={() => handleNavigation(page.path, page.text)}
                sx={{
                  my: 2,
                  color: page.text === "Logout" ? "#c2185b" : pathname === page.path ? "info.main" : "white",
                  display: "block",
                }}
              >
                {page.text}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {hasToken && (
              <>
                <Tooltip title="User Menu">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar src={userData?.photo || "/broken-image.jpg"} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  keepMounted
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem key={setting} onClick={() => handleSettingClick(setting)}>
                      <Typography
                        sx={{
                          textAlign: "center",
                          color: setting === "Logout" ? "#a31545" : "inherit",
                        }}
                      >
                        {setting}
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );

  return (
    <>
      <HideOnScroll>
        {navbar}
      </HideOnScroll>
      <Toolbar />
    </>
  );
}

export default Navbar;