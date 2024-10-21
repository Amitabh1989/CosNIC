"use clilent";
import React, { useEffect, useState } from "react";
import {
    MagnifyingGlassIcon,
    ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { WiCloudRefresh } from "react-icons/wi";
import { IoRefresh } from "react-icons/io5";

import { PencilIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { MdModeEditOutline } from "react-icons/md";
import { IoEyeOutline } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import moment from "moment";
import VenvCRUDForm from "@/components/env/VenvCRUDForm";
import {
    Card,
    CardHeader,
    Input,
    Typography,
    Button,
    CardBody,
    Chip,
    CardFooter,
    Tabs,
    TabsHeader,
    Tab,
    Avatar,
    Radio,
    IconButton,
    Tooltip,
} from "@material-tailwind/react";
import { useSelector, useDispatch } from "react-redux";
import { setVenvs } from "@/reduxToolkit/venvSlice";
import { setStepperSelectedVenv } from "@/reduxToolkit/stepperSlice";

export const SortableTable = ({
    columns,
    data,
    count,
    nextLink,
    prevLink,
    onNext,
    onPrevious,
    refreshData,
}) => {
    // Combine columns with Actions
    columns = ["Pick", ...columns, "Actions"];
    console.log("Columns:", columns);
    const dispatch = useDispatch();

    // Local state for current page, dialog, and selected venv
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedVenvId, setSelectedVenvId] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(true);
    const [venvData, setVenvData] = useState(data);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc",
    });

    const venvsStore = useSelector((state) => state.venv);
    const stepper = useSelector((state) => state.stepper);

    // Function to handle sorting by column
    const sortData = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }

        const sortedData = [...venvData].sort((a, b) => {
            const valA = a[key] ? a[key].toString().toLowerCase() : "";
            const valB = b[key] ? b[key].toString().toLowerCase() : "";

            if (valA < valB) return direction === "asc" ? -1 : 1;
            if (valA > valB) return direction === "asc" ? 1 : -1;
            return 0;
        });

        setSortConfig({ key, direction });
        setVenvData(sortedData);
        console.log(`Sorted data is : ${sortedData}`);
    };

    // Update totalPages when count or data changes
    useEffect(() => {
        const calculatedTotalPages = Math.ceil(count / 10); // Assuming 10 items per page
        setTotalPages(calculatedTotalPages);
    }, [count]);

    // CRUD Dialog Handlers
    const handleCRUDClick = async (venvId) => {
        await dispatch(setStepperSelectedVenv(venvId));
        console.log(
            "Selected Venv ID:",
            venvId,
            "  stepper step :",
            stepper.currentVenv
        );
        setSelectedVenvId(stepper.currentVenv);
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
    };

    const handleNext = async () => {
        if (nextLink && currentPage < totalPages) {
            await onNext();
            setCurrentPage((prevPage) => prevPage + 1); // Correct state update
        } else {
            console.log("No more next pages available.");
        }
    };

    const handlePrevious = async () => {
        if (prevLink && currentPage > 1) {
            await onPrevious();
            setCurrentPage((prevPage) => prevPage - 1); // Correct state update
        } else {
            console.log("No more previous pages available.");
        }
    };

    // Sync venvData with data prop
    useEffect(() => {
        if (data && data.length) {
            setVenvData(data);
        }
    }, [data]);

    // useEffect to log the updated current page
    useEffect(() => {
        console.log("Updated currentPage:", currentPage);
        console.log("Next Link in useEffect :", nextLink);
        console.log("Previous Link in useEffect :", prevLink);
        console.log("Data is :", data);
        // setVenvData(data);
    }, [nextLink, prevLink, currentPage]);

    return (
        <div className="w-full p-4 m-4">
            <Card className="h-full w-full overflow-y-auto">
                <CardHeader
                    floated={false}
                    shadow={false}
                    className="rounded-none"
                >
                    <div className="flex items-center justify-between gap-8">
                        <div>
                            <Typography variant="h5" color="blue-gray">
                                My Virtual Environment list
                            </Typography>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                            <Button variant="outlined" size="sm">
                                view all
                            </Button>
                            <Button
                                className="flex items-center gap-3"
                                size="sm"
                                onClick={refreshData}
                            >
                                <IoRefresh
                                    strokeWidth={2}
                                    className="h-5 w-5"
                                />{" "}
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="overflow-scroll px-0">
                    <table className="mt-2 w-full min-w-max table-auto text-left">
                        <thead>
                            <tr>
                                {columns.map((head, index) => (
                                    <th
                                        key={head}
                                        className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50"
                                        onClick={() => {
                                            if (
                                                head !== "Pick" &&
                                                head !== "Actions"
                                            ) {
                                                const key = head
                                                    .toLowerCase()
                                                    .replace(/ /g, "_");
                                                sortData(key);
                                            }
                                        }}
                                    >
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="flex items-center justify-between gap-2 font-normal leading-none opacity-70 font-bold"
                                        >
                                            {head}{" "}
                                            {index !== columns.length - 1 && (
                                                <ChevronUpDownIcon
                                                    strokeWidth={2}
                                                    className="h-4 w-4"
                                                />
                                            )}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {venvData.map((item, index) => {
                                const isEven = index % 2 === 0;
                                const classes = `${isEven ? "bg-white" : "bg-gray-100"}`;

                                return (
                                    <tr key={item.id}>
                                        <td
                                            className={`pl-8 pr-4 items-center ${classes}`}
                                        >
                                            <Radio
                                                name="vertical-list"
                                                id={item.id}
                                                ripple={true}
                                                color="blue"
                                                checked={
                                                    item.id ===
                                                    stepper.currentVenv
                                                }
                                                onChange={() =>
                                                    dispatch(
                                                        setStepperSelectedVenv(
                                                            item.id
                                                        )
                                                    )
                                                }
                                                className="hover:before:opacity-0"
                                                containerProps={{
                                                    className: "p-0",
                                                }}
                                            />
                                        </td>
                                        <td className={classes}>
                                            <div className="flex items-center gap-1">
                                                <div className="flex flex-col ml-4">
                                                    <Typography
                                                        variant="small"
                                                        color="blue-gray"
                                                        className="font-normal"
                                                    >
                                                        {item.name} @ Py_
                                                        {item.python_version}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={classes}>
                                            <div className="flex flex-col ml-4">
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-bold"
                                                >
                                                    {item.nickname}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className={classes}>
                                            <div className="flex flex-col ml-4">
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-normal"
                                                >
                                                    {item.ctrl_package_version}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className={classes}>
                                            <div className="flex flex-col">
                                                <Chip
                                                    size="sm"
                                                    variant="ghost"
                                                    value={item.status}
                                                    color={
                                                        item.status === "free"
                                                            ? "green"
                                                            : item.status ===
                                                                "created"
                                                              ? "gray"
                                                              : item.status ===
                                                                  "running"
                                                                ? "amber"
                                                                : "red"
                                                    }
                                                />
                                            </div>
                                        </td>
                                        <td className={classes}>
                                            <div className="flex flex-col ml-4">
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-normal"
                                                >
                                                    {item.config_file
                                                        ? item.config_file
                                                        : "NA"}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className={classes}>
                                            <div className="flex flex-col ml-4">
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-normal"
                                                >
                                                    {moment(
                                                        item.modified_at
                                                    ).format(
                                                        "MMM DD/YY, hh:MM A"
                                                    )}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className={classes}>
                                            <div className="flex flex-col ml-4">
                                                <div>
                                                    <Tooltip content="Edit Venv">
                                                        <IconButton variant="text">
                                                            <MdModeEditOutline
                                                                className="h-5 w-5"
                                                                value={item.id}
                                                                onClick={() =>
                                                                    handleCRUDClick(
                                                                        item.id
                                                                    )
                                                                }
                                                            />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip content="View details">
                                                        <IconButton variant="text">
                                                            <IoEyeOutline
                                                                className="h-5 w-5"
                                                                value={item.id}
                                                            />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip content="Delete Venv">
                                                        <IconButton variant="text">
                                                            <MdDeleteForever
                                                                className="h-5 w-5"
                                                                value={item.id}
                                                            />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardBody>
                <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                    <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                    >
                        Page {currentPage} of {totalPages}
                    </Typography>
                    <div className="flex gap-2">
                        <Button
                            variant="outlined"
                            size="sm"
                            disabled={currentPage === 1 || !prevLink}
                            onClick={handlePrevious}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outlined"
                            size="sm"
                            disabled={currentPage >= totalPages || !nextLink}
                            onClick={handleNext}
                        >
                            Next
                        </Button>
                    </div>
                </CardFooter>
            </Card>
            {selectedVenvId && (
                <VenvCRUDForm
                    venvID={selectedVenvId}
                    onClose={handleClose}
                    dialogOpen={dialogOpen}
                />
            )}
        </div>
    );
};

export const CustomTable = ({ columns, data }) => {
    return (
        <table className="min-w-full bg-white border-collapse">
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={column} className="py-2 px-4 border-b">
                            {column}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                        {Object.values(row).map((cell, i) => (
                            <td key={i} className="py-2 px-4 border-b">
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default CustomTable;

const handleNext = async () => {
    if (currentPage < totalPages) {
        const pageKey = currentPage + 1;

        // Check if next page data exists in Redux
        const cachedPage = venvsStore.pages[pageKey];
        if (cachedPage) {
            setRowData(cachedPage); // Serve cached data
            setCurrentPage(pageKey); // Update page
        } else {
            // Fetch next page data
            const data = await onNext(nextLink, "next");
            console.log("Next pages data is : ", data, totalPages);
            // dispatch(
            //     setVenvs({
            //         newVenvs: data.results,
            //         next: data.next,
            //         previous: data.previous,
            //         count: data.count,
            //         pageKey: pageKey, // Store data with page key
            //     })
            // );
            setCurrentPage(pageKey); // Update page
        }
    } else {
        console.log("No more next pages available.");
    }
};

const handlePrevious = async () => {
    if (currentPage > 1) {
        const pageKey = currentPage - 1;

        // Check if previous page data exists in Redux
        const cachedPage = venvsStore.pages[pageKey];
        if (cachedPage) {
            setRowData(cachedPage); // Serve cached data
            setCurrentPage(pageKey); // Update page
        } else {
            // Fetch previous page data
            const data = await onPrevious(prevLink, "prev");
            dispatch(
                setVenvs({
                    newVenvs: data.results,
                    next: data.next,
                    previous: data.previous,
                    count: data.count,
                    pageKey: pageKey, // Store data with page key
                })
            );
            setCurrentPage(pageKey); // Update page
        }
    } else {
        console.log("No more previous pages available.");
    }
};

// export const SortableTable = ({
//     columns,
//     data,
//     count,
//     nextLink,
//     prevLink,
//     onNext,
//     onPrevious,
//     refreshData,
// }) => {
//     const modifiedColumns = ["Pick", ...columns, "Actions"];
//     const dispatch = useDispatch();

//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(0);
//     const [selectedVenvId, setSelectedVenvId] = useState(null);
//     const [dialogOpen, setDialogOpen] = useState(false);
//     const [venvData, setVenvData] = useState(data);
//     const [sortConfig, setSortConfig] = useState({
//         key: null,
//         direction: "asc",
//     });

//     const sortData = (key) => {
//         let direction = "asc";
//         if (sortConfig.key === key && sortConfig.direction === "asc") {
//             direction = "desc";
//         }

//         const sortedData = [...venvData].sort((a, b) => {
//             const valA = a[key] ? a[key].toString().toLowerCase() : "";
//             const valB = b[key] ? b[key].toString().toLowerCase() : "";

//             if (valA < valB) return direction === "asc" ? -1 : 1;
//             if (valA > valB) return direction === "asc" ? 1 : -1;
//             return 0;
//         });

//         setSortConfig({ key, direction });
//         setVenvData(sortedData);
//     };

//     useEffect(() => {
//         const calculatedTotalPages = Math.ceil(count / 10);
//         setTotalPages(calculatedTotalPages);
//     }, [count]);

//     const handleNext = async () => {
//         if (nextLink && currentPage < totalPages) {
//             await onNext();
//             setCurrentPage((prevPage) => prevPage + 1);
//         }
//     };

//     const handlePrevious = async () => {
//         if (prevLink && currentPage > 1) {
//             await onPrevious();
//             setCurrentPage((prevPage) => prevPage - 1);
//         }
//     };

//     const handleCRUDClick = (venvId) => {
//         setSelectedVenvId(venvId);
//         setDialogOpen(true);
//     };

//     const handleClose = () => {
//         setDialogOpen(false);
//     };

//     return (
//         <div className="w-full p-4 m-4">
//             <Card className="h-full w-full overflow-y-auto">
//                 <CardHeader
//                     floated={false}
//                     shadow={false}
//                     className="rounded-none"
//                 >
//                     <div className="flex items-center justify-between gap-8">
//                         <Typography variant="h5" color="blue-gray">
//                             My Virtual Environment List
//                         </Typography>
//                         <div className="flex flex-row gap-2">
//                             <Button variant="outlined" size="sm">
//                                 View All
//                             </Button>
//                             <Button
//                                 className="flex items-center gap-3"
//                                 size="sm"
//                                 onClick={refreshData}
//                             >
//                                 <IoRefresh
//                                     strokeWidth={2}
//                                     className="h-5 w-5"
//                                 />{" "}
//                                 Refresh
//                             </Button>
//                         </div>
//                     </div>
//                 </CardHeader>

//                 <CardBody className="overflow-scroll px-0">
//                     <table className="w-full min-w-max table-auto text-left">
//                         <thead>
//                             <tr>
//                                 {modifiedColumns.map((head, index) => (
//                                     <th
//                                         key={head}
//                                         className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50 p-4 transition-colors hover:bg-blue-gray-100"
//                                         onClick={() => {
//                                             if (
//                                                 head !== "Pick" &&
//                                                 head !== "Actions"
//                                             ) {
//                                                 const key = head
//                                                     .toLowerCase()
//                                                     .replace(/ /g, "_");
//                                                 sortData(key);
//                                             }
//                                         }}
//                                     >
//                                         <Typography
//                                             variant="small"
//                                             color="blue-gray"
//                                             className="flex items-center justify-between gap-2 font-normal leading-none"
//                                         >
//                                             {head}{" "}
//                                             {index !==
//                                                 modifiedColumns.length - 1 &&
//                                                 head !== "Pick" && (
//                                                     <ChevronUpDownIcon
//                                                         strokeWidth={2}
//                                                         className="h-4 w-4"
//                                                     />
//                                                 )}
//                                         </Typography>
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>

//                         <tbody>
//                             {venvData.map((item, index) => {
//                                 const isEven = index % 2 === 0;
//                                 const rowClasses = `${isEven ? "bg-white" : "bg-gray-100"}`;

//                                 return (
//                                     <tr key={item.id}>
//                                         <td
//                                             className={`pl-12 pr-4 ${rowClasses}`}
//                                         >
//                                             <Radio
//                                                 name="vertical-list"
//                                                 id={item.id}
//                                                 ripple={true}
//                                                 color="blue"
//                                                 containerProps={{
//                                                     className: "p-0",
//                                                 }}
//                                             />
//                                         </td>

//                                         <td className={rowClasses}>
//                                             {item.name} @ Py_
//                                             {item.python_version}
//                                         </td>
//                                         <td className={rowClasses}>
//                                             {item.name}
//                                         </td>
//                                         <td className={rowClasses}>
//                                             {item.ctrl_package_version || "NA"}
//                                         </td>
//                                         <td className={rowClasses}>
//                                             <Chip
//                                                 size="sm"
//                                                 variant="ghost"
//                                                 value={item.status}
//                                                 color={
//                                                     item.status === "free"
//                                                         ? "green"
//                                                         : item.status ===
//                                                             "running"
//                                                           ? "amber"
//                                                           : "red"
//                                                 }
//                                             />
//                                         </td>
//                                         <td className={rowClasses}>
//                                             {item.nickname}
//                                         </td>
//                                         <td className={rowClasses}>
//                                             {moment(item.modified_at).format(
//                                                 "MMM DD/YY, hh:MM A"
//                                             )}
//                                         </td>

//                                         <td className={rowClasses}>
//                                             <div className="flex space-x-2">
//                                                 <Tooltip content="Edit Venv">
//                                                     <IconButton variant="text">
//                                                         <MdModeEditOutline
//                                                             className="h-5 w-5"
//                                                             onClick={() =>
//                                                                 handleCRUDClick(
//                                                                     item.id
//                                                                 )
//                                                             }
//                                                         />
//                                                     </IconButton>
//                                                 </Tooltip>
//                                                 <Tooltip content="Delete Venv">
//                                                     <IconButton variant="text">
//                                                         <MdDeleteForever className="h-5 w-5" />
//                                                     </IconButton>
//                                                 </Tooltip>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 );
//                             })}
//                         </tbody>
//                     </table>
//                 </CardBody>

//                 <CardFooter className="flex items-center justify-between p-4">
//                     <Typography variant="small" color="blue-gray">
//                         Page {currentPage} of {totalPages}
//                     </Typography>
//                     <div className="flex gap-2">
//                         <Button
//                             variant="outlined"
//                             size="sm"
//                             disabled={currentPage === 1 || !prevLink}
//                             onClick={handlePrevious}
//                         >
//                             Previous
//                         </Button>
//                         <Button
//                             variant="outlined"
//                             size="sm"
//                             disabled={currentPage >= totalPages || !nextLink}
//                             onClick={handleNext}
//                         >
//                             Next
//                         </Button>
//                     </div>
//                 </CardFooter>
//             </Card>

//             {selectedVenvId && (
//                 <VenvCRUDForm
//                     venvID={selectedVenvId}
//                     onClose={handleClose}
//                     dialogOpen={dialogOpen}
//                 />
//             )}
//         </div>
//     );
// };
