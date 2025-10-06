import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  patientData: null,
  patientId: null,
  caretakerId: null,
};

const careTakerSlice = createSlice({
  name: "caretaker",
  initialState,
  reducers: {
    setCareTaker: (state, action) => {
      state.user = action.payload.user;
      state.patientId = action.payload.patientId;
      state.caretakerId = action.payload.caretakerId;
    },
    clearCareTaker: (state) => {
      state.user = null;
      state.patientId = null;
      state.caretakerId = null;
    },
  },
});

export const selectedCareTaker = (state) => state.caretaker;

export const { setCareTaker, clearCareTaker } = careTakerSlice.actions;
export default careTakerSlice.reducer;
