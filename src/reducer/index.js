import { combineReducers } from "@reduxjs/toolkit";
import serverErrorReducer from "./serverSlice";
import authReducer from "./authSlice";
import patientReducer from "./patientSlice";

const rootReducer = combineReducers({
  serverError: serverErrorReducer,
  auth: authReducer,
  patient: patientReducer,
});

export default rootReducer;

export { rootReducer };
