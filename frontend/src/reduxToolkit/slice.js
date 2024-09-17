// const { createSlice, nanoid } = require("@reduxjs/toolkit");

import { createSlice, nanoid } from "@reduxjs/toolkit"; // Use import, not require

const initialState = {
    venvs: [],
};

const venvSlice = createSlice({
    name: "venv",
    initialState,
    reducers: {
        setVenvs: (state, action) => {
            console.log("Adding Venv:", action);
            state.venvs = action.payload;
        },
    },
});

export const { setVenvs } = venvSlice.actions;
export default venvSlice.reducer;
