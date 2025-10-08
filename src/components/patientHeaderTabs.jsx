import React from "react";
import { Tabs, Tab, Tooltip, useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { PersonOutlineOutlined } from "@mui/icons-material";
import { appRouters } from "../router/router.config";

const PatientHeaderTabs = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const patientRoutes = appRouters.filter((r) => r.isPatientView && r.title);

  const activeIndex = patientRoutes.findIndex((r) =>
    location.pathname.startsWith(r.path)
  );

  return (
    <Tabs
      value={activeIndex !== -1 ? activeIndex : false}
      onChange={(_, newValue) => navigate(patientRoutes[newValue].path)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        minHeight: 56,
        "& .MuiTab-root": {
          textTransform: "none",
          fontWeight: 400,
          color: theme.palette.text.secondary,
          minHeight: 56,
          flexDirection: "column",
          alignItems: "center",
          px: 1,
          mx: 0.5,
          transition: "all 0.2s ease-in-out",
          borderRadius: 4,
          border: `1px solid transparent`,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        },
        "& .Mui-selected": {
          color: theme.palette.primary.main,
          fontWeight: 500,
          border: `1px solid ${theme.palette.primary.main}`,
          backgroundColor: theme.palette.action.selected,
          "& .MuiTab-iconWrapper": {
            color: theme.palette.primary.main,
          },
        },
        "& .MuiTabs-indicator": {
          backgroundColor: "transparent",
        },
      }}
    >
      {patientRoutes.map(({ title, icon: Icon }, index) => {
        const RenderIcon = Icon || PersonOutlineOutlined;

        return (
          <Tooltip key={title} title={title} placement="bottom">
            <Tab
              icon={<RenderIcon fontSize="small" />}
              iconPosition="start"
              label={title}
              value={index}
            />
          </Tooltip>
        );
      })}
    </Tabs>
  );
};

export default PatientHeaderTabs;
