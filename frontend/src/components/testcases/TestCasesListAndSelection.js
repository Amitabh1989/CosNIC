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

const TABLE_HEAD = [
    "id",
    "tcid",
    "title",
    "suite_name",
    "applicable_os",
    "stream",
    "category",
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
            dispatch(fetchTestCases());
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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // const Row = ({ index, style }) => {
    //     const record = filteredTestCases[index];
    //     const isLast = index === filteredTestCases.length - 1;
    //     const classes = isLast ? "p-4" : "p-4 border-b border-gray-300";

    //     return (
    //         <tr key={record.id} style={style}>
    //             <td className={classes}>
    //                 <div className="flex items-center gap-1">
    //                     <Checkbox />
    //                     <Typography
    //                         variant="small"
    //                         color="blue-gray"
    //                         className="font-bold"
    //                     >
    //                         {record.id}
    //                     </Typography>
    //                 </div>
    //             </td>
    //             <td className={classes}>
    //                 <Typography
    //                     variant="small"
    //                     className="font-normal text-gray-600"
    //                 >
    //                     {record.tcid}
    //                 </Typography>
    //             </td>
    //             <td className={classes}>
    //                 <Typography
    //                     variant="small"
    //                     className="font-normal text-gray-600"
    //                 >
    //                     {record.title}
    //                 </Typography>
    //             </td>
    //             <td className={classes}>
    //                 <Typography
    //                     variant="small"
    //                     className="font-normal text-gray-600"
    //                 >
    //                     {record.suite_name}
    //                 </Typography>
    //             </td>
    //             <td className={classes}>
    //                 <Typography
    //                     variant="small"
    //                     className="font-normal text-gray-600"
    //                 >
    //                     {record.applicable_os}
    //                 </Typography>
    //             </td>
    //             <td className={classes}>
    //                 <Typography
    //                     variant="small"
    //                     className="font-normal text-gray-600"
    //                 >
    //                     {record.stream}
    //                 </Typography>
    //             </td>
    //             <td className={classes}>
    //                 <Typography
    //                     variant="small"
    //                     className="font-normal text-gray-600"
    //                 >
    //                     {record.category}
    //                 </Typography>
    //             </td>
    //             <td className={classes}>
    //                 <div className="flex items-center gap-2">
    //                     <IconButton variant="text" size="sm">
    //                         <DocumentIcon className="h-4 w-4 text-gray-900" />
    //                     </IconButton>
    //                     <IconButton variant="text" size="sm">
    //                         <ArrowDownTrayIcon
    //                             strokeWidth={3}
    //                             className="h-4 w-4 text-gray-900"
    //                         />
    //                     </IconButton>
    //                 </div>
    //             </td>
    //         </tr>
    //     );
    // };

    // Fixing row height by setting specific height using style
    const Row = ({ index, style }) => {
        const record = filteredTestCases[index];
        return (
            <div style={style} className="flex p-2 border-b border-gray-300">
                <div className="w-1/12">
                    <Checkbox />
                </div>
                <div className="w-2/12">
                    <Typography variant="small" className="font-bold">
                        {record.id}
                    </Typography>
                </div>
                <div className="w-2/12">
                    <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                    >
                        {record.tcid}
                    </Typography>
                </div>
                <div className="w-2/12">
                    <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                    >
                        {record.title}
                    </Typography>
                </div>
                <div className="w-2/12">
                    <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                    >
                        {record.suite_name}
                    </Typography>
                </div>
                <div className="w-1/12">
                    <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                    >
                        {record.applicable_os}
                    </Typography>
                </div>
                <div className="w-1/12">
                    <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                    >
                        {record.stream}
                    </Typography>
                </div>
                <div className="w-1/12">
                    <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                    >
                        {record.category}
                    </Typography>
                </div>
                <div className="w-1/12 flex items-center gap-2">
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
        <Card className="h-full w-full overflow-scroll">
            <CardHeader
                floated={false}
                shadow={false}
                className="mb-2 rounded-none p-2"
            >
                <div className="w-full md:w-96">
                    <Input
                        label="Search Test Cases"
                        value={searchTerm}
                        icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </CardHeader>
            <table className="w-full min-w-max table-auto text-left">
                <thead>
                    <tr>
                        {TABLE_HEAD.map((head, index) => (
                            <th
                                key={index}
                                className="border-b border-gray-300 p-4"
                            >
                                <div className="flex items-center gap-1">
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
                    <List
                        height={500} // Adjust height as needed
                        itemCount={filteredTestCases.length}
                        itemSize={50} // Row height
                        width={"2000%"}
                    >
                        {Row}
                    </List>
                </tbody>
            </table>
        </Card>
    );
});

export default TestCasesListAndSelection;
