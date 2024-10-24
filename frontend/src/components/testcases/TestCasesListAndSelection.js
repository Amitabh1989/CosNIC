"use client";
import { DocumentIcon } from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
    Card,
    Input,
    Checkbox,
    CardBody,
    Tooltip,
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
import { LuListTodo } from "react-icons/lu";
import { FcTodoList } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { fetchTestCases, resetTestCases } from "@/reduxToolkit/testCasesSlice";
import { createSelector } from "reselect";
import { DefaultSkeleton } from "../common/Skeleton";
// import { TestCasesContext } from "../contexts/TestCasesContext";
import { TestCasesContext } from "../../contexts/TestCasesContext";
import SubTestSelectionComp from "./SubTestSelectionComp";
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
    const [openSubtestModal, setOpenSubtestModal] = React.useState(false);
    const [selectedTCID, setSelectedTCID] = React.useState("");

    // const handleOpen = () => setOpenSubtestModal(!open);

    // Effect to sync internalSelectionList with testCasesCart
    useEffect(() => {
        // Update internalSelectionList when testCasesCart changes
        const selectedIds = testCasesCart.map((testCase) => testCase.id);
        setInternalSelectionList(selectedIds);
    }, [testCasesCart]); // Sync whenever testCasesCart changes

    // useEffect(() => {
    //     // When the modal is opened, ensure we are getting the latest test case from the Redux store
    //     const matchingTestCase = testCasesCart.find(
    //         (testCase) => testCase.id === rowClickedID
    //     );
    //     if (matchingTestCase) {
    //         setTestCaseRecord(matchingTestCase); // Update state with the latest from Redux
    //         setSubtests(matchingTestCase.subtests); // Update subtests with the latest selection
    //     }
    // }, [testCasesCart, testCaseRecord.id]); // Depend on Redux state and testCaseRecord.id

    const handleSubtestWizard = (event, rowData) => {
        console.log("Event clicked is ", event);
        event.stopPropagation(); // Prevent row click event from firing
        console.log("Subtest openSubtestModal : ", openSubtestModal);
        console.log("Subtest Wizard Clicked", rowData);
        setSelectedTCID(rowData.id);
        setOpenSubtestModal((prevState) => {
            console.log("Subtest openSubtestModal prevState : ", prevState);
            return !prevState;
        });

        // if (rowData) {
        //     console.log("Subtest Wizard Clicked 2", rowData);
        //     const newData = testCasesCart.map((testCase) => {
        //         if (testCase.id === rowData.id) {
        //             return {
        //                 ...testCase, // Spread current test case data
        //                 ...rowData, // Override with new rowData (or add additional data)
        //             };
        //         }
        //         return testCase;
        //     });
        //     console.log("New data clicked is : ", newData);
        //     setSelectedTCID(rowClickedID);
        //     console.log("Event clicked row number is ", rowClickedID);
        //     console.log("Selected TC ID is : ", selectedTCID);

        //     // setRowClickedID(newData[0]);
        // }
    };

    const handleModalOpen = () => {
        console.log("Modal open state is 1: ", openSubtestModal);
        setOpenSubtestModal((prevState) => !prevState);
        console.log("Modal open state is 2: ", openSubtestModal);
    };

    useEffect(() => {
        if (!loading) {
            console.log("Sending dispatch");
            dispatch(fetchTestCases());
            console.log("Sending dispatch : ", loading);
        }
    }, []);

    const handleRowClick = (rowData) => {
        console.log(`Row Clicked 1: ${rowData}`);
        setRowClickedID(rowData);
        // console.log(`Row Clicked 2: ${JSON.stringify(rowData)}`);
        const rowObj = testCases.find((row) => row.id === rowData);
        if (internalSelectionList.find((id) => id === rowData)) {
            setInternalSelectionList(
                internalSelectionList.filter((id) => id !== rowData)
            );
            dispatch(removeFromTestCaseCart(rowObj));
        } else {
            setInternalSelectionList([...internalSelectionList, rowData]);
            const newData = testCasesCart.find(
                (testCase) => testCase.id === rowData
            );
            // setRowClickedID(rowData);
            dispatch(addToTestCasesCart(rowObj));
            console.log(`Row Clicked : ${rowClickedID}`);
        }
        console.log(`Inteeranl Selection List: ${internalSelectionList}`);
    };

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
                render: (value, rowData) => {
                    const isChecked = internalSelectionList.includes(
                        rowData.id
                    ); // Check if rowData.id is in internalSelectionList
                    return (
                        <Checkbox
                            label={rowData.id}
                            value={rowData.id}
                            checked={isChecked}
                            onChange={() => handleTestCasesSelection(rowData)}
                        />
                    );
                },
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
                        <Tooltip content="Select Subtests">
                            <IconButton variant="text" size="sm">
                                <FcTodoList
                                    className="h-6 w-6"
                                    onClick={(event) =>
                                        handleSubtestWizard(event, rowData)
                                    }
                                />
                            </IconButton>
                        </Tooltip>
                        <IconButton variant="text" size="sm">
                            <ArrowDownTrayIcon className="h-5 w-5" />
                        </IconButton>
                    </div>
                ),
            },
        ],
        [testCasesCart, internalSelectionList]
    );

    // const handleCheckboxChange = ({ rowData }) => {
    //     console.log(`Check box clicked for row: ${rowData.id}`);
    //     testCasesCart.some((testCase) => testCase.id === rowData.id) ||
    //     internalSelectionList.includes(rowData.id)
    //         ? true
    //         : false;
    // };

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
                                            height: "60vh",
                                            fontSize: "16px",
                                            fontFamily: "'Poppins', sans-serif", // Apply font here
                                        }}
                                        className="p-4 shadow-lg"
                                    >
                                        <ReactVirtualizedMultiGrid
                                            rowKey="id"
                                            rows={combinedTestCases}
                                            columns={columns}
                                            value={rowClickedID}
                                            onRowClick={(e) =>
                                                handleRowClick(e)
                                            }
                                            className="font-poppins"
                                            rowHeight={35}
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
            {openSubtestModal && (
                <SubTestSelectionComp
                    setOpen={handleModalOpen}
                    tcRecord={selectedTCID}
                />
            )}
        </div>
    );
});

export default TestCasesListAndSelection;
