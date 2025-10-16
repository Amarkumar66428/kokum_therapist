import {
  AutoAwesome,
  ChatBubbleOutlineOutlined,
  DisplaySettingsOutlined,
  PendingActionsOutlined,
  PersonOutlineOutlined,
  PhoneAndroidOutlined,
  SpaceDashboardOutlined,
} from "@mui/icons-material";
import { FiSlack } from "react-icons/fi";
import { CiDesktopMouse2 } from "react-icons/ci";
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
    menuTitle: "Add New Patient",
    title: "Basic Details",
    inSideMenu: true,
    icon: PersonOutlineOutlined,
    component: asyncComponent(() =>
      import("../pages/managePatient/basicDetails.jsx")
    ),
  },
  {
    path: "/patientProfile",
    menuTitle: "Patient Profile",
    inSideMenu: true,
    isSearch: true,
    icon: SpaceDashboardOutlined,
    component: asyncComponent(() =>
      import("../pages/patientProfile/index.jsx")
    ),
  },
  {
    path: "/managePatient/childDetails",
    showSideMenu: true,
    title: "Child Details",
    component: asyncComponent(() =>
      import("../pages/managePatient/childDetails.jsx")
    ),
  },
  {
    path: "/managePatient/sensoryProfile",
    showSideMenu: true,
    title: "Sensory Profile",
    component: asyncComponent(() =>
      import("../pages/managePatient/sensoryProfile.jsx")
    ),
  },
  {
    path: "/reports",
    menuTitle: "Reports",
    inSideMenu: true,
    icon: DisplaySettingsOutlined,
    component: asyncComponent(() => import("../pages/reports/index.jsx")),
  },
  {
    path: "/sos",
    menuTitle: "SOS",
    inSideMenu: true,
    icon: ChatBubbleOutlineOutlined,
    component: asyncComponent(() => import("../pages/sos/index.jsx")),
  },
  {
    path: "/appointments",
    menuTitle: "Appointments",
    inSideMenu: true,
    icon: PendingActionsOutlined,
    component: asyncComponent(() => import("../pages/appointment/index.jsx")),
  },
  {
    path: "/appointments/schedule",
    title: "Schedule Appointment",
    component: asyncComponent(() =>
      import("../pages/appointment/scheduleAppointment.jsx")
    ),
  },
  {
    path: "/aiSuggestions/all",
    menuTitle: "Ai Suggestions",
    inSideMenu: true,
    icon: AutoAwesome,
    component: asyncComponent(() =>
      import("../pages/aiSuggestion/allPtntSuggestions.jsx")
    ),
  },
  {
    path: "/contacts-us",
    menuTitle: "Contact Us",
    inSideMenu: true,
    icon: PhoneAndroidOutlined,
    component: asyncComponent(() => import("../pages/contactUs/index.jsx")),
  },
  {
    path: "/patientDetails",
    isPatientView: true,
    title: "Patient Details",
    tabTitle: "User",
    icon: PersonOutlineOutlined,
    component: asyncComponent(() =>
      import("../pages/patientDetails/index.jsx")
    ),
  },
  {
    path: "/therapyPlans",
    isPatientView: true,
    title: "Last Therapy Plan",
    tabTitle: "Therapy Plans",
    icon: CiDesktopMouse2,
    component: asyncComponent(() =>
      import("../pages/manageTherapyPlan/view.jsx")
    ),
  },
  {
    path: "/therapyPlans/last",
    isPatientView: true,
    title: "New Therapy Plan",
    component: asyncComponent(() =>
      import("../pages/manageTherapyPlan/add.jsx")
    ),
  },
  {
    path: "/therapyPlans/history",
    isPatientView: true,
    title: "Sessions History",
    component: asyncComponent(() =>
      import("../pages/manageTherapyPlan/history.jsx")
    ),
  },
  {
    path: "/suggestions",
    isPatientView: true,
    title: "Suggestions",
    tabTitle: "Suggestions",
    icon: FiSlack,
    component: asyncComponent(() =>
      import("../pages/aiSuggestion/ptntSuggestion.jsx")
    ),
  },
  {
    path: "/myProfile",
    title: "My Profile",
    component: asyncComponent(() => import("../pages/myProfile/index.jsx")),
  },
  {
    path: "/notifications",
    title: "Notifications",
    component: asyncComponent(() => import("../pages/notification/index.jsx")),
  },
];

export const routers = [...authRouters, ...appRouters];
