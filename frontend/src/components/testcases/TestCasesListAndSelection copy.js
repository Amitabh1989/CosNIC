"use client";
// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
import { DocumentIcon } from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
    Card,
    Input,
    Checkbox,
    CardHeader,
    IconButton,
    Typography,
} from "@material-tailwind/react";
import { getTestCasesApi, getTestCaseByIDApi } from "@/api/test_cases_apis";
// import {
//     saveTestCasesToIndexedDB,
//     getTestCasesFromIndexedDB,
//     getTestCaseByIDFromIndexedDB,
// } from "@/services/indexedDBService";

// import {
//     setTestCases,
//     setIsTestCaseIndexed,
//     fetchTestCases,
// } from "@/reduxToolkit/testCasesSlice";
// import { createSelector } from "reselect";

// import { selectTestCasesData, selectIsIndexed } from "@/reduxToolkit/selectors";

const TABLE_HEAD = [
    "id",
    "tcid",
    "title",
    "suite_name",
    "applicable_os",
    "stream",
    "category",
];

// const TestCasesListAndSelection = React.memo(() => {
//     const dispatch = useDispatch();
//     const [testCasesData, setTestCasesData] = useState([]);
//     const [isTestCaseIndexed, setIsTestCaseIndexed] = useState(false);
//     const [selectedRows, setSelectedRows] = useState([]);
//     const [error, setError] = useState(null);
//     const [reload, setReload] = useState(false);
//     const [loading, setLoading] = useState(true); // Add a loading state to avoid re-fetching
//     const testCaseIndexedData = useSelector((state) => state.testCases);
//     console.log("Test case indexed data: ", testCaseIndexedData);
//     // const isTestCaseIndexed = useSelector((state) => state.testCases.isIndexed);

//     const fetchTestCaseData = useCallback(async () => {
//         try {
//             console.log(
//                 "Test case indexed from fetchData : ",
//                 isTestCaseIndexed
//             );
//             if (!isTestCaseIndexed) {
//                 const response = await getTestCasesApi();
//                 console.log("Test cases response is:", response.data);
//                 setTestCasesData(response.data);

//                 // Dispatch test cases to Redux store
//                 dispatch(setTestCases(response.data));

//                 // await saveTestCasesToIndexedDB(response.data);
//                 // console.log("Test cases saved to IndexedDB:");
//                 // Mark test cases as indexed
//                 dispatch(setIsTestCaseIndexed(true));
//             } else {
//                 const testCases = testCaseIndexedData;
//                 console.log(`Test cases fetched from IndexedDB: ${testCases}`);
//                 setTestCasesData(testCases);
//             }
//         } catch (error) {
//             console.error("Error fetching test cases:", error);
//             setError(error);
//             dispatch(setIsTestCaseIndexed(false));
//         } finally {
//             setLoading(false); // Stop loading once everything is done
//         }
//     }, [dispatch, isTestCaseIndexed, testCaseIndexedData]);

//     useEffect(() => {
//         const loadTestCases = async () => {
//             console.log("Test case indexed: ", isTestCaseIndexed);
//             if (!isTestCaseIndexed) {
//                 console.log("Fetching from database");
//                 await fetchTestCaseData();
//             } else {
//                 // If already indexed, fetch from Redux
//                 const testCases = testCaseIndexedData;
//                 if (testCases && testCases.length) {
//                     // Ensure this is not updating state while rendering
//                     setTestCasesData(testCases);
//                 }
//                 console.log(
//                     `Test cases fetched from IndexedDB useEffect : ${testCases}`
//                 );
//             }
//         };
//         loadTestCases().catch(console.error);
//         console.log("Test cases data is:", testCasesData);
//     }, [reload, isTestCaseIndexed]);

// const TestCasesListAndSelection = React.memo(() => {
// const TestCasesListAndSelection = () => {
//     const dispatch = useDispatch();
//     const [testCasesRecord, setTestCasesRecord] = useState([]);
//     const testCasesData = useSelector(selectTestCasesData);
//     const isTestCaseIndexed = useSelector(selectIsIndexed);
//     const loading = useSelector((state) => state?.testCases?.loading);
//     const error = useSelector((state) => state?.testCases?.error);

//     // Fetch data if not indexed
//     useEffect(() => {
//         console.log(`TestCases : ${testCasesData}`);
//         console.log(`TestCases loading: ${loading}`);
//         console.log(`TestCases error : ${error}`);
//         if (!isTestCaseIndexed) {
//             console.log(`Test cases are not indexed, fetching them.`);
//             dispatch(fetchTestCases()); // Trigger async action to fetch test cases
//         } else {
//             console.log("Test cases are already indexed.");
//         }
//     }, [dispatch, isTestCaseIndexed, loading]);

//     // Update local state when testCasesData changes
//     useEffect(() => {
//         if (testCasesData && testCasesData.length > 0) {
//             console.log("Setting test cases from Redux:", testCasesData);
//             setTestCasesRecord(testCasesData); // Set state to Redux data
//         }
//         console.log(`Second useState : ${testCasesData}`);
//     }, [testCasesData, loading]);

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchTestCases } from "./testCasesSlice";
// import { selectTestCasesData, selectIsIndexed } from "./selectors";

// const TestCasesListAndSelection = React.memo(() => {
// const TestCasesListAndSelection = () => {
//     const dispatch = useDispatch();
//     const [testCasesRecord, setTestCasesRecord] = useState([]);
//     const [isHydrated, setIsHydrated] = useState(false); // Track hydration state

//     const testCasesData = useSelector(selectTestCasesData);
//     const isTestCaseIndexed = useSelector(selectIsIndexed);
//     const loading = useSelector((state) => state?.testCases?.loading);
//     const error = useSelector((state) => state?.testCases?.error);

//     // Only set hydration state after the component is mounted (client-side)
//     useEffect(() => {
//         setIsHydrated(true);
//     }, []);

//     useEffect(() => {
//         if (isHydrated && !isTestCaseIndexed) {
//             console.log("Fetching test cases...");
//             console.log("Test cases record set to:", testCasesData);

//             dispatch(fetchTestCases());
//         } else if (isHydrated && testCasesData.length) {
//             console.log("Setting test cases record...");
//             setTestCasesRecord(testCasesData);
//             console.log("Test cases record set to:", testCasesData);
//         }
//     }, [dispatch, isHydrated, isTestCaseIndexed, testCasesData]);

//     if (!isHydrated) {
//         return <div>Loading...</div>; // Show loading state until hydration
//     }

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { fetchTestCases } from "@/reduxToolkit/testCasesSlice";
import { fetchTestCases } from "@/reduxToolkit/testCasesSlice";

const TestCasesListAndSelection = React.memo(() => {
    const dispatch = useDispatch();
    const testCases = useSelector((state) => state.testCases?.data || []);
    const isIndexed = useSelector(
        (state) => state.testCases?.isIndexed || false
    );
    const loading = useSelector((state) => state.testCases?.loading || false);
    const error = useSelector((state) => state.testCases?.error || null);

    useEffect(() => {
        dispatch(fetchTestCases()); // Dispatch as early as possible
    }, [dispatch]);

    useEffect(() => {
        console.log(`Loading value : ${loading}`);
        if (!loading) {
            dispatch(fetchTestCases());
            console.log(`Dispatched fetchTestCases : ${isIndexed}`);
        } else {
            console.log(`Test Cases are : ${testCases}`);
        }
    }, [loading, dispatch, isIndexed]);

    return (
        // <div>It all right</div>
        <div>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <Card className="h-full w-full overflow-scroll">
                    <CardHeader
                        floated={false}
                        shadow={false}
                        className="mb-2 rounded-none p-2"
                    >
                        <div className="w-full md:w-96">
                            <Input
                                label="Search Invoice"
                                icon={
                                    <MagnifyingGlassIcon className="h-5 w-5" />
                                }
                            />
                        </div>
                    </CardHeader>
                    <table className="w-full min-w-max table-auto text-left">
                        <thead>
                            <tr>
                                {TABLE_HEAD.map(({ head, icon }, index) => (
                                    <th
                                        key={index}
                                        className="border-b border-gray-300 p-4"
                                    >
                                        <div className="flex items-center gap-1">
                                            {icon}
                                            <Typography
                                                color="blue-gray"
                                                variant="small"
                                                className="!font-bold"
                                            >
                                                {head}
                                            </Typography>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {testCases?.map((record, index) => {
                                const isLast = index === testCases.length - 1;
                                const classes = isLast
                                    ? "p-4"
                                    : "p-4 border-b border-gray-300";

                                return (
                                    // <tr key={record.id}>
                                    <tr key={index}>
                                        <td className={classes}>
                                            <div className="flex items-center gap-1">
                                                <Checkbox />
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-bold"
                                                >
                                                    {record.id}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className={classes}>
                                            <Typography
                                                variant="small"
                                                className="font-normal text-gray-600"
                                            >
                                                {record.tcid}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <Typography
                                                variant="small"
                                                className="font-normal text-gray-600"
                                            >
                                                {record.title}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <Typography
                                                variant="small"
                                                className="font-normal text-gray-600"
                                            >
                                                {record.suite_name}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <Typography
                                                variant="small"
                                                className="font-normal text-gray-600"
                                            >
                                                {record.applicable_os}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <Typography
                                                variant="small"
                                                className="font-normal text-gray-600"
                                            >
                                                {record.stream}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <Typography
                                                variant="small"
                                                className="font-normal text-gray-600"
                                            >
                                                {record.category}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <div className="flex items-center gap-2">
                                                <IconButton
                                                    variant="text"
                                                    size="sm"
                                                >
                                                    <DocumentIcon className="h-4 w-4 text-gray-900" />
                                                </IconButton>
                                                <IconButton
                                                    variant="text"
                                                    size="sm"
                                                >
                                                    <ArrowDownTrayIcon
                                                        strokeWidth={3}
                                                        className="h-4 w-4 text-gray-900"
                                                    />
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Card>
            )}
        </div>
    );
});

export default TestCasesListAndSelection;

// // const dispatch = useDispatch();
// // const testCases = useSelector((state) => state.testCases?.testCases || []);
// // // Ensure that testCases is defined, fallback to an empty array if undefined

// // const isIndexed = useSelector(
// //     (state) => state.testCases?.isIndexed || false
// // );
// // const loading = useSelector((state) => state.testCases?.loading || false);
// // const error = useSelector((state) => state.testCases?.error || null);
// // const testCases = useSelector(selectTestCases);
// const dispatch = useDispatch();

// const testCasesData = useSelector(selectTestCasesData);
// const isIndexed = useSelector(selectIsIndexed);
// const loading = useSelector((state) => state.testCases.loading);
// const error = useSelector((state) => state.testCases.error);

// // const [testCasesData, setTestCasesData] = useState([]);

// const fetchTestCaseData = useCallback(() => {
//     if (!isIndexed) {
//         // Dispatch the thunk to fetch test cases
//         console.log("Fetching test cases from dispatch fetchTestCase...");
//         dispatch(fetchTestCases());
//     } else {
//         setTestCasesData(testCases); // If already indexed, use the Redux state
//     }
// }, [dispatch, isIndexed, testCases]);

// useEffect(() => {
//     if (!isIndexed && !loading) {
//         // dispatch(fetchTestCases());
//         console.log("Fetching test cases from dispatch useEffect...");
//         fetchTestCaseData();
//     }
//     console.log(
//         `Fetching test cases from dispatch useEffect...${isIndexed} and loading : ${loading}`
//     );
// }, [isIndexed, loading, dispatch]);
