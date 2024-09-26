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
            console.log("Adding Venv in slice:", action);
            const { newVenvs, next, previous, total, pageKey } = action.payload;
            console.log("Next line in venv slice newVenvs : ", newVenvs);
            console.log("Next link in venv slice newVenvs : ", next);
            console.log("previous link in venv slice newVenvs : ", previous);

            // Add new data only for the specified pageKey (offset)
            if (!state.pages[pageKey]) {
                state.venvs.push(...newVenvs); // Add only new data
                // state.pages[pageKey] = newVenvs; // Map offset page to venvs
                state.pages[pageKey] = {
                    data: newVenvs,
                    next, // Save the next link for this page
                    previous, // Save the previous link for this page
                };
            }
            // Update pagination links and total
            // state.nextLink = next;
            // state.prevLink = previous;
            state.total = total;
            console.log("State update at exit : ", state);
        },
    },
});

export const { setVenvs } = venvSlice.actions;
export default venvSlice.reducer;
