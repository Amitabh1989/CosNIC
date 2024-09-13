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

const VenvCRUDForm = ({ venvID, onClose }) => {
    const [venvData, setVenvData] = useState({});
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

                // Uncomment and adjust if Python version fetching is needed
                // const pyVersionResponse = await getPythonVersions();
                // setPythonVersions(pyVersionResponse.versions);
                setPythonVersions([
                    "3.10.11",
                    "3.10.12",
                    "3.10.13",
                    "3.10.14",
                    "3.10.15",
                ]);

                const ctrlRepoResponse = await getCtrlRepoVersionsAPI();
                setCtrlRepoVersions(ctrlRepoResponse.repo_versions);
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

    return (
        <Dialog open={true} onClose={onClose}>
            <DialogHeader variant="h4" color="blue-gray">
                Edit Virtual Environment Details
            </DialogHeader>
            <DialogBody>
                {loading ? (
                    <div className="flex justify-center items-center h-full w-full">
                        <Spinner className="h-8 w-8" />
                    </div>
                ) : (
                    <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
                        <div className="mb-1 flex flex-col gap-6">
                            <Typography
                                variant="h6"
                                color="blue-gray"
                                className="-mb-3"
                            >
                                VENV Nickname
                            </Typography>
                            <Input
                                size="lg"
                                placeholder="Enter nickname"
                                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                value={venvData.nickname || ""}
                                onChange={(e) => {}}
                                labelProps={{
                                    className:
                                        "before:content-none after:content-none",
                                }}
                            />
                            <Typography
                                variant="h6"
                                color="blue-gray"
                                className="-mb-3 mt-6"
                            >
                                Python Version
                            </Typography>
                            <Menu
                                animate={{
                                    mount: { y: 0 },
                                    unmount: { y: 25 },
                                }}
                            >
                                <MenuHandler>
                                    <Button variant="outlined">
                                        {venvData.python_version ||
                                            "Select version"}
                                    </Button>
                                </MenuHandler>
                                <MenuList
                                    className="absolute z-[9999]"
                                    menuProps={{
                                        className: "z-[9999]",
                                    }}
                                >
                                    {pythonVersions.map((version) => (
                                        <MenuItem
                                            key={version}
                                            onClick={() =>
                                                setVenvData({
                                                    ...venvData,
                                                    python_version: version,
                                                })
                                            }
                                        >
                                            {version}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </Menu>
                            <Typography
                                variant="h6"
                                color="blue-gray"
                                className="-mb-3"
                            >
                                Controller Repo Version
                            </Typography>
                            <Menu
                                animate={{
                                    mount: { y: 0 },
                                    unmount: { y: 25 },
                                }}
                            >
                                <MenuHandler>
                                    <Button variant="outlined">
                                        {venvData.ctrl_package_version ||
                                            "Select version"}
                                    </Button>
                                </MenuHandler>
                                <MenuList
                                    className="absolute z-[9999]"
                                    menuProps={{
                                        className: "z-[9999]",
                                    }}
                                >
                                    {ctrlRepoVersions.map((version) => (
                                        <MenuItem
                                            key={version}
                                            onClick={() =>
                                                setVenvData({
                                                    ...venvData,
                                                    ctrl_package_version:
                                                        version,
                                                })
                                            }
                                        >
                                            {version}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </Menu>
                        </div>
                        <Button className="mt-6" fullWidth>
                            Save
                        </Button>
                    </form>
                )}
            </DialogBody>
        </Dialog>
    );
};

export default VenvCRUDForm;
