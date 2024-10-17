// const { createSlice, nanoid } = require("@reduxjs/toolkit");

import { createSlice, nanoid } from "@reduxjs/toolkit"; // Use import, not require
// import create from "react-icons-md/create";

const initialState = {
    venvs: [],
    next: null,
    prev: null,
    total: 0, // Total count from API
    pages: {}, // Track pages with offsets and limit
};

/**
 * Virtual Environment record slice for Redux Toolkit.
 */
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

/**
 * Test Cases record slice for Redux Toolkit.
 */

// // Initial state for the test cases slice
// const initialTestCasesState = {
//     testCases: [], // Store test cases data
//     isIndexed: false, // Boolean to check if test cases are indexed in IndexedDB
// };

// const testCasesSlice = createSlice({
//     name: "testCases",
//     initialState: initialTestCasesState,
//     reducers: {
//         setTestCases: (state, action) => {
//             const { newTestCases } = action.payload;
//             state.testCases = newTestCases; // Save test cases data
//         },
//         resetTestCases: (state) => {
//             state.testCases = []; // Reset test cases data
//         },
//         setIsTestCaseIndexed: (state, action) => {
//             state.isIndexed = action.payload; // Set test case index status
//         },
//     },
// });

// Export actions and reducer for venv slice
export const { setVenvs } = venvSlice.actions;
const venvReducer = venvSlice.reducer;
export default venvReducer;

// // Export actions and reducer for test cases slice
// export const { setTestCases, resetTestCases, setIsTestCaseIndexed } =
//     testCasesSlice.actions;
// // export const testCasesReducer = testCasesSlice.reducer;
// export const testCasesReducer = testCasesSlice.reducer;
