"use client";

import React, { useEffect, useState } from "react";
import {
    Card,
    Input,
    Button,
    Typography,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Spinner,
} from "@material-tailwind/react";
import { getVenvStatusAPI_v2, getCtrlRepoVersionsAPI } from "@/api/venv_apis";
import _ from "lodash";

const VenvCRUDForm = ({ venvID, onClose, dialogOpen }) => {
    const [venvData, setVenvData] = useState({});
    const [formData, setFormData] = useState(null);
    const [originalData, setOriginalData] = useState(null); // Store original data here
    const [hasChanged, setHasChanged] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pythonVersions, setPythonVersions] = useState([]);
    const [ctrlRepoVersions, setCtrlRepoVersions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const venvResponse = await getVenvStatusAPI_v2(venvID);
                setVenvData(venvResponse);
                setFormData(venvResponse); // Initialize formData with backend data
                setOriginalData(venvResponse); // Keep original values

                // Uncomment and adjust if Python version fetching is needed
                // const pyVersionResponse = await getPythonVersions();
                // setPythonVersions(pyVersionResponse.versions);
                setPythonVersions([
                    ...(venvResponse.python_version
                        ? [venvResponse.python_version]
                        : []), // Include backend value
                    "3.10.11",
                    "3.10.12",
                    "3.10.13",
                    "3.10.14",
                    "3.10.15",
                ]);

                const ctrlRepoResponse = await getCtrlRepoVersionsAPI();
                setCtrlRepoVersions(ctrlRepoResponse.repo_versions);
                // Initialize formData with venvData
                setFormData(venvResponse);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        if (venvID) {
            fetchData();
        }
    }, [venvID]); // Depend on venvID

    // Compare originalData with formData to detect changes
    useEffect(() => {
        if (originalData && formData) {
            setHasChanged(!_.isEqual(originalData, formData));
        }
    }, [formData, originalData]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    return (
        <Dialog
            open={dialogOpen}
            onClose={onClose}
            className="h-1/3 w-full flex flex-col rounded-lg"
        >
            <DialogHeader variant="h4" color="blue-gray">
                Edit Virtual Environment Details
            </DialogHeader>

            <DialogBody className="flex-grow overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-full w-full">
                        <Spinner className="h-8 w-8" />
                    </div>
                ) : (
                    <>
                        <form className="flex flex-col gap-6 h-full">
                            {/* Flex Row with labels and inputs */}
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* VENV Nickname */}
                                <div className="flex-1">
                                    <Typography variant="h6" color="blue-gray">
                                        VENV Nickname
                                    </Typography>
                                    <Input
                                        size="lg"
                                        placeholder="Enter nickname"
                                        className="!border-t-blue-gray-600 focus:!border-t-gray-900 w-full"
                                        value={formData?.nickname || ""}
                                        onChange={handleFormChange}
                                        labelProps={{
                                            className:
                                                "before:content-none after:content-none",
                                        }}
                                    />
                                </div>
                                {/* Python Version */}
                                <div className="flex-1">
                                    <Typography variant="h6" color="blue-gray">
                                        Python Version
                                    </Typography>
                                    <Menu
                                        animate={{
                                            mount: { y: 0 },
                                            unmount: { y: 25 },
                                        }}
                                    >
                                        <MenuHandler>
                                            <Button
                                                variant="outlined"
                                                className="w-full"
                                            >
                                                {formData?.python_version ||
                                                    "Select version"}
                                            </Button>
                                        </MenuHandler>
                                        <MenuList className="absolute z-[9999]">
                                            {pythonVersions.map((version) => (
                                                <MenuItem
                                                    key={version}
                                                    onClick={() =>
                                                        setFormData(
                                                            (prevData) => ({
                                                                ...prevData,
                                                                python_version:
                                                                    version,
                                                            })
                                                        )
                                                    }
                                                >
                                                    {version}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </Menu>
                                </div>
                            </div>

                            {/* Controller Repo Version */}
                            <div className="flex-1">
                                <Typography variant="h6" color="blue-gray">
                                    Controller Repo Version
                                </Typography>
                                <Menu
                                    animate={{
                                        mount: { y: 0 },
                                        unmount: { y: 25 },
                                    }}
                                >
                                    <MenuHandler>
                                        <Button
                                            variant="outlined"
                                            className="w-full"
                                        >
                                            {formData?.ctrl_package_version ||
                                                "Select version"}
                                        </Button>
                                    </MenuHandler>
                                    <MenuList className="absolute z-[9999]">
                                        {ctrlRepoVersions.map((version) => (
                                            <MenuItem
                                                key={version}
                                                onClick={() =>
                                                    setFormData((prevData) => ({
                                                        ...prevData,
                                                        ctrl_package_version:
                                                            version,
                                                    }))
                                                }
                                            >
                                                {version}
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </Menu>
                            </div>
                        </form>
                    </>
                )}
            </DialogBody>

            <DialogFooter className="sticky bottom-0 bg-white roundedb-lg">
                <div className="flex gap-4 justify-end items-center w-full">
                    {hasChanged && <Button color="blue">Prepare</Button>}
                    <Button color="red" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </DialogFooter>
        </Dialog>
    );
};

export default VenvCRUDForm;
