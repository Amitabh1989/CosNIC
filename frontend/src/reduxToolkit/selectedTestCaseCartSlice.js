import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import db, { batchInsert } from "../services/indexedDBService";

// export const fetchTestCases = createAsyncThunk(
//     "testCases/fetchTestCases",
//     async (page = 1, { getState, dispatch, rejectWithValue }) => {
//         try {

//             const indexedDbTestCases = await db.testCases.toArray();
//             if (indexedDbTestCases.length > 0) {
//                 console.log("Returning Test Cases from IndexedDB");
//                 return indexedDbTestCases;
//             }

//             // 3. If data is not found anywhere, call api and get it
//             const response = await getTestCasesApi(); // Replace with actual API call
//             if (response.status !== 200) {
//                 throw new Error("Failed to fetch data from API");
//             }
//             console.log(`Fetched test cases from API for page ${page}.`);

//             // 4. Save the fetched data to IndexedDB in chunks
//             await batchInsert(response.data); // Insert into IndexedDB

//             // Return the freshly fetched data for the current page
//             return response.data;
//         } catch (error) {
//             console.error("Error fetching test cases:", error.message);
//             return rejectWithValue(error.message);
//         }
//     }
// );

const testCasesCartSlice = createSlice({
    name: "testCasesCart",
    initialState: {
        selectedTestCases: [], // Stores test case data
        loading: false, // Indicates loading state
        error: null, // Holds any errors
    },
    reducers: {
        addToTestCasesCart: (state, action) => {
            const testCase = action.payload;
            console.log(`Test case received is: ${JSON.stringify(testCase)}`);

            // Check if the test case already exists in the selectedTestCases array
            const index = state.selectedTestCases.findIndex(
                (selectedTestCase) => selectedTestCase.id === testCase.id
            );
            console.log(`Index of test case in test case cart is : ${index}`);
            if (index === -1 || state.selectedTestCases.length === 0) {
                console.log("Test case not found in the list, adding it.");
                state.selectedTestCases.push(testCase);
            }
            console.log(`Test case has been set : ${state.selectedTestCases}`);
        },
        updateTestCasesCart: (state, action) => {
            const testCase = action.payload;
            console.log(
                `Test case received in update : ${JSON.stringify(testCase)}`
            );

            // Check if the test case already exists in the selectedTestCases array
            const index = state.selectedTestCases.findIndex(
                (selectedTestCase) => selectedTestCase.id === testCase.id
            );
            console.log(`Index of test case in test case cart is : ${index}`);
            if (index !== -1) {
                state.selectedTestCases[index] = testCase;
            }
            console.log(`Test case has been set : ${state.selectedTestCases}`);
        },
        removeFromTestCaseCart: (state, action) => {
            const testCase = action.payload;

            // Remove test case if it is already in the list
            state.selectedTestCases = state.selectedTestCases.filter(
                (selectedTestCase) => selectedTestCase.id !== testCase.id
            );
            console.log("Test case found in the list, removed it.");
        },
        // finalizeTestCasesCart: (state) => {
        //     // Finalize the test cases cart
        //     console.log("Finalizing the test cases cart.");
        //     const finalizedTestCases = state.selectedTestCases;
        //     state.finalizedCart = finalizedTestCases;
        //     console.log(`Finalized test cases cart: ${state.finalizedCart}`);
        // },
        saveSubTestSelection: (state, action) => {
            console.log(`Came to subtest update : ${JSON.stringify(action)}`);
            const { testCaseId, subTestSelection } = action.payload;
            console.log(
                `saveSubTestSelection Test case ID is: ${testCaseId}, Subtest selection is: ${subTestSelection}`
            );
            // Find the test case in the list
            const testCaseRecord = state.selectedTestCases.find(
                (selectedTestCase) => selectedTestCase.id === testCaseId
            );
            console.log(
                `Test case record is: ${JSON.stringify(testCaseRecord)}`
            );
            if (testCaseRecord) {
                // Update the subTests array with the new subTestSelection
                testCaseRecord.subtests = subTestSelection;
            }
            console.log(
                `Updated test case record is: ${JSON.stringify(testCaseRecord.subtests)}`
            );
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
            console.log("Set loading is: ", action.payload);
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        resetTestCasesCart: (state) => {
            state.selectedTestCases = [];
        },
    },
});

export const {
    addToTestCasesCart,
    setLoading,
    setError,
    resetTestCasesCart,
    removeFromTestCaseCart,
    // finalizeTestCasesCart,
    saveSubTestSelection,
} = testCasesCartSlice.actions;
export default testCasesCartSlice.reducer;
