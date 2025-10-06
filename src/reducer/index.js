import { combineReducers } from "@reduxjs/toolkit";
import serverErrorReducer from "./serverSlice";
import authReducer from "./authSlice";
import caretakerReducer from "./careTakerSlice";

const rootReducer = combineReducers({
  serverError: serverErrorReducer,
  auth: authReducer,
  caretaker: caretakerReducer,
});

export default rootReducer;

export { rootReducer };
