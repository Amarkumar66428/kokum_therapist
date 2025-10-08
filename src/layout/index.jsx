import React, { useState } from "react";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import Header from "./header";
import SideBar from "./sidebar";

const DRAWER_WIDTH = 240;
const MINI_DRAWER_WIDTH = 60;

const AppLayout = ({ isSearch, isPatientView, children }) => {
  const [open, setOpen] = useState(true);

  const toggleDrawer = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "#fff",
      }}
    >
      <Header
        drawerWidth={DRAWER_WIDTH}
        isSearch={isSearch}
        isPatientView={isPatientView}
        toggleDrawer={toggleDrawer}
      />
      <SideBar
        open={open}
        drawerWidth={DRAWER_WIDTH}
        miniDrawerWidth={MINI_DRAWER_WIDTH}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1,
          mt: 8,
          mx: 1,
          bgcolor: "#f9f9fb",
          borderRadius: 2,
          height: "calc(100vh - 74px)",
          overflowY: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;
