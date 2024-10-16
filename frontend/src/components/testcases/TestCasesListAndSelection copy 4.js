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
import React, {
    useEffect,
    useMemo,
    useState,
    useCallback,
    useRef,
    useContext,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTestCases, resetTestCases } from "@/reduxToolkit/testCasesSlice";
import { createSelector } from "reselect";
import { DefaultSkeleton } from "../common/Skeleton";
// import { TestCasesContext } from "../contexts/TestCasesContext";
import { TestCasesContext } from "../../contexts/TestCasesContext";
import TestCasesCart from "../cart/TestCasesCart";

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
    const [handleTestCasesSelection] = useContext(TestCasesContext);
    // const hasMore = useSelector((state) => state.testCases?.hasMore || false);
    // const isIndexed = useSelector(
    //     (state) => state.testCases?.isIndexed || false
    // );
    // const error = useSelector((state) => state.testCases?.error || null);
    // const [selectedTestCases, setSelectedTestCases] = useState([]);

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Debounced search term
    const [searchTerm, setSearchTerm] = useState(""); // For handling the search term
    const [value, onRowClick] = React.useState("");
    // const [scrollPos, setScrollPos] = useState(0); // To track scroll position
    const [combinedTestCases, setCombinedTestCases] = useState([]); // Final state to render
    const tableRef = useRef(null); // Create a ref for the table

    // Columns for the table
    const columns = useMemo(
        () => [
            {
                width: 60,
                label: "#",
                dataKey: "index",
                render: (value, rowData, rowIndex) => rowIndex + 1,
            },
            {
                width: 80,
                label: "Select",
                dataKey: "id",
                render: (value, rowData) => (
                    <Checkbox
                        label={rowData.id}
                        value={rowData.id}
                        onChange={() => handleTestCasesSelection(rowData.id)}
                    />
                ),
            },
            { width: 60, label: "TCID", dataKey: "tcid" },
            { width: 200, label: "Suite Name", dataKey: "suite_name" },
            { width: 90, label: "OS", dataKey: "applicable_os" },
            { width: 80, label: "Stream", dataKey: "stream" },
            { width: 80, label: "Category", dataKey: "category" },
            {
                width: 80,
                label: "Actions",
                dataKey: "action",
                render: (value, rowData) => (
                    <div className="flex gap-2">
                        <IconButton variant="text" size="sm">
                            <DocumentIcon className="h-5 w-5" />
                        </IconButton>
                        <IconButton variant="text" size="sm">
                            <ArrowDownTrayIcon className="h-5 w-5" />
                        </IconButton>
                    </div>
                ),
            },
        ],
        []
    );

    useEffect(() => {
        if (!loading) {
            console.log("Sending dispatch");
            dispatch(fetchTestCases());
            console.log("Sending dispatch : ", loading);
        }
    }, []);

    const handleSearch = (e) => {
        const { name, value } = e.target;
        console.log(`Search Term is : ${value}`);
        setSearchTerm(value);
    };

    // const handleCheckboxChange = useCallback((id) => {
    //     console.log(
    //         `Selected ID : ${id} and selected testCases : ${selectedTestCases}`
    //     );
    //     setSelectedTestCases((prevSelected) => {
    //         if (prevSelected.includes(id)) {
    //             console.log("Removing ID : ", id);
    //             const newArray = prevSelected.filter(
    //                 (testCaseId) => testCaseId !== id
    //             );
    //             console.log(`New Array is after removing : ${newArray}`);
    //             return newArray;
    //         } else {
    //             const newArray = [...prevSelected, id];
    //             console.log(`New Array is : ${newArray}`);
    //             return newArray;
    //         }
    //     });
    // }, []);

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
        // Set combinedTestCases based on search or paginated data
        if (debouncedSearchTerm === "") {
            console.log(`Loading is : ${loading}`);
            setCombinedTestCases(testCases);
            // When no search, display paginated test cases
            // setCombinedTestCases((prevData) => {
            //     const uniqueTestCases = [
            //         ...new Map(
            //             testCases.map((item) => [item["id"], item])
            //         ).values(),
            //     ];
            //     return uniqueTestCases;
            // });
        } else {
            // If there's a search term, show the filtered test cases
            const filtered = testCases.filter((record) => {
                return (
                    record.title
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    record.suite_name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    record.stream
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    record.category
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
                );
            });
            // setCombinedTestCases((prevData) => {
            //     const uniqueTestCases = [
            //         ...new Map(
            //             filtered.map((item) => [item["id"], item])
            //         ).values(),
            //     ];
            //     return uniqueTestCases;
            // });
            setCombinedTestCases(filtered);
        }
    }, [debouncedSearchTerm, testCases]); // Rerun if searchTerm or testCases change

    // if (loading) {
    //     return (
    //         <div className="bg-gray-200 flex justify-center py-6 h-52">
    //             <div className="h-36 w-36 flex items-center justify-center">
    //                 <div className="container flex justify-center items-center">
    //                     <div className="water h-20 w-20 bg-[#35b3e7] rounded-full relative overflow-hidden"></div>
    //                 </div>
    //             </div>
    //         </div>
    //     ); // Show loading only when fetching the first page
    // }

    // if (error) {
    //     return <div>Error: {error}</div>;
    // }

    return (
        <div>
            {loading ? (
                // <div className="bg-gray-200 flex justify-center py-6 h-52">
                //     <div className="h-36 w-36 flex items-center justify-center">
                //         <div className="container flex justify-center items-center">
                //             <div className="water h-20 w-20 bg-[#35b3e7] rounded-full relative overflow-hidden"></div>
                //         </div>
                //     </div>
                // </div>
                <div className="bg-gray-200 flex justify-center py-6 h-52">
                    <DefaultSkeleton />
                </div>
            ) : (
                <>
                    <Card className="h-full w-full overflow-scroll">
                        <CardHeader
                            floated={false}
                            shadow={false}
                            className="mb-2 rounded-none p-2"
                        >
                            <div className="w-full md:w-96">
                                <Input
                                    label="Search TestCase"
                                    icon={
                                        <MagnifyingGlassIcon className="h-5 w-5" />
                                    }
                                    onChange={handleSearch}
                                />
                            </div>
                            {/* Debug: Show total number of records */}
                            <div>
                                Total Records Loaded: {combinedTestCases.length}
                            </div>
                        </CardHeader>
                        <br />

                        <div
                            id="testCasesTable"
                            ref={tableRef} // Attach ref to the table wrapper
                            style={{
                                width: "100%",
                                height: "100vh",
                                fontFamily: "'Poppins', sans-serif", // Apply font here
                            }}
                            className="p-4 shadow-lg"
                        >
                            <ReactVirtualizedMultiGrid
                                rowKey="id"
                                rows={combinedTestCases}
                                columns={columns}
                                value={value}
                                // onRowClick={onRowClick}
                                onRowClick={(e) => onRowClick(e)}
                                className="font-poppins"
                                rowHeight={30}
                                // rowCount={testCases?.length || 0}
                                style={STYLE}
                                // scrollTop={scrollPositionRef.current} // Maintain scroll position
                                // onScroll={({ scrollTop }) =>
                                //     (scrollPositionRef.current = scrollTop)
                                // } // Save scroll position
                            />
                        </div>
                    </Card>
                    <TestCasesCart />
                </>
            )}
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

// // Scroll event listener to trigger loading more data
// const handleScroll = (e) => {
//     const { scrollTop, scrollHeight, clientHeight } = e.target;
//     // if (scrollHeight - scrollTop === clientHeight && !loading && hasMore) {
//     if (
//         scrollHeight - scrollTop <= clientHeight + 50 &&
//         !loading &&
//         hasMore
//     ) {
//         setPage((prevPage) => prevPage + 1); // Load the next page
//     }
//     // setScrollPos(scrollTop); // Save the scroll position
//     // scrollPositionRef.current = scrollTop; // Track scroll position
// };
