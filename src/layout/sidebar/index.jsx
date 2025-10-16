import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
import { LogoutOutlined, PersonOutlineOutlined } from "@mui/icons-material";
import { appRouters } from "../../router/router.config";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import ConfirmDialog from "../../components/confirmDialog";
import { FONT_SIZE, ICON_SIZE } from "../../constant/lookUpConstant";
import SemiBoldText from "../../components/typography/semiBoldText";

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
                        bgcolor: "primary.hlt_light",
                        color: "primary.main",
                      },
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <RenderIcon
                        sx={{ color: "primary.icon", fontSize: ICON_SIZE.MD }}
                      />
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        disableTypography
                        primary={<SemiBoldText>{title}</SemiBoldText>}
                      />
                    )}
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
                bgcolor: "secondary.light_error",
                color: "secondary.error",
                "& .MuiSvgIcon-root": { color: "secondary.error" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutOutlined
                sx={{ color: "primary.icon", fontSize: ICON_SIZE.MD }}
              />
            </ListItemIcon>
            {open && (
              <ListItemText
                disableTypography
                primary={
                  <Typography fontSize={FONT_SIZE.BODY} fontFamily="semiBold">
                    Logout
                  </Typography>
                }
              />
            )}
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
