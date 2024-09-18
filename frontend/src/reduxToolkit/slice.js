// const { createSlice, nanoid } = require("@reduxjs/toolkit");

import { createSlice, nanoid } from "@reduxjs/toolkit"; // Use import, not require

const initialState = {
    venvs: [],
    next: null,
    prev: null,
    total: 0, // Total count from API
    pages: {}, // Track pages with offsets and limit
};

const venvSlice = createSlice({
    name: "venv",
    initialState,
    reducers: {
        setVenvs: (state, action) => {
            console.log("Adding Venv:", action);
            const { newVenvs, next, previous, count, pageKey } = action.payload;

            // Add new data only for the specified pageKey (offset)
            if (!state.pages[pageKey]) {
                state.venvs.push(...newVenvs); // Add only new data
                state.pages[pageKey] = newVenvs; // Map offset page to venvs
            }
            // Update pagination links and total
            state.nextLink = next;
            state.prevLink = previous;
            state.total = count;
        },
    },
});

export const { setVenvs } = venvSlice.actions;
export default venvSlice.reducer;
