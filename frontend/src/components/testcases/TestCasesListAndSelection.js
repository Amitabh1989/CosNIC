"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { getTestCasesApi, getTestCaseByIDApi } from "@/api/test_cases_apis";
import {
    saveTestCasesToIndexedDB,
    getTestCasesFromIndexedDB,
    getTestCaseByIDFromIndexedDB,
} from "@/services/indexedDBService";

const TABLE_HEAD = [
    "id",
    "tcid",
    "title",
    "suite_name",
    "applicable_os",
    "stream",
    "category",
];

const TestCasesListAndSelection = () => {
    const [testCasesData, setTestCasesData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [error, setError] = useState(null);
    const [reload, setReload] = useState(false);

    const fetchTestCaseData = useCallback(async () => {
        try {
            const response = await getTestCasesApi();
            console.log("Test cases response is:", response.data);
            setTestCasesData(response.data);
        } catch (error) {
            console.error("Error fetching test cases:", error);
            setError(error);
        }
    }, [testCasesData]);

    useEffect(() => {
        fetchTestCaseData();
        console.log("Test cases data is:", testCasesData);
    }, [reload]);

    return (
        // <div>It all right</div>
        <Card className="h-full w-full overflow-scroll">
            <CardHeader
                floated={false}
                shadow={false}
                className="mb-2 rounded-none p-2"
            >
                <div className="w-full md:w-96">
                    <Input
                        label="Search Invoice"
                        icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                    />
                </div>
            </CardHeader>
            <table className="w-full min-w-max table-auto text-left">
                <thead>
                    <tr>
                        {TABLE_HEAD.map(({ head, icon }) => (
                            <th
                                key={head}
                                className="border-b border-gray-300 p-4"
                            >
                                <div className="flex items-center gap-1">
                                    {icon}
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
                    {testCasesData?.map((record, index) => {
                        const isLast = index === testCasesData.length - 1;
                        const classes = isLast
                            ? "p-4"
                            : "p-4 border-b border-gray-300";

                        return (
                            <tr key={record.id}>
                                <td className={classes}>
                                    <div className="flex items-center gap-1">
                                        <Checkbox />
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-bold"
                                        >
                                            {record.id}
                                        </Typography>
                                    </div>
                                </td>
                                <td className={classes}>
                                    <Typography
                                        variant="small"
                                        className="font-normal text-gray-600"
                                    >
                                        {record.tcid}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography
                                        variant="small"
                                        className="font-normal text-gray-600"
                                    >
                                        {record.title}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography
                                        variant="small"
                                        className="font-normal text-gray-600"
                                    >
                                        {record.suite_name}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography
                                        variant="small"
                                        className="font-normal text-gray-600"
                                    >
                                        {record.applicable_os}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography
                                        variant="small"
                                        className="font-normal text-gray-600"
                                    >
                                        {record.stream}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography
                                        variant="small"
                                        className="font-normal text-gray-600"
                                    >
                                        {record.category}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <div className="flex items-center gap-2">
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
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Card>
    );
};

export default TestCasesListAndSelection;
