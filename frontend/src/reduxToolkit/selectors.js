import { createSelector } from "reselect";

// Define static empty array and object outside the selector
const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

// Input selector: gets the test cases state
const selectTestCasesState = (state) => state.testCases || EMPTY_OBJECT; // Reuse static empty object

// Memoized selector: gets the test cases data
export const selectTestCasesData = createSelector(
    [selectTestCasesState],
    (testCasesState) => testCasesState.data || EMPTY_ARRAY // Reuse static empty array
);

// Memoized selector: gets the isIndexed flag
/* This code snippet is creating a memoized selector named `selectIsIndexed` using the `createSelector` function from the "reselect" library in JavaScript. */
// export const selectIsIndexed = createSelector(
//     [selectTestCasesState],
//     (testCasesState) => testCasesState.isIndexed || false // Use a primitive (boolean) instead
// );
