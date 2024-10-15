// import Dexie from "dexie";

// // Initialize IndexedDB Database
// export const db = new Dexie("CosNICDatabase");

// // Define the schema for the database
// db.version(1).stores({
//     testcases: "++id, tcid, title, suite_name, applicable_os, stream, category",
// });

// // Function to add testcases to the database
// export const saveTestCasesToIndexedDB = async (testcases) => {
//     try {
//         console.log("Test cases in indexedDB : ", testcases);
//         await db.testcases.bulkPut(testcases);
//         console.log("Testcases added to IndexedDB");
//     } catch (error) {
//         console.error("Error adding testcases to IndexedDB:", error);
//     }
// };

// // Function to fetch testcases from the database
// export const getTestCasesFromIndexedDB = async () => {
//     try {
//         const testCases = await db.testcases.toArray();
//         console.log(">>> Testcases fecthed from IndexedDB : ", testCases);
//         return testCases;
//     } catch (error) {
//         console.log("Error fetching testcases from IndexedDB:", error);
//     }
// };

// // Function to fetch test case by ID from database
// export const getTestCaseByIDFromIndexedDB = async (id) => {
//     try {
//         const testCase = await db.testcases.get(id);
//         return testCase;
//     } catch (error) {
//         console.error("Error fetching test case from IndexedDB:", error);
//     }
// };

// // Function to delete test cases from the database
// export const deleteTestCasesFromIndexedDB = async () => {
//     try {
//         await db.testcases.clear();
//         console.log("Testcases deleted from IndexedDB");
//     } catch (error) {
//         console.error("Error deleting testcases from IndexedDB:", error);
//     }
// };

import Dexie from "dexie";

// Initialize Dexie database
const db = new Dexie("CosNICDatabase");
db.version(1).stores({
    testCases: "id,title,tcid,suite_name,applicable_os,stream,category", // Adjust fields accordingly
});

export async function batchInsert(data, batchSize = 100) {
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const existingRecords = await db.testCases
            .where("id")
            .anyOf(batch.map((record) => record.id))
            .toArray();
        const existingIds = new Set(existingRecords.map((record) => record.id));

        const newBatch = batch.filter((item) => !existingIds.has(item.id));
        // Insert only new records
        if (newBatch.length > 0) {
            await db.testCases.bulkPut(newBatch);
        }
    }
}

export default db;
