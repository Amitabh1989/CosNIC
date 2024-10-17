"use client";
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

const TABLE_HEAD = [
    "id",
    "tcid",
    "title",
    "suite_name",
    "applicable_os",
    "stream",
    "category",
];

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTestCases } from "@/reduxToolkit/testCasesSlice";
import { createSelector } from "reselect"; // To memoize selectors

// Memoized selector using reselect
const selectTestCasesData = createSelector(
    (state) => state.testCases?.data || [],
    (data) => [...data]
);

const TestCasesListAndSelection = React.memo(() => {
    const dispatch = useDispatch();
    // Memoized selectors to avoid unnecessary re-renders
    const testCases = useSelector(selectTestCasesData);
    const loading = useSelector((state) => state.testCases?.loading || false);
    const isIndexed = useSelector(
        (state) => state.testCases?.isIndexed || false
    );
    const error = useSelector((state) => state.testCases?.error || null);

    // Local States
    const [nativeTestCasesList, setNativeTestCasesList] = useState(testCases);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Debounced search term
    const [searchTerm, setSearchTerm] = useState(""); // For handling the search term

    const handleSearch = (term) => {
        console.log(`Seacth term is : ${term}`);
        setSearchTerm(term);
    };

    useEffect(() => {
        console.log(`Loading value : ${loading}`);
        if (!loading) {
            dispatch(fetchTestCases());
            console.log(`Dispatched fetchTestCases : ${isIndexed}`);
        } else {
            console.log(`Test Cases are : ${testCases}`);
        }
    }, []);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedSearchTerm === "") {
            setNativeTestCasesList(testCases);
        } else {
            const filteredRecords = testCases.filter((record) => {
                return (
                    record.title
                        .toLowerCase()
                        .includes(debouncedSearchTerm.toLowerCase()) ||
                    record.suite_name
                        .toLowerCase()
                        .includes(debouncedSearchTerm.toLowerCase()) ||
                    record.stream
                        .toLowerCase()
                        .includes(debouncedSearchTerm.toLowerCase()) ||
                    record.category
                        .toLowerCase()
                        .includes(debouncedSearchTerm.toLowerCase())
                );
            });
            setNativeTestCasesList(filteredRecords);
        }
    }, [searchTerm, debouncedSearchTerm]);

    // const handleSearch = (searchTerm) => {};

    // UI: Show loading, error, or data
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

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
                                value={searchTerm}
                                icon={
                                    <MagnifyingGlassIcon className="h-5 w-5" />
                                }
                                onChange={(e) => handleSearch(e.target.value)}
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
                            {nativeTestCasesList?.map((record, index) => {
                                const isLast =
                                    index === nativeTestCasesList.length - 1;
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

// import { fetchTestCases, setTestCases } from "@/reduxToolkit/testCasesSlice";

// const TestCasesListAndSelection = React.memo(() => {
//     // const TestCasesListAndSelection = () => {
//     const dispatch = useDispatch();

//     // const testCases = useSelector((state) => state.testCases.data);
//     const testCases = useSelector((state) => state.testCases?.data || []);
//     const isIndexed = useSelector(
//         (state) => state.testCases?.isIndexed || false
//     );
//     const loading = useSelector((state) => state.testCases?.loading || false);
//     const error = useSelector((state) => state.testCases?.error || null);

//     useEffect(() => {
//         const data = {
//             id: 1,
//             title: "Dummy Tets Case",
//             tcid: "100",
//             suite_name: "Demo",
//             applicable_os: "linux",
//             stream: "core",
//             category: "functional",
//         };
//         dispatch(setTestCases(data));
//         console.log("Data has been saved in the setTestCases");
//         // dispatch(fetchTestCases()); // Dispatch as early as possible
//         // }, [dispatch]);
//     }, []);

//     useEffect(() => {
//         console.log(`Loading value : ${loading}`);
//         if (!loading) {
//             dispatch(fetchTestCases());
//             console.log(`Dispatched fetchTestCases : ${isIndexed}`);
//         } else {
//             console.log(`Test Cases are : ${testCases}`);
//         }
//     }, []);

//     return (
//         // <div>It all right</div>
//         <div>
//             {loading ? (
//                 <div>Loading...</div>
//             ) : error ? (
//                 <div>{error}</div>
//             ) : (
//                 <Card className="h-full w-full overflow-scroll">
//                     <CardHeader
//                         floated={false}
//                         shadow={false}
//                         className="mb-2 rounded-none p-2"
//                     >
//                         <div className="w-full md:w-96">
//                             <Input
//                                 label="Search Invoice"
//                                 icon={
//                                     <MagnifyingGlassIcon className="h-5 w-5" />
//                                 }
//                             />
//                         </div>
//                     </CardHeader>
//                     <table className="w-full min-w-max table-auto text-left">
//                         <thead>
//                             <tr>
//                                 {TABLE_HEAD.map(({ head, icon }, index) => (
//                                     <th
//                                         key={index}
//                                         className="border-b border-gray-300 p-4"
//                                     >
//                                         <div className="flex items-center gap-1">
//                                             {icon}
//                                             <Typography
//                                                 color="blue-gray"
//                                                 variant="small"
//                                                 className="!font-bold"
//                                             >
//                                                 {head}
//                                             </Typography>
//                                         </div>
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {testCases?.map((record, index) => {
//                                 const isLast = index === testCases.length - 1;
//                                 const classes = isLast
//                                     ? "p-4"
//                                     : "p-4 border-b border-gray-300";

//                                 return (
//                                     // <tr key={record.id}>
//                                     <tr key={index}>
//                                         <td className={classes}>
//                                             <div className="flex items-center gap-1">
//                                                 <Checkbox />
//                                                 <Typography
//                                                     variant="small"
//                                                     color="blue-gray"
//                                                     className="font-bold"
//                                                 >
//                                                     {record.id}
//                                                 </Typography>
//                                             </div>
//                                         </td>
//                                         <td className={classes}>
//                                             <Typography
//                                                 variant="small"
//                                                 className="font-normal text-gray-600"
//                                             >
//                                                 {record.tcid}
//                                             </Typography>
//                                         </td>
//                                         <td className={classes}>
//                                             <Typography
//                                                 variant="small"
//                                                 className="font-normal text-gray-600"
//                                             >
//                                                 {record.title}
//                                             </Typography>
//                                         </td>
//                                         <td className={classes}>
//                                             <Typography
//                                                 variant="small"
//                                                 className="font-normal text-gray-600"
//                                             >
//                                                 {record.suite_name}
//                                             </Typography>
//                                         </td>
//                                         <td className={classes}>
//                                             <Typography
//                                                 variant="small"
//                                                 className="font-normal text-gray-600"
//                                             >
//                                                 {record.applicable_os}
//                                             </Typography>
//                                         </td>
//                                         <td className={classes}>
//                                             <Typography
//                                                 variant="small"
//                                                 className="font-normal text-gray-600"
//                                             >
//                                                 {record.stream}
//                                             </Typography>
//                                         </td>
//                                         <td className={classes}>
//                                             <Typography
//                                                 variant="small"
//                                                 className="font-normal text-gray-600"
//                                             >
//                                                 {record.category}
//                                             </Typography>
//                                         </td>
//                                         <td className={classes}>
//                                             <div className="flex items-center gap-2">
//                                                 <IconButton
//                                                     variant="text"
//                                                     size="sm"
//                                                 >
//                                                     <DocumentIcon className="h-4 w-4 text-gray-900" />
//                                                 </IconButton>
//                                                 <IconButton
//                                                     variant="text"
//                                                     size="sm"
//                                                 >
//                                                     <ArrowDownTrayIcon
//                                                         strokeWidth={3}
//                                                         className="h-4 w-4 text-gray-900"
//                                                     />
//                                                 </IconButton>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 );
//                             })}
//                         </tbody>
//                     </table>
//                 </Card>
//             )}
//         </div>
//     );
// });

// export default TestCasesListAndSelection;

// useMemo to memoize derived states (can be skipped if no computational derivation)
// const testCasesMemo = useMemo(() => testCases, [testCases]);
// const filteredTestCases = useMemo(() => {
//     if (!debouncedSearchTerm) return testCases;
//     return testCases.filter((record) =>
//         [
//             record.title,
//             record.suite_name,
//             record.stream,
//             record.category,
//         ].some((field) =>
//             field.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
//         )
//     );
// }, [testCases, debouncedSearchTerm]);
