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

export const SortableTable = ({
    columns,
    data,
    count,
    nextLink,
    prevLink,
    onNext,
    onPrevious,
}) => {
    columns = [...columns, "Actions"];
    console.log("columns", columns);
    console.log("data", data);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedVenvId, setSelectedVenvId] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(true);

    const handleOpen = () => {
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
    };

    useEffect(() => {
        // Calculate total pages based on total items and items per page
        // const calculatedTotalPages = Math.ceil(count / data.length);
        const calculatedTotalPages = Math.ceil(count / 10);
        setTotalPages(calculatedTotalPages);
    }, [count]);

    const handleCRUDClick = (venvId) => {
        console.log("CRUD Clicked for Venv ID:", venvId);
        setSelectedVenvId(venvId);
        handleOpen();
    };

    const handleNext = async () => {
        if (nextLink && currentPage < totalPages) {
            await onNext(nextLink, "next");
            console.log("Next pages print 1: ", currentPage, totalPages);

            setCurrentPage((next) => next + 1);
            console.log("Next pages print 2: ", currentPage, totalPages);

            // setPrevLink(venvsStore.previous); // Ensure previous link is set
        } else {
            console.log("No more next pages available.");
        }
    };

    const handlePrevious = async () => {
        if (prevLink && currentPage > 1) {
            await onPrevious(prevLink, "prev");
            setCurrentPage((prev) => prev - 1);
            console.log("Previous pages print : ", currentPage, totalPages);
        } else {
            console.log("No more previous pages available.");
        }
    };

    useEffect(() => {
        console.log("Previous Link Updated:", prevLink);
        console.log("Next Link Updated:", nextLink);
    }, [prevLink]);

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
