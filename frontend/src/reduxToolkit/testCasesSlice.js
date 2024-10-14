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
export async function batchInsert(data, batchSize = 100) {
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await db.testCases.bulkPut(batch);
    }
}

// // Async thunk to fetch test cases
// export const fetchTestCases = createAsyncThunk(
//     "testCases/fetchTestCases",
//     async (_, { getState, rejectWithValue }) => {
//         // try {
//         const state = getState();
//         console.log(`GetState value in thunk : ${JSON.stringify(state)}`);
//         const cachedTestCases = state.testCases;
//         console.log(`Cached test case : ${cachedTestCases}`);

//         // Check if data exists in Redux store
//         if (cachedTestCases && cachedTestCases.length > 0) {
//             console.log("Returning data from Redux store");
//             return cachedTestCases;
//         }

//         // Check IndexedDB
//         // const indexedDbTestCases = await db.testCases.toArray(); // Corrected reference to the 'testcases' table
//         // console.log(
//         //     `indexedDbTestCases test case : ${indexedDbTestCases?.length}`
//         // );
//         // if (indexedDbTestCases?.length > 0) {
//         //     console.log(
//         //         "Returning data from IndexedDB, num records : ",
//         //         indexedDbTestCases.length
//         //     );
//         //     return indexedDbTestCases;
//         // }

//         // try {
//         // Fetch from backend API if not found
//         const response = await getTestCasesApi();
//         console.log(`Response : ${response.status}`);
//         if (response.status != 200) {
//             return rejectWithValue("Network response was not ok");
//         }

//         // Save to IndexedDB
//         // await batchInsert(response.data);

//         // await db.transaction("rw", db.testcases, async () => {
//         //     await db.testcases.bulkPut(data);
//         // });

//         return response.data;
//     }
// );

// Async thunk to fetch test cases
export const fetchTestCases = createAsyncThunk(
    "testCases/fetchTestCases",
    async (_, { getState, rejectWithValue }) => {
        try {
            // 1. Check Redux store first (data already in memory)
            const state = getState();
            const cachedTestCases = state.testCases?.data;
            if (cachedTestCases && cachedTestCases.length > 0) {
                console.log("Returning cached test cases from Redux store.");
                return cachedTestCases;
            }

            // 2. Check IndexedDB (if data is saved locally)
            const indexedDbTestCases = await db.testCases.toArray();
            if (indexedDbTestCases.length > 0) {
                console.log("Returning test cases from IndexedDB.");
                return indexedDbTestCases;
            }

            // 3. Fetch from API (if no local data found)
            const response = await getTestCasesApi(); // Replace with actual API call
            if (response.status !== 200) {
                throw new Error("Failed to fetch data from API");
            }

            console.log("Fetched test cases from API.");

            // 4. Save the fetched data to IndexedDB
            await batchInsert(response.data); // Insert into IndexedDB

            // Return the fresh data
            return response.data;
        } catch (error) {
            console.error("Error fetching test cases:", error.message);
            return rejectWithValue(error.message);
        }
    }
);

const testCasesSlice = createSlice({
    name: "testCases",
    initialState: {
        data: [], // Stores test case data
        loading: false, // Indicates loading state
        error: null, // Holds any errors
        isIndexed: false, // Indicates if data is saved in IndexedDB
    },
    reducers: {
        setTestCases: (state, action) => {
            state.data = action.payload;
            state.isIndexed = true;
            console.log(`Test case has been set : ${action.payload}`);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
            console.log("Set loading is: ", action.payload);
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
    // extraReducers: (builder) => {
    //     builder
    //         .addCase(fetchTestCases.pending, (state) => {
    //             state.loading = true;
    //             state.error = null; // Reset errors on each fetch attempt
    //         })
    //         .addCase(fetchTestCases.fulfilled, (state, action) => {
    //             state.loading = false;
    //             state.data = action.payload;
    //             state.isIndexed = true; // Set isIndexed to true if data is fetched
    //         })
    //         .addCase(fetchTestCases.rejected, (state, action) => {
    //             state.loading = false;
    //             state.error = action.payload || "Failed to fetch test cases";
    //         });
    // },
});

export const { setTestCases, setLoading, setError } = testCasesSlice.actions;
export default testCasesSlice.reducer;
