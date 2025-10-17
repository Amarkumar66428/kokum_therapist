import React from "react";
import { Tabs, Tab, useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { PersonOutlineOutlined } from "@mui/icons-material";
import { appRouters } from "../router/router.config";

const PatientHeaderTabs = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const patientRoutes = appRouters.filter((r) => r.isPatientView && r.tabTitle);

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
        minHeight: "auto",
        height: "auto",
        p: 0,
        "& .MuiTabs-flexContainer": {
          alignItems: "center",
        },
        "& .MuiTabs-indicator": {
          display: "none",
        },
        "& .MuiTab-root": {
          minHeight: "auto",
          height: "auto",
          minWidth: "8rem",
          py: 0.5,
          px: 1.5,
          color: theme.palette.text.secondary,
          borderRadius: 50,
          border: "1px solid transparent",
          fontFamily: "regular",
          textTransform: "none",
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": {
            opacity: 0.8,
          },
        },
        "& .Mui-selected": {
          color: theme.palette.primary.main,
          border: `1px solid ${theme.palette.primary.main}`,
          backgroundColor: theme.palette.secondary.main,
          fontFamily: "semibold",
          "& .MuiTab-iconWrapper": {
            color: theme.palette.primary.main,
          },
        },
        "& .MuiTabs-list": {
          justifyContent: "center",
        },
      }}
    >
      {patientRoutes.map(({ tabTitle, icon: Icon }, index) => {
        const RenderIcon = Icon;

        return (
          <Tab
            key={index}
            icon={<RenderIcon fontSize="medium" />}
            label={tabTitle}
            value={index}
            disableRipple
          />
        );
      })}
    </Tabs>
  );
};

export default PatientHeaderTabs;
