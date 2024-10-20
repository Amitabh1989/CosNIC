// const { createSlice, nanoid } = require("@reduxjs/toolkit");

// import { createSlice, nanoid } from "@reduxjs/toolkit"; // Use import, not require
// import create from "react-icons-md/create";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import db, { batchInsert } from "../services/indexedDBService";
import { getVenvStatusAPI_v2 } from "@/api/venv_apis";

const initialState = {
    venvs: [],
    pages: {},
    nextLink: null,
    prevLink: null,
    count: 0,
    loading: false,
    error: null,
};

export const fetchVenvs = createAsyncThunk(
    "venvs/fetchVenvs",
    async ({ pageKey, url }, { getState, dispatch, rejectWithValue }) => {
        try {
            // Get the current state
            console.log(`Page key si ${pageKey} and URL is ${url}`);
            const state = getState();
            const venvsStore = state.venv;
            // const { venvs, pages } = venvsStor;
            // const pages = venvsStore.pages;
            console.log("Current state in fetchVenvs:", venvsStore);
            console.log(
                ">> Current state in fetchVenvs venvsStore and pages : ",
                venvsStore,
                "  :  "
                // pages
            );

            // Check if page data is already in Redux store
            if (venvsStore && venvsStore.pages[pageKey]) {
                console.log(
                    "Data already exists in Redux for pageKey:",
                    pageKey
                );
                return { data: venvsStore.pages[pageKey], fromStore: true }; // Return from store
            }

            // Fetch from API if data is not in Redux
            console.log(
                "No data in Redux, Fetching from API for pageKey:",
                pageKey
            );

            // Fetch from API if data is not in Redux
            console.log(
                "No data in Redux, Fetching from API for pageKey:",
                pageKey
            );
            const response = await getVenvStatusAPI_v2(null, url);
            console.log(
                `Response from API for pageKey ${pageKey} is:`,
                response
            );

            // Add pageKey to the response object
            // const data = {
            //     ...response,
            //     pageKey: pageKey,
            // };

            // Return the API data
            return { fromStore: false, data: response, pageKey: pageKey }; // Return API data with pageKey

            // Return the API data
            // return { fromStore: false, data: response }; // Return API data
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Failed to fetch Venv data"
            );
        }
    }
);

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
            console.log("page key link in venv slice newVenvs : ", pageKey);
            console.log("total link in venv slice newVenvs : ", total);

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
            console.log("State update at exit of setVenvs : ", state);
        },
        // setVenvs(state, action) {
        //     const { pageKey, newVenvs, next, previous, total } = action.payload;
        //     state.pages[pageKey] = { results: newVenvs, next, previous, total };
        //     state.venvs = [...state.venvs, ...newVenvs]; // Append new data to existing
        //     state.nextLink = next;
        //     state.prevLink = previous;
        //     state.totalCount = total;
        // },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVenvs.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchVenvs.fulfilled, (state, action) => {
                // const { newVenvs, next, previous, total, pageKey } =
                //     action.payload;
                // console.log("Next line in venv slice newVenvs : ", newVenvs);
                // console.log("Next link in venv slice newVenvs : ", next);
                // console.log(
                //     "previous link in venv slice newVenvs : ",
                //     previous
                // );
                // console.log("page key link in venv slice newVenvs : ", pageKey);
                // console.log("total link in venv slice newVenvs : ", total);

                const { data, fromStore, pageKey } = action.payload;
                console.log(
                    "payload Data in venv slice async thunk is :",
                    action.payload
                );
                if (!fromStore) {
                    const { results, next, previous, count } = data;

                    // Generate pageKey from the API's offset-limit
                    let pageKeyIn;
                    if (next) {
                        const urlParams = new URLSearchParams(
                            new URL(next).search
                        );
                        const offset = urlParams.get("offset") || 0;
                        const limit = urlParams.get("limit") || 10;
                        pageKeyIn = `${offset - limit}-${offset}`;
                    } else if (previous) {
                        const urlParams = new URLSearchParams(
                            new URL(previous).search
                        );
                        const offset = urlParams.get("offset") || 0;
                        const limit = urlParams.get("limit") || 10;
                        pageKeyIn = `${parseInt(offset) + parseInt(limit)}-${parseInt(offset) + 2 * parseInt(limit)}`;
                    }
                    console.log(
                        "Page key in venv slice async thunk is :",
                        pageKeyIn,
                        "   and page key in args is : ",
                        { pageKey }
                    );
                    // Save the data by pageKey to avoid duplicates
                    state.pages[pageKey] = { results, next, previous, count };
                    state.venvs = results; // Replace, don't append
                    state.nextLink = next;
                    state.prevLink = previous;
                    state.count = count;
                }
                state.loading = false;
            })
            .addCase(fetchVenvs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
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
