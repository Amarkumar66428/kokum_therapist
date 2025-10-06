import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  InputBase,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { styled } from "@mui/material/styles";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.grey[200], 0.7),
  "&:hover": {
    backgroundColor: alpha(theme.palette.grey[300], 0.9),
  },
  marginLeft: theme.spacing(2),
  transition: "width 0.3s",
  width: "200px",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: "100%",
  },
}));

const Header = ({ toggleDrawer }) => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <AppBar
      position="fixed"
      color="#fff"
      elevation={0}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: "#fff" }}
    >
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          onClick={toggleDrawer}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          MyApp
        </Typography>

        {showSearch && (
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
              autoFocus
            />
          </Search>
        )}

        <IconButton
          size="large"
          onClick={() => setShowSearch((prev) => !prev)}
          color={showSearch ? "primary" : "default"}
          sx={{ ml: 1 }}
        >
          <SearchIcon />
        </IconButton>

        <IconButton size="large" color="default" sx={{ ml: 1 }}>
          <AddCircleOutlineIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
