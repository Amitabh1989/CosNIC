"use client";
import React, { useState, useEffect } from "react";
import { DocumentIcon } from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
    Radio,
    Card,
    Input,
    Tooltip,
    CardHeader,
    IconButton,
    Typography,
} from "@material-tailwind/react";
import { AiFillEdit } from "react-icons/ai";

import moment from "moment";
import YamlEditor from "../editor/YamlEditor";

import { getSutClientYmlConfigFilesListAPI } from "../../api/configFile_apis";

const TABLE_HEAD = ["ID", "Name", "Description", "Modified At", "Actions"];

const ConfigFileList = () => {
    const [configFiles, setConfigFiles] = useState([]); // List of YAML config files
    const [yamlContent, setYamlContent] = useState(""); // YAML content
    const [errorMessage, setErrorMessage] = useState(null); // To store YAML error message
    const [selected, setSelectedItem] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = React.useState(false); // Controls dialog visibility

    // Get the list and content of YAML config files : DONE
    // Display in table and editor : DONE

    // Fetch YAML config files
    const fetchConfigFiles = async () => {
        try {
            const response = await getSutClientYmlConfigFilesListAPI();
            console.log(`Config files: ${JSON.stringify(response[0])}`);
            const rawYaml = response[0].content.replace(/\\r\\n/g, "\n"); // Normalize newlines
            // setYamlContent(rawYaml);
            setConfigFiles(response);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (id) => {
        console.log("Edit file : ", id);
        const record = configFiles.find((file) => file.id === id);
        // console.log(`Record : ${JSON.stringify(record)}`);
        if (record) {
            // Assuming record.content holds the YAML content
            // console.log(`Record content : ${record.content}`);
            const rawYaml = record.content.replace(/\\r\\n/g, "\n"); // Normalize newlines
            setYamlContent(rawYaml);
            setIsEditorOpen(true); // Open the dialog
        } else {
            console.log("Record not found");
        }
    };

    const closeEditor = () => {
        setIsEditorOpen(false); // Close the editor dialog
    };

    // Handle changes in YAML editor
    const handleYamlChange = (newValue) => {
        setYamlContent(newValue);
        try {
            jsYAML.load(newValue); // Validate YAML using js-yaml
            setErrorMessage(null); // Clear error if no issues
        } catch (e) {
            setErrorMessage(`YAML Error: ${e.message}`); // Show YAML errors
        }
    };

    const handleRowClick = (id) => {
        setSelectedItem(id); // Set the selected ID
        console.log(`Selected ID: ${id}`);
    };

    useEffect(() => {
        fetchConfigFiles();
    }, []);

    // className="flex items-center gap-4 p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100 transition duration-200 ease-in-out"
    // className={`cursor-pointer hover:bg-gray-400 transition duration-200 ease-in-out ${selected === id ? "bg-gray-400" : ""}`}
    return (
        <>
            <Card className="h-full w-1/3 overflow-scroll">
                <CardHeader
                    floated={false}
                    shadow={false}
                    className="mb-2 rounded-none p-2"
                >
                    <div className="w-full md:w-96">
                        <Input
                            label="Search Config Files"
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                        />
                    </div>
                </CardHeader>
                <table className="w-full min-w-max table-auto text-left">
                    <thead>
                        <tr className="bg-gray-600">
                            {TABLE_HEAD?.map((head) => (
                                <th
                                    key={head}
                                    className="border-b border-gray-300 items-center p-5 "
                                >
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-bold leading-none"
                                    >
                                        {head}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {configFiles?.map(
                            ({ id, name, description, modified_at }, index) => {
                                const isLast = index === configFiles.length - 1;
                                const classes = isLast
                                    ? "p-4"
                                    : "p-4 border-b border-gray-300";

                                return (
                                    <tr
                                        key={id}
                                        className={`hover:bg-gray-50 cursor-pointer transition duration-200 ease-in-out ${selected === id ? "bg-gray-600" : ""}`}
                                        onClick={() => handleRowClick(id)}
                                    >
                                        <td className={classes}>
                                            <div className="flex items-center gap-2">
                                                {/* <Checkbox /> */}
                                                <Radio
                                                    name="vertical-list"
                                                    id="vertical-list-react"
                                                    ripple={true}
                                                    className="p-10 "
                                                    containerProps={{
                                                        className: "p-0",
                                                    }}
                                                    checked={selected === id}
                                                    onClick={() =>
                                                        handleRowClick(id)
                                                    }
                                                />
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-bold"
                                                >
                                                    {id}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className={classes}>
                                            <Typography
                                                variant="small"
                                                className="font-normal text-gray-600"
                                            >
                                                {name}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <Typography
                                                variant="small"
                                                className="font-normal text-gray-600"
                                            >
                                                {description}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <Typography
                                                variant="small"
                                                className="font-normal text-gray-600"
                                            >
                                                {moment(modified_at).format(
                                                    "MMM DD/YY, hh:MM A"
                                                )}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <div className="flex items-center gap-2">
                                                <Tooltip content="Edit File">
                                                    <IconButton
                                                        variant="text"
                                                        size="sm"
                                                    >
                                                        <AiFillEdit
                                                            className="h-4 w-4 text-gray-900"
                                                            onClick={() =>
                                                                handleEdit(id)
                                                            }
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip content="Download">
                                                    <IconButton
                                                        variant="text"
                                                        size="sm"
                                                    >
                                                        <ArrowDownTrayIcon
                                                            strokeWidth={3}
                                                            className="h-4 w-4 text-gray-900"
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </table>
            </Card>
            {/* Conditionally render YamlEditor */}
            {isEditorOpen && (
                <YamlEditor
                    yamlContent={yamlContent}
                    handleYamlChange={handleYamlChange}
                    closeEditor={closeEditor} // Pass a callback to close the editor
                />
            )}
        </>
    );
};

export default ConfigFileList;
