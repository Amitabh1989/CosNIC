"use clilent";
import React, { useEffect, useState } from "react";
import {
    MagnifyingGlassIcon,
    ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { MdModeEditOutline } from "react-icons/md";
import { IoEyeOutline } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import moment from "moment";
import VenvCRUDForm from "@/app/user/dashboard/VenvCRUDForm";
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
    IconButton,
    Tooltip,
} from "@material-tailwind/react";
import { useSelector, useDispatch } from "react-redux";
import { setVenvs } from "@/reduxToolkit/slice";

// export const SortableTable = ({
//     columns,
//     data,
//     count,
//     nextLink,
//     prevLink,
//     onNext,
//     onPrevious,
// }) => {
//     columns = [...columns, "Actions"];
//     console.log("columns", columns);
//     console.log("data", data);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(0);
//     const [selectedVenvId, setSelectedVenvId] = useState(null);
//     const [prevLinkLocal, setPrevLink] = useState(prevLink);
//     const [nextLinkLocal, setNextLink] = useState(nextLink);

//     const [dialogOpen, setDialogOpen] = useState(true);

//     const handleOpen = () => {
//         setDialogOpen(true);
//     };

//     const handleClose = () => {
//         setDialogOpen(false);
//     };

//     useEffect(() => {
//         // Calculate total pages based on total items and items per page
//         // const calculatedTotalPages = Math.ceil(count / data.length);
//         const calculatedTotalPages = Math.ceil(count / 10);
//         setTotalPages(calculatedTotalPages);
//     }, [count]);

//     const handleCRUDClick = (venvId) => {
//         console.log("CRUD Clicked for Venv ID:", venvId);
//         setSelectedVenvId(venvId);
//         handleOpen();
//     };

//     const handleNext = async () => {
//         if (nextLink && currentPage < totalPages) {
//             await onNext(nextLink, "next");
//             console.log("Next pages print 1: ", currentPage, totalPages);

//             // setCurrentPage((next) => next + 1);
//             // Update current page correctly using a functional update
//             setCurrentPage((prevPage) => prevPage + 1);
//             console.log("Next pages print 2: ", currentPage, totalPages);
//             handlePrevious();

//             setPrevLink(venvsStore.prevLink); // Ensure previous link is set
//             setNextLink(venvsStore.nextLink); // Ensure next link is set
//         } else {
//             console.log("No more next pages available.");
//         }
//     };

//     const handlePrevious = async () => {
//         console.log(
//             "CurrentPage from previous comp : ",
//             currentPage,
//             totalPages
//         );
//         if (prevLink && currentPage > 1) {
//             await onPrevious(prevLink, "prev");
//             setCurrentPage((prev) => prev - 1);
//             console.log("Previous pages print : ", currentPage, totalPages);
//             setPrevLink(venvsStore.prevLink); // Ensure previous link is set
//             setNextLink(venvsStore.nextLink); // Ensure next link is set
//         } else {
//             console.log("No more previous pages available.");
//         }
//     };

//     useEffect(() => {
//         // console.log("Previous Link Updated:", prevLink);
//         // console.log("Next Link Updated:", nextLink);
//         // }, [prevLink]);
//         console.log("Updated currentPage:", currentPage);
//         handlePrevious();
//         handleNext();
//     }, [currentPage]);

export const SortableTable = ({
    columns,
    data,
    count,
    nextLink,
    prevLink,
    onNext,
    onPrevious,
}) => {
    // Combine columns with Actions
    columns = [...columns, "Actions"];
    console.log("Columns:", columns);
    // const dispatch = useDispatch();

    // Local state for current page, dialog, and selected venv
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedVenvId, setSelectedVenvId] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(true);

    const venvsStore = useSelector((state) => state.venv);

    // Update totalPages when count or data changes
    useEffect(() => {
        const calculatedTotalPages = Math.ceil(count / 10); // Assuming 10 items per page
        setTotalPages(calculatedTotalPages);
    }, [count]);

    // CRUD Dialog Handlers
    const handleCRUDClick = (venvId) => {
        setSelectedVenvId(venvId);
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

    // useEffect to log the updated current page
    useEffect(() => {
        console.log("Updated currentPage:", currentPage);
        console.log("Next Link in useEffect :", nextLink);
        console.log("Previous Link in useEffect :", prevLink);
        console.log("Data is :", data);
    }, [nextLink, prevLink, currentPage]);

    return (
        <div>
            <Card className="h-full w-full">
                <CardHeader
                    floated={false}
                    shadow={false}
                    className="rounded-none"
                >
                    <div className="mb-8 flex items-center justify-between gap-8">
                        <div>
                            <Typography variant="h5" color="blue-gray">
                                Members list
                            </Typography>
                            <Typography
                                color="gray"
                                className="mt-1 font-normal"
                            >
                                See information about all members
                            </Typography>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                            <Button variant="outlined" size="sm">
                                view all
                            </Button>
                            <Button
                                className="flex items-center gap-3"
                                size="sm"
                            >
                                <UserPlusIcon
                                    strokeWidth={2}
                                    className="h-4 w-4"
                                />{" "}
                                Add member
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="overflow-scroll px-0">
                    <table className="mt-4 w-full min-w-max table-auto text-left">
                        <thead>
                            <tr>
                                {columns.map((head, index) => (
                                    <th
                                        key={head}
                                        className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50"
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
                            {data.map((item, index) => {
                                const isLast = index === data.length - 1;
                                const classes = isLast
                                    ? "p-1"
                                    : "p-1 border-b border-blue-gray-50";

                                return (
                                    <tr key={item.id}>
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
                                                    className="font-normal"
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
                                                {/* <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-normal"
                                                >
                                                    {status}
                                                </Typography> */}
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

// export default CustomTable;

// const handleNext = async () => {
//     if (currentPage < totalPages) {
//         const pageKey = currentPage + 1;

//         // Check if next page data exists in Redux
//         const cachedPage = venvsStore.pages[pageKey];
//         if (cachedPage) {
//             setRowData(cachedPage); // Serve cached data
//             setCurrentPage(pageKey); // Update page
//         } else {
//             // Fetch next page data
//             const data = await onNext(nextLink, "next");
//             console.log("Next pages data is : ", data, totalPages);
//             // dispatch(
//             //     setVenvs({
//             //         newVenvs: data.results,
//             //         next: data.next,
//             //         previous: data.previous,
//             //         count: data.count,
//             //         pageKey: pageKey, // Store data with page key
//             //     })
//             // );
//             setCurrentPage(pageKey); // Update page
//         }
//     } else {
//         console.log("No more next pages available.");
//     }
// };

// const handlePrevious = async () => {
//     if (currentPage > 1) {
//         const pageKey = currentPage - 1;

//         // Check if previous page data exists in Redux
//         const cachedPage = venvsStore.pages[pageKey];
//         if (cachedPage) {
//             setRowData(cachedPage); // Serve cached data
//             setCurrentPage(pageKey); // Update page
//         } else {
//             // Fetch previous page data
//             const data = await onPrevious(prevLink, "prev");
//             dispatch(
//                 setVenvs({
//                     newVenvs: data.results,
//                     next: data.next,
//                     previous: data.previous,
//                     count: data.count,
//                     pageKey: pageKey, // Store data with page key
//                 })
//             );
//             setCurrentPage(pageKey); // Update page
//         }
//     } else {
//         console.log("No more previous pages available.");
//     }
// };
