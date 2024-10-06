"use client";
import React, { useState, useEffect } from "react";
import { DocumentIcon } from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
    Radio,
    Card,
    Input,
    List,
    ListItem,
    ListItemPrefix,
    Checkbox,
    CardHeader,
    IconButton,
    Typography,
    CardBody,
} from "@material-tailwind/react";

import moment from "moment";

import { getSutClientYmlConfigFilesListAPI } from "../../api/configFile_apis";

const ConfigFileList = () => {
    const [configFiles, setConfigFiles] = useState([]); // List of YAML config files
    const [yamlContent, setYamlContent] = useState(""); // YAML content
    const [errorMessage, setErrorMessage] = useState(null); // To store YAML error message

    // Get the list and content of YAML config files : DONE
    // Display in table and editor : DONE

    // Fetch YAML config files
    const fetchConfigFiles = async () => {
        try {
            const response = await getSutClientYmlConfigFilesListAPI();
            console.log(`Config files: ${JSON.stringify(response[0])}`);
            const rawYaml = response[0].content.replace(/\\r\\n/g, "\n"); // Normalize newlines
            setYamlContent(rawYaml);
            setConfigFiles(response);
        } catch (error) {
            console.error(error);
        }
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

    useEffect(() => {
        fetchConfigFiles();
    }, []);

    return (
        <Card className="h-full w-full overflow-scroll">
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
            <CardBody>
                <table className="w-full min-w-max table-auto text-left">
                    <thead></thead>
                    <tbody>
                        {configFiles?.map(
                            ({ id, name, description, modified_at }, index) => {
                                const isLast = index === configFiles.length - 1;
                                const classes = isLast
                                    ? "p-4"
                                    : "p-4 border-b border-gray-300";

                                return (
                                    <tr key={id}>
                                        <td className={classes}>
                                            <div className="flex items-center gap-1">
                                                {/* <Checkbox /> */}
                                                <Radio
                                                    name="vertical-list"
                                                    id="vertical-list-react"
                                                    ripple={false}
                                                    className="hover:before:opacity-0"
                                                    containerProps={{
                                                        className: "p-0",
                                                    }}
                                                />
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-bold ml-6"
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
                                                <IconButton
                                                    variant="text"
                                                    size="sm"
                                                >
                                                    <DocumentIcon className="h-4 w-4 text-gray-900" />
                                                </IconButton>
                                                <IconButton
                                                    variant="text"
                                                    size="sm"
                                                >
                                                    <ArrowDownTrayIcon
                                                        strokeWidth={3}
                                                        className="h-4 w-4 text-gray-900"
                                                    />
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </table>
            </CardBody>
        </Card>
    );
};
export default ConfigFileList;
