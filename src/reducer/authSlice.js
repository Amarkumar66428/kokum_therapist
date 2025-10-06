import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  subscription: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearUserData: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const getCurrentUser = (state) => state.auth.user;

export const { setUserData, clearUserData } = authSlice.actions;
export default authSlice.reducer;
