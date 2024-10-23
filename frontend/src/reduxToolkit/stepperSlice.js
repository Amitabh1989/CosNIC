import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import db, { batchInsert } from "../services/indexedDBService";
import { getVenvStatusAPI_v2 } from "@/api/venv_apis";

const initialState = {
    currentView: 0,
    currentConfigFile: {},
    currentVenv: 0,
    culminativeData: {},
};

const stepperSlice = createSlice({
    name: "stepper",
    initialState,
    reducers: {
        setStepperStep: (state, action) => {
            state.currentView = action.payload;
            console.log("Stepper step is : ", state.currentView);
        },
        setStepperCulminativeData: (state, action) => {
            state.culminativeData = action.payload;
        },
        setStepperSelectedConfigFile: (state, action) => {
            state.currentConfigFile = action.payload;
        },
        setStepperSelectedVenv: (state, action) => {
            state.currentVenv = action.payload;
        },
    },
});

export const {
    setStepperStep,
    setStepperCulminativeData,
    setStepperSelectedVenv,
    setStepperSelectedConfigFile,
} = stepperSlice.actions;
export default stepperSlice.reducer;
