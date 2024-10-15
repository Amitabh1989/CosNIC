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
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTestCases } from "@/reduxToolkit/testCasesSlice";
import { createSelector } from "reselect";
import { FixedSizeList as List } from "react-window"; // Virtualization library
// import { Virtuoso, TableVirtuoso, Table } from "react-virtuoso";
import AutoSizer from "react-virtualized-auto-sizer";
// import styled from "styled-components";

const TABLE_HEAD = [
    "id",
    "tcid",
    "title",
    "suite_name",
    "applicable_os",
    "stream",
    "category",
    "actions",
];

// Memoized selector
const selectTestCasesData = createSelector(
    (state) => state.testCases?.data || [],
    (data) => [...data]
);

const TestCasesListAndSelection = React.memo(() => {
    const dispatch = useDispatch();
    const testCases = useSelector(selectTestCasesData);
    const loading = useSelector((state) => state.testCases?.loading || false);
    const isIndexed = useSelector(
        (state) => state.testCases?.isIndexed || false
    );
    const error = useSelector((state) => state.testCases?.error || null);

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Debounced search term
    const [searchTerm, setSearchTerm] = useState(""); // For handling the search term

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    useEffect(() => {
        if (!loading) {
            console.log("Sending dispatch");
            dispatch(fetchTestCases());
            console.log("Sending dispatch : ", loading);
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

    // Memoized filtered records
    const filteredTestCases = useMemo(() => {
        if (debouncedSearchTerm === "") {
            return testCases;
        }
        return testCases.filter((record) => {
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
    }, [debouncedSearchTerm, testCases]);

    useEffect(() => {
        console.log("Checking test cases : ", testCases);
        console.log("Checking test cases loading : ", loading);
    }, [loading, testCases, error]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // const Row = ({ index, style }) => {
    //     const record = filteredTestCases[index];
    //     const bgColor = index % 2 === 0 ? "bg-gray-300" : "bg-white"; // Alternating colors
    //     return (
    //         <div
    //             style={style}
    //             className={`flex flex-row-9 gap-4 justify-between p-4 ${bgColor} content-between self-auto`}
    //         >
    //             <div className="flex-grow-0 w-16">
    //                 {/* Adjusted width for Select */}
    //                 <Checkbox />
    //             </div>
    //             <div className="flex-grow-0 w-16">
    //                 <Typography variant="small" className="font-bold">
    //                     {record.id}
    //                 </Typography>
    //             </div>
    //             <div className="flex-grow-0 w-16">
    //                 <Typography
    //                     variant="small"
    //                     className="font-normal text-gray-600"
    //                 >
    //                     {record.tcid}
    //                 </Typography>
    //             </div>
    //             <div className="flex-grow w-32">
    //                 {/* Suite Name takes more space */}
    //                 <Typography
    //                     variant="small"
    //                     className="font-normal text-gray-600"
    //                 >
    //                     {record.suite_name}
    //                 </Typography>
    //             </div>
    //             <div className="flex-grow w-32">
    //                 {/* Title takes more space */}
    //                 <Typography
    //                     variant="small"
    //                     className="font-normal text-gray-600"
    //                 >
    //                     {record.title}
    //                 </Typography>
    //             </div>
    //             <div className="flex-grow-0 w-24">
    //                 <Typography
    //                     variant="small"
    //                     className="font-normal text-gray-600"
    //                 >
    //                     {record.applicable_os}
    //                 </Typography>
    //             </div>
    //             <div className="flex-grow-0 w-24">
    //                 <Typography
    //                     variant="small"
    //                     className="font-normal text-gray-600"
    //                 >
    //                     {record.stream}
    //                 </Typography>
    //             </div>
    //             <div className="flex-grow-0 w-24">
    //                 <Typography
    //                     variant="small"
    //                     className="font-normal text-gray-600"
    //                 >
    //                     {record.category}
    //                 </Typography>
    //             </div>
    //             <div className="flex-grow-0">
    //                 <IconButton variant="text" size="sm">
    //                     <DocumentIcon className="h-4 w-4 text-gray-900" />
    //                 </IconButton>
    //                 <IconButton variant="text" size="sm">
    //                     <ArrowDownTrayIcon
    //                         strokeWidth={3}
    //                         className="h-4 w-4 text-gray-900"
    //                     />
    //                 </IconButton>
    //             </div>
    //         </div>
    //     );
    // };
    // className={`flex flex-col flex-no-wrap gap-4 justify-between p-4 ${bgColor} content-between self-auto`}

    // <div style={style} className="flex flex-col gap-2">
    // <div style={style} className={`p-2 ${bgColor}`}>
    // const EachRow = ({ index, style }) => {
    //     const record = filteredTestCases[index];
    //     const bgColor = index % 2 === 0 ? "bg-gray-300" : "bg-white"; // Alternating colors
    //     return (
    //         <div style={style} className="flex flex-col gap-2">
    //             <div className="grid grid-rows-5 gap-2 p-2">
    //                 <div className="col-span-1">
    //                     <Checkbox />
    //                     {"Hey man"}
    //                 </div>
    //                 <div className="col-span-1">
    //                     <Typography variant="small" className="font-bold">
    //                         {record.id}
    //                     </Typography>
    //                 </div>
    //                 <div className="col-span-1">
    //                     <Typography
    //                         variant="small"
    //                         className="font-normal text-gray-600"
    //                     >
    //                         {record.tcid}
    //                     </Typography>
    //                 </div>
    //                 <div>
    //                     <Typography
    //                         variant="small"
    //                         className="font-normal text-gray-600"
    //                     >
    //                         {record.suite_name}
    //                     </Typography>
    //                 </div>
    {
        /* <div>
                        <Typography
                            variant="small"
                            className="font-normal text-gray-600"
                        >
                            {record.title}
                        </Typography>
                    </div>
                    <div>
                        <Typography
                            variant="small"
                            className="font-normal text-gray-600"
                        >
                            {record.applicable_os}
                        </Typography>
                    </div>
                    <div>
                        <Typography
                            variant="small"
                            className="font-normal text-gray-600"
                        >
                            {record.stream}
                        </Typography>
                    </div>
                    <div>
                        <Typography
                            variant="small"
                            className="font-normal text-gray-600"
                        >
                            {record.category}
                        </Typography>
                    </div> */
    }
    {
        /* <div className="flex gap-2">
                        <IconButton variant="text" size="sm">
                            <DocumentIcon className="h-4 w-4 text-gray-900" />
                        </IconButton>
                        <IconButton variant="text" size="sm">
                            <ArrowDownTrayIcon
                                strokeWidth={3}
                                className="h-4 w-4 text-gray-900"
                            />
                        </IconButton>
                    </div>
                </div>
            </div>
        );
    }; */
    }

    const EachRow = ({ index, style }) => {
        const record = filteredTestCases[index];
        const bgColor = index % 2 === 0 ? "bg-gray-100" : "bg-white"; // Alternating colors

        return (
            // Apply the `style` prop here for react-window positioning
            <div
                style={style}
                className={`flex items-start justify-between gap-2 p-2 ${bgColor}`}
            >
                <div className="flex-shrink-0">
                    <Checkbox />
                </div>
                <div className="flex-shrink-0 w-16">
                    <Typography variant="small" className="font-bold">
                        {record.id}
                    </Typography>
                </div>
                <div className="flex-shrink-0 w-16">
                    <Typography variant="small" className="font-bold">
                        {record.tcid}
                    </Typography>
                </div>
                <div className="flex-grow">
                    <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                    >
                        {record.suite_name}
                    </Typography>
                </div>
                {/* <div className="flex-shrink-0 w-16">
                    <Typography variant="small" className="font-bold">
                        {record.applicable_os}
                    </Typography>
                </div>
                <div className="flex-shrink-0 w-16">
                    <Typography variant="small" className="font-bold">
                        {record.stream}
                    </Typography>
                </div>
                <div className="flex-shrink-0 w-16">
                    <Typography variant="small" className="font-bold">
                        {record.category}
                    </Typography>
                </div> */}

                <div className="flex-shrink-0">
                    <IconButton variant="text" size="sm">
                        <DocumentIcon className="h-4 w-4 text-gray-900" />
                    </IconButton>
                    <IconButton variant="text" size="sm">
                        <ArrowDownTrayIcon
                            strokeWidth={3}
                            className="h-4 w-4 text-gray-900"
                        />
                    </IconButton>
                </div>
            </div>
        );
    };

    return (
        <List
            height={600} // Fixed height
            itemCount={filteredTestCases.length} // How many rows to render
            itemSize={40} // Row height
            width={"100%"} // Full width
        >
            {EachRow}
        </List>
    );
});

//     return (
//         <div className="container" style={{ height: "800px", width: "100%" }}>
//             <AutoSizer>
//                 {({ height, width }) => {
//                     console.log("AutoSizer height:", height, "width:", width);
//                     return (
//                         <List
//                             height={height}
//                             itemCount={filteredTestCases.length}
//                             itemSize={40}
//                             width={width}
//                         >
//                             {EachRow}
//                         </List>
//                     );
//                 }}
//             </AutoSizer>
//         </div>
//     );
// });

export default TestCasesListAndSelection;

//     return (
//         <TableVirtuoso
//             style={{ height: "400px" }}
//             totalCount={filteredTestCases.length}
//             fixedHeaderContent={() => (
//                 <tr>
//                     <th style={{ width: "100px" }}>ID</th>
//                     <th style={{ width: "100px" }}>TCID</th>
//                     <th style={{ width: "100px" }}>Title</th>
//                     <th style={{ width: "150px" }}>Suite Name</th>
//                     <th style={{ width: "100px" }}>Applicable OS</th>
//                     <th style={{ width: "100px" }}>Stream</th>
//                     <th style={{ width: "100px" }}>Category</th>
//                     <th style={{ width: "100px" }}>Actions</th>
//                 </tr>
//             )}
//             itemContent={(index) => {
//                 const record = filteredTestCases[index];
//                 const bgColor = index % 2 === 0 ? "bg-gray-300" : "bg-white"; // Alternating row colors

//                 return (
//                     <tr className={`border-b ${bgColor}`}>
//                         <td
//                             className="p-2 text-center"
//                             style={{ width: "100px" }}
//                         >
//                             {record.id}
//                         </td>
//                         <td
//                             className="p-2 text-center"
//                             style={{ width: "100px" }}
//                         >
//                             {record.tcid}
//                         </td>
//                         <td
//                             className="p-2 text-center"
//                             style={{ width: "100px" }}
//                         >
//                             {record.title}
//                         </td>
//                         <td
//                             className="p-2 text-center"
//                             style={{ width: "150px" }}
//                         >
//                             {record.suite_name}
//                         </td>
//                         <td
//                             className="p-2 text-center"
//                             style={{ width: "100px" }}
//                         >
//                             {record.applicable_os}
//                         </td>
//                         <td
//                             className="p-2 text-center"
//                             style={{ width: "100px" }}
//                         >
//                             {record.stream}
//                         </td>
//                         <td
//                             className="p-2 text-center"
//                             style={{ width: "100px" }}
//                         >
//                             {record.category}
//                         </td>
//                         <td
//                             className="p-2 text-center"
//                             style={{ width: "100px" }}
//                         >
//                             {record.action}
//                         </td>
//                     </tr>
//                 );
//             }}
//         />
//     );
// });

// const VirtuosoRow = ({ index }) => {
//     const record = filteredTestCases[index];
//     const bgColor = index % 2 === 0 ? "bg-gray-300" : "bg-white"; // Alternating colors

//     return (
//         <div
//             // style={style}
//             className={`flex flex-row flex-nowrap gap-4 justify-between p-4 m-4 ${bgColor}`}
//         >
//             <div className="flex-grow-0 w-16">
//                 {" "}
//                 {/* Adjusted width for Select */}
//                 <Checkbox />
//             </div>
//             <div className="flex-grow-0 w-16">
//                 <Typography variant="small" className="font-bold">
//                     {record.id}
//                 </Typography>
//             </div>
//             <div className="flex-grow-0 w-16">
//                 <Typography
//                     variant="small"
//                     className="font-normal text-gray-600"
//                 >
//                     {record.tcid}
//                 </Typography>
//             </div>
//             <div className="flex-grow w-32">
//                 {" "}
//                 {/* Suite Name takes more space */}
//                 <Typography
//                     variant="small"
//                     className="font-normal text-gray-600"
//                 >
//                     {record.suite_name}
//                 </Typography>
//             </div>
//             <div className="flex-grow w-32">
//                 {" "}
//                 {/* Title takes more space */}
//                 <Typography
//                     variant="small"
//                     className="font-normal text-gray-600"
//                 >
//                     {record.title}
//                 </Typography>
//             </div>
//             <div className="flex-grow-0 w-24">
//                 <Typography
//                     variant="small"
//                     className="font-normal text-gray-600"
//                 >
//                     {record.applicable_os}
//                 </Typography>
//             </div>
//             <div className="flex-grow-0 w-24">
//                 <Typography
//                     variant="small"
//                     className="font-normal text-gray-600"
//                 >
//                     {record.stream}
//                 </Typography>
//             </div>
//             <div className="flex-grow-0 w-24">
//                 <Typography
//                     variant="small"
//                     className="font-normal text-gray-600"
//                 >
//                     {record.category}
//                 </Typography>
//             </div>
//             <div className="flex-grow-0">
//                 <IconButton variant="text" size="sm">
//                     <DocumentIcon className="h-4 w-4 text-gray-900" />
//                 </IconButton>
//                 <IconButton variant="text" size="sm">
//                     <ArrowDownTrayIcon
//                         strokeWidth={3}
//                         className="h-4 w-4 text-gray-900"
//                     />
//                 </IconButton>
//             </div>
//         </div>
//     );
// };
