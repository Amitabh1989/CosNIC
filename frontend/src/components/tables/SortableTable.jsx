"use clilent";
import React, { useEffect, useState } from "react";
import {
    MagnifyingGlassIcon,
    ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon } from "@heroicons/react/24/solid";
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

const TABS = [
    {
        label: "All",
        value: "all",
    },
    {
        label: "Monitored",
        value: "monitored",
    },
    {
        label: "Unmonitored",
        value: "unmonitored",
    },
];

export const SortableTable = ({
    columns,
    data,
    count,
    next,
    previous,
    onNext,
    onPrevious,
}) => {
    console.log("columns", columns);
    console.log("data", data);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        // Calculate total pages based on total items and items per page
        // const calculatedTotalPages = Math.ceil(count / data.length);
        const calculatedTotalPages = Math.ceil(count / 10);
        setTotalPages(calculatedTotalPages);
    }, [data.length]);

    const handleNext = async (e) => {
        // e.preventDefault();
        if (next) {
            console.log("Next link is table:", next);
            await onNext(next);
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePrevious = async (e) => {
        // e.preventDefault();
        if (previous) {
            console.log("Previous link is table :", previous);
            await onPrevious(previous);
            setCurrentPage((prev) => prev - 1);
        }
    };

    return (
        <Card className="h-full w-full">
            <CardHeader floated={false} shadow={false} className="rounded-none">
                <div className="mb-8 flex items-center justify-between gap-8">
                    <div>
                        <Typography variant="h5" color="blue-gray">
                            Members list
                        </Typography>
                        <Typography color="gray" className="mt-1 font-normal">
                            See information about all members
                        </Typography>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                        <Button variant="outlined" size="sm">
                            view all
                        </Button>
                        <Button className="flex items-center gap-3" size="sm">
                            <UserPlusIcon strokeWidth={2} className="h-4 w-4" />{" "}
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
                        {data.map(
                            (
                                {
                                    name,
                                    nickname,
                                    ctrl_pkg_version,
                                    status,
                                    user,
                                    num_tests,
                                },
                                index
                            ) => {
                                const isLast = index === data.length - 1;
                                const classes = isLast
                                    ? "p-1"
                                    : "p-1 border-b border-blue-gray-50";

                                return (
                                    <tr key={name}>
                                        <td className={classes}>
                                            <div className="flex items-center gap-1">
                                                <div className="flex flex-col ml-4">
                                                    <Typography
                                                        variant="small"
                                                        color="blue-gray"
                                                        className="font-normal"
                                                    >
                                                        {name}
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
                                                    {nickname}
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
                                                    {ctrl_pkg_version}
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
                                                    value={status}
                                                    color={
                                                        status === "free"
                                                            ? "green"
                                                            : status ===
                                                                "created"
                                                              ? "gray"
                                                              : status ===
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
                                                    {user}
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
                                                    {num_tests}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className={classes}>
                                            <Tooltip content="Edit User">
                                                <IconButton variant="text">
                                                    <PencilIcon className="h-4 w-4" />
                                                </IconButton>
                                            </Tooltip>
                                        </td>
                                    </tr>
                                );
                            }
                        )}
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
                        disabled={!previous}
                        onClick={handlePrevious}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outlined"
                        size="sm"
                        disabled={!next}
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                </div>
            </CardFooter>
        </Card>
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
