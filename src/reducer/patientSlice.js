import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  searchPatient: null,
};

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    searchPatient: (state, action) => {
      state.searchPatient = action.payload.value;
    },
  },
});

export const { searchPatient } = patientSlice.actions;
export default patientSlice.reducer;
