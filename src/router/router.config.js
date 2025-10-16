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
    isSearch: true,
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
    path: "/appointments/schedule",
    title: "Schedule Appointment",
    component: asyncComponent(() =>
      import("../pages/appointment/scheduleAppointment.jsx")
    ),
  },
  {
    path: "/aiSuggestions/all",
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
