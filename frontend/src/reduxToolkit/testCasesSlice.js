// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getTestCasesApi } from "@/api/test_cases_apis";

// // Thunk for fetching test cases asynchronously
// export const fetchTestCases = createAsyncThunk(
//     // "testCases/fetchTestCases",
//     "testCases/fetchTestCases",
//     async (_, { rejectWithValue }) => {
//         console.log("fetchTestCases thunk called!"); // Add this for debugging
//         try {
//             const response = await getTestCasesApi();
//             console.log("Test cases response asyncThunk :", response.data); // Debug response
//             return response.data;
//         } catch (error) {
//             console.error("Error in fetchTestCases thunk:", error); // Debug error
//             return rejectWithValue(error.message);
//         }
//     }
// );

// const initialTestCasesState = {
//     testCasesRecord: [], // Ensure this is an array
//     isIndexed: false,
//     loading: false, // Track loading state
//     error: null, // Track errors
// };

// // Create testCases slice
// const testCasesSlice = createSlice({
//     name: "testCases",
//     initialState: initialTestCasesState,
//     reducers: {
//         setTestCases: (state, action) => {
//             state.testCasesRecord = action.payload; // Update test cases
//             console.log(`Loaded testcasesRecord data`);
//         },
//         setIsTestCaseIndexed: (state, action) => {
//             state.isIndexed = action.payload; // Update index flag
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(fetchTestCases.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//                 console.log("Fetching test cases, pending...");
//             })
//             .addCase(fetchTestCases.fulfilled, (state, action) => {
//                 state.testCasesRecord = action.payload;
//                 state.isIndexed = true;
//                 state.loading = false;
//                 console.log(
//                     `State is fulfilled : ${state.testCasesRecord.length}`
//                 );
//             })
//             .addCase(fetchTestCases.rejected, (state, action) => {
//                 state.loading = false;
//                 // state.error = action.error.message;
//                 state.error = action.payload || action.error.message;
//                 console.error("Test cases fetching failed:", state.error);
//             });
//     },
// });

// export const { setTestCases, setIsTestCaseIndexed } = testCasesSlice.actions;
// export default testCasesSlice.reducer;

// features/testCasesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Dexie from "dexie";

const db = new Dexie("CosNICDatabase");
db.version(1).stores({
    testCases: "++id, tcid, title, suite_name, applicable_os, stream, category",
});

//  [Violation] 'success' handler took 155ms
async function batchInsert(data, batchSize = 100) {
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await db.testCases.bulkPut(batch);
    }
}

// Async thunk to fetch test cases
export const fetchTestCases = createAsyncThunk(
    "testCases/fetchTestCases",
    async (_, { getState, rejectWithValue }) => {
        // try {
        const state = getState();
        console.log(`GetState value in thunk : ${JSON.stringify(state)}`);
        const cachedTestCases = state.testCases;
        console.log(`Cached test case : ${cachedTestCases}`);

        // Check if data exists in Redux store
        if (cachedTestCases && cachedTestCases.length > 0) {
            console.log("Returning data from Redux store");
            return cachedTestCases;
        }

        // Check IndexedDB
        // const indexedDbTestCases = await db.testCases.toArray(); // Corrected reference to the 'testcases' table
        // console.log(
        //     `indexedDbTestCases test case : ${indexedDbTestCases?.length}`
        // );
        // if (indexedDbTestCases?.length > 0) {
        //     console.log(
        //         "Returning data from IndexedDB, num records : ",
        //         indexedDbTestCases.length
        //     );
        //     return indexedDbTestCases;
        // }

        // try {
        // Fetch from backend API if not found
        const response = await getTestCasesApi();
        console.log(`Response : ${response.status}`);
        if (response.status != 200) {
            return rejectWithValue("Network response was not ok");
        }

        // Save to IndexedDB
        // await batchInsert(response.data);

        // await db.transaction("rw", db.testcases, async () => {
        //     await db.testcases.bulkPut(data);
        // });

        return response.data;
    }
);

const testCasesSlice = createSlice({
    name: "testCases",
    initialState: {
        data: [],
        loading: false, // or 'loading' or 'succeeded' or 'failed'
        error: null,
        isIndexed: false,
    },
    reducers: {
        setTestCases: (state, action) => {
            console.log(`Test case payload : ${action.payload}`);
            state.data = action.payload;
            state.isIndexed = true;
            console.log(`Test cases data stored`);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTestCases.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTestCases.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.isIndexed = true;
            })
            .addCase(fetchTestCases.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const selectAllTestCases = (state) => state.testCases.data;
export const { setTestCases } = testCasesSlice.actions;
const testCasesReducer = testCasesSlice.reducer;
export default testCasesReducer;
