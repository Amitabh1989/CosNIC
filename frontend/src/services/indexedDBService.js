import Dexie from "dexie";

// Initialize IndexedDB Database
export const indexedDB = new Dexie("CosNICDatabase");

// Define the schema for the database
indexedDB.version(1).stores({
    testcases: "++id, tcid, title, suite_name, applicable_os, stream, category",
});

// Function to add testcases to the database
export const saveTestCasesToIndexedDB = async (testcases) => {
    try {
        await indexedDB.testcases.bulkPut(testcases);
        console.log("Testcases added to IndexedDB");
    } catch (error) {
        console.error("Error adding testcases to IndexedDB:", error);
    }
};

// Function to fetch testcases from the database
export const getTestCasesFromIndexedDB = async () => {
    try {
        const testCases = await indexedDB.testcases.toArray();
        return testCases;
    } catch (error) {
        console.log("Error fetching testcases from IndexedDB:", error);
    }
};

// Function to fetch test case by ID from database
export const getTestCaseByIDFromIndexedDB = async (id) => {
    try {
        const testCase = await indexedDB.testcases.get(id);
        return testCase;
    } catch (error) {
        console.error("Error fetching test case from IndexedDB:", error);
    }
};

// Function to delete test cases from the database
export const deleteTestCasesFromIndexedDB = async () => {
    try {
        await indexedDB.testcases.clear();
        console.log("Testcases deleted from IndexedDB");
    } catch (error) {
        console.error("Error deleting testcases from IndexedDB:", error);
    }
};
