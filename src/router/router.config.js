import {
  AutoAwesome,
  ChatBubbleOutlineOutlined,
  DisplaySettingsOutlined,
  PendingActionsOutlined,
  PersonOutlineOutlined,
  PhoneAndroidOutlined,
  SpaceDashboardOutlined,
} from "@mui/icons-material";
import asyncComponent from "../utils/asyncComponent.jsx";

export const authRouters = [
  {
    path: "/",
    component: asyncComponent(() => import("../pages/landing/index.jsx")),
  },
  {
    path: "/signin",
    component: asyncComponent(() => import("../pages/signin/index.jsx")),
  },
];

export const appRouters = [
  {
    path: "/managePatient/basicDetails",
    title: "Add New Patient",
    inSideMenu: true,
    icon: PersonOutlineOutlined,
    component: asyncComponent(() =>
      import("../pages/managePatient/basicDetails.jsx")
    ),
  },
  {
    path: "/patientProfile",
    title: "Patient Profile",
    inSideMenu: true,
    icon: SpaceDashboardOutlined,
    component: asyncComponent(() =>
      import("../pages/patientProfile/index.jsx")
    ),
  },
  {
    path: "/managePatient/childDetails",
    component: asyncComponent(() =>
      import("../pages/managePatient/childDetails.jsx")
    ),
  },
  {
    path: "/managePatient/sensoryProfile",
    component: asyncComponent(() =>
      import("../pages/managePatient/sensoryProfile.jsx")
    ),
  },
  {
    path: "/reports",
    title: "Reports",
    inSideMenu: true,
    icon: DisplaySettingsOutlined,
    component: asyncComponent(() => import("../pages/reports/index.jsx")),
  },
  {
    path: "/sos",
    title: "SOS",
    inSideMenu: true,
    icon: ChatBubbleOutlineOutlined,
    component: asyncComponent(() => import("../pages/sos/index.jsx")),
  },
  {
    path: "/appointments",
    title: "Appointments",
    inSideMenu: true,
    icon: PendingActionsOutlined,
    component: asyncComponent(() => import("../pages/appointment/index.jsx")),
  },
  {
    path: "/allPatients-aiSuggestions",
    title: "Ai Suggestions",
    inSideMenu: true,
    icon: AutoAwesome,
    component: asyncComponent(() =>
      import("../pages/aiSuggestion/allPtntSuggestions.jsx")
    ),
  },
  {
    path: "/contacts-us",
    title: "Contact Us",
    inSideMenu: true,
    icon: PhoneAndroidOutlined,
    component: asyncComponent(() => import("../pages/contactUs/index.jsx")),
  },
  {
    path: "/patientDetails/:patientId/:caretakerId",
    component: asyncComponent(() =>
      import("../pages/patientDetails/index.jsx")
    ),
  },
];

export const routers = [...authRouters, ...appRouters];
