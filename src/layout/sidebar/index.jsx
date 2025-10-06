import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Box,
} from "@mui/material";
import { LogoutOutlined, PersonOutlineOutlined } from "@mui/icons-material";
import { appRouters } from "../../router/router.config";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import ConfirmDialog from "../../components/confirmDialog";

const SideBar = ({ open, drawerWidth, miniDrawerWidth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : miniDrawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : miniDrawerWidth,
          overflowX: "hidden",
          borderRight: "none",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "width 0.3s",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ flexGrow: 1 }}>
        <List>
          {appRouters
            ?.filter(({ inSideMenu }) => inSideMenu)
            .map(({ path, title, icon: Icon }) => {
              const RenderIcon = Icon || PersonOutlineOutlined;
              const isActive = location.pathname.startsWith(path);

              return (
                <Tooltip
                  key={title}
                  title={!open ? title : ""}
                  placement="right"
                >
                  <ListItemButton
                    onClick={() => navigate(path)}
                    selected={isActive}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      my: 0.5,
                      "&.Mui-selected": {
                        bgcolor: "gray.100",
                        color: "primary.main",
                        "& .MuiSvgIcon-root": { color: "primary.main" },
                      },
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <RenderIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary={title} />}
                  </ListItemButton>
                </Tooltip>
              );
            })}
        </List>
      </Box>
      {/* Logout button pinned at bottom */}
      <List>
        <Tooltip title={!open ? "Logout" : ""} placement="right">
          <ListItemButton
            onClick={() => setLogoutConfirm(true)}
            sx={{
              borderRadius: 2,
              mx: 1,
              mb: 1,
              "&:hover": {
                bgcolor: "error.light",
                color: "#fff",
                "& .MuiSvgIcon-root": { color: "error.main" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutOutlined />
            </ListItemIcon>
            {open && <ListItemText primary="Logout" />}
          </ListItemButton>
        </Tooltip>
      </List>
      <ConfirmDialog
        title="Logout"
        description="Are you sure you want to logout?"
        open={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </Drawer>
  );
};

export default SideBar;
