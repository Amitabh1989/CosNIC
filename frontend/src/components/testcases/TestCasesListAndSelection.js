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
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTestCases } from "@/reduxToolkit/testCasesSlice";
import { createSelector } from "reselect";

import ReactVirtualizedMultiGrid from "react-virtualized-multi-grid";
const STYLE = {
    border: "1px solid #ddd", // Border for cells and headers
    fontFamily: "'Poppins', sans-serif", // Apply Poppins font family to all content
    fontSize: "14px", // Font size for cells and headers
    fontWeight: "400", // Regular weight for data rows
    evenRow: {
        backgroundColor: "#f9f9f9", // Light background for even rows
    },
    oddRow: {
        backgroundColor: "#ffffff", // White background for odd rows
    },
    header: {
        fontWeight: "600", // Bold weight for header
        backgroundColor: "#f1f1f1", // Light gray background for header
        paddingLeft: "8px", // Left padding for header cells only
    },
    cell: {
        paddingLeft: "8px", // Left padding for data cells only
    },
};

const selectTestCasesData = createSelector(
    (state) => state.testCases?.data || [],
    (data) => [...data]
);

const TestCasesListAndSelection = React.memo(() => {
    const dispatch = useDispatch();
    const testCases = useSelector(selectTestCasesData);
    const loading = useSelector((state) => state.testCases?.loading || false);
    const hasMore = useSelector((state) => state.testCases?.hasMore || false);
    const isIndexed = useSelector(
        (state) => state.testCases?.isIndexed || false
    );
    const error = useSelector((state) => state.testCases?.error || null);
    const [selectedTestCases, setSelectedTestCases] = useState([]);

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Debounced search term
    const [searchTerm, setSearchTerm] = useState(""); // For handling the search term
    const [value, onRowClick] = React.useState("");
    const [page, setPage] = useState(1);

    const columns = useMemo(() => [
        {
            width: 60,
            label: "#",
            dataKey: "index",
            sort: false,
            align: "center", // left-right-center default left
            render: (value, rowData, rowIndex) => rowIndex + 1,
        },
        {
            width: 80,
            label: "Select",
            dataKey: "id",
            sort: true,
            align: "left",
            render: (value, rowData) => (
                <Checkbox
                    label={rowData.id}
                    value={rowData.id}
                    onChange={() => handleCheckboxChange(rowData.id)}
                    className="cursor-pointer"
                    ripple={true}
                />
            ), // Render a checkbox in the ID column
        },
        {
            width: 60,
            label: "TCID",
            dataKey: "tcid",
            sort: true,
            align: "left",
        },
        {
            width: 200,
            label: "Suite Name",
            dataKey: "suite_name",
            sort: true,
            align: "left",
        },
        {
            width: 90,
            label: "OS",
            dataKey: "applicable_os",
            sort: true,
            align: "left",
        },
        {
            width: 80,
            label: "Stream",
            dataKey: "stream",
            sort: true,
            align: "left",
        },
        {
            width: 80,
            label: "Category",
            dataKey: "stream",
            sort: true,
            align: "left",
        },
        {
            width: 80,
            label: "Actions",
            dataKey: "action",
            sort: true,
            align: "left",
            render: (value, rowData) => (
                <div className="flex gap-2">
                    <IconButton variant="text" size="sm">
                        <DocumentIcon className="h-5 w-5 text-gray-900" />
                    </IconButton>
                    <IconButton variant="text" size="sm">
                        <ArrowDownTrayIcon
                            strokeWidth={3}
                            className="h-5 w-5 text-gray-900"
                        />
                    </IconButton>
                </div>
            ), // Render action icons
        },
    ]);

    // Scroll event listener to trigger loading more data
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } =
            e.target.documentElement;
        if (scrollHeight - scrollTop === clientHeight && !loading && hasMore) {
            setPage((prevPage) => prevPage + 1); // Load the next page
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, hasMore]);

    const handleSearch = (e) => {
        const { name, value } = e.target;
        console.log(`Search Term is : ${value}`);
        setSearchTerm(value);
    };

    useEffect(() => {
        if (!loading) {
            console.log("Sending dispatch");
            dispatch(fetchTestCases());
            console.log("Sending dispatch : ", loading);
        }
    }, []);

    const handleCheckboxChange = useCallback((id) => {
        setSelectedTestCases((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((testCaseId) => testCaseId !== id);
            } else {
                return [...prevSelected, id];
            }
        });
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
                    ?.toLowerCase()
                    .includes(debouncedSearchTerm.toLowerCase()) ||
                record.suite_name
                    ?.toLowerCase()
                    .includes(debouncedSearchTerm.toLowerCase()) ||
                record.stream
                    ?.toLowerCase()
                    .includes(debouncedSearchTerm.toLowerCase()) ||
                record.category
                    ?.toLowerCase()
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

    return (
        <div>
            <Card className="h-full w-full overflow-scroll">
                <CardHeader
                    floated={false}
                    shadow={false}
                    className="mb-2 rounded-none p-2"
                >
                    <div className="w-full md:w-96">
                        <Input
                            label="Search TestCase"
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            onChange={handleSearch}
                        />
                    </div>
                </CardHeader>
                <br />

                <div
                    style={{
                        width: "100%",
                        height: "100vh",
                        fontFamily: "'Poppins', sans-serif", // Apply font here
                    }}
                    className="p-4 shadow-lg"
                >
                    <ReactVirtualizedMultiGrid
                        rowKey="id"
                        rows={filteredTestCases}
                        columns={columns}
                        value={value}
                        onRowClick={onRowClick}
                        className="font-poppins"
                        rowHeight={30}
                        // rowCount={testCases?.length || 0}
                        style={STYLE}
                    />
                </div>
            </Card>
        </div>
    );
});

export default TestCasesListAndSelection;

// // Header renderer for column headers
// const headerRenderer = ({ columnIndex, key, style }) => {
//     return (
//         <div
//             key={key}
//             style={{ ...style, ...STYLE.header }} // Apply header styles
//             className="header-cell"
//         >
//             {columns[columnIndex].label} {/* Display column label */}
//         </div>
//     );
// };

// const cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
//     if (rowIndex === 0) return null; // Ignore the header row
//     const rowStyle = rowIndex % 2 === 0 ? STYLE.evenRow : STYLE.oddRow;
//     const cellData =
//         filteredTestCases[rowIndex][columns[columnIndex].dataKey];

//     return (
//         <div
//             key={key}
//             style={{ ...style, ...rowStyle, ...STYLE, padding: "8px" }} // Added padding for font spacing
//             className="cell"
//         >
//             {cellData}
//         </div>
//     );
// };
