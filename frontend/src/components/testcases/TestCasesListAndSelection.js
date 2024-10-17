"use client";
import { DocumentIcon } from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
    Card,
    Input,
    Checkbox,
    CardBody,
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
import {
    addToTestCasesCart,
    removeFromTestCaseCart,
    // resetTestCasesCart,
} from "@/reduxToolkit/selectedTestCaseCartSlice";

import ReactVirtualizedMultiGrid from "react-virtualized-multi-grid";
import { set } from "lodash";
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
    const { selectedTestCases, handleTestCasesSelection } =
        useContext(TestCasesContext);
    const testCasesCart = useSelector(
        (state) => state.testCasesCart.selectedTestCases
    );
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Debounced search term
    const [searchTerm, setSearchTerm] = useState(""); // For handling the search term
    const [rowClickedID, setRowClickedID] = React.useState("");
    const [combinedTestCases, setCombinedTestCases] = useState([]); // Final state to render
    const tableRef = useRef(null); // Create a ref for the table
    const [internalSelectionList, setInternalSelectionList] = useState([]);

    // Columns for the table
    const columns = useMemo(
        () => [
            {
                width: 60,
                label: "#",
                dataKey: "index",
                sort: false,
                render: (value, rowData, rowIndex) => rowIndex + 1,
            },
            {
                width: 80,
                label: "Select",
                dataKey: "id",
                sort: true,
                render: (value, rowData) => (
                    <Checkbox
                        label={rowData.id}
                        value={rowData.id}
                        checked={
                            testCasesCart.some(
                                (testCase) => testCase.id === rowData.id
                            ) || internalSelectionList.includes(rowData.id)
                                ? true
                                : false
                        }
                        onChange={() => handleTestCasesSelection(rowData)}
                    />
                ),
            },
            { width: 60, label: "TCID", dataKey: "tcid", sort: true },
            {
                width: 200,
                label: "Suite Name",
                dataKey: "suite_name",
                sort: true,
            },
            { width: 90, label: "OS", dataKey: "applicable_os", sort: true },
            { width: 80, label: "Stream", dataKey: "stream", sort: true },
            { width: 80, label: "Category", dataKey: "category", sort: true },
            {
                width: 80,
                label: "Actions",
                dataKey: "action",
                sort: false,
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
        [testCasesCart, internalSelectionList]
    );

    // useEffect(() => {
    //     // Trigger re-render or refetch logic for virtualized table based on updated cart
    // }, [rowClickedID]); // Re-run whenever the cart changes

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

            setCombinedTestCases(filtered);
        }
    }, [debouncedSearchTerm, testCases]); // Rerun if searchTerm or testCases change

    const handleRowClick = (rowData) => {
        console.log(`Row Clicked 1: ${rowData}`);
        // console.log(`Row Clicked 2: ${JSON.stringify(rowData)}`);
        const rowObj = testCases.find((row) => row.id === rowData);
        if (internalSelectionList.find((id) => id === rowData)) {
            setInternalSelectionList(
                internalSelectionList.filter((id) => id !== rowData)
            );
            setRowClickedID(null);
            dispatch(removeFromTestCaseCart(rowObj));
        } else {
            setInternalSelectionList([...internalSelectionList, rowData]);
            // setInternalSelectionList.push(rowData);
            setRowClickedID(rowData);
            dispatch(addToTestCasesCart(rowObj));
        }
        console.log(`Inteeranl Selection List: ${internalSelectionList}`);
    };

    return (
        <div>
            {loading ? (
                <div className="bg-gray-200 flex justify-center py-6 h-52">
                    <DefaultSkeleton />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-6 gap-4 w-full p-4">
                        <div className="col-span-4 w-full">
                            <Card className="h-full w-full">
                                <CardHeader
                                    floated={false}
                                    shadow={false}
                                    className="-mb-10 rounded-none p-2"
                                >
                                    <div className="w-full md:w-96 p-4">
                                        <Input
                                            label="Search TestCase"
                                            icon={
                                                <MagnifyingGlassIcon className="h-5 w-5" />
                                            }
                                            onChange={handleSearch}
                                        />
                                    </div>
                                    {/* Debug: Show total number of records */}
                                    <div className="font-poppins text-sm font-bold -mt-3 pl-4">
                                        Total Records Loaded:{" "}
                                        {combinedTestCases.length}
                                    </div>
                                </CardHeader>
                                <br />
                                <CardBody>
                                    <div
                                        id="testCasesTable"
                                        ref={tableRef} // Attach ref to the table wrapper
                                        style={{
                                            width: "100%",
                                            height: "70vh",
                                            fontFamily: "'Poppins', sans-serif", // Apply font here
                                        }}
                                        className="p-4 shadow-lg"
                                    >
                                        <ReactVirtualizedMultiGrid
                                            rowKey="id"
                                            rows={combinedTestCases}
                                            columns={columns}
                                            value={rowClickedID}
                                            // onRowClick={setRowClickedID}
                                            onRowClick={(e) =>
                                                handleRowClick(e)
                                            }
                                            className="font-poppins"
                                            rowHeight={30}
                                            style={STYLE}
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                        <div className="col-span-2 w-full">
                            <TestCasesCart />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
});

export default TestCasesListAndSelection;
