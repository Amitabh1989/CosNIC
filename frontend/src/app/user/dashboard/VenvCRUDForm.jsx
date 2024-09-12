"use client";
import React, { useState, useEffect } from "react";
import { getVenvStatusAPI_v2, getCtrlRepoVersionsAPI } from "@/api/venv_apis";
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
} from "@material-tailwind/react";
import { getPythonVersions } from "@/utils/getPythonVersion";

const VenvCRUDForm = ({ venvID }) => {
    console.log("Venv ID is:", venvID);
    const [venvData, setVenvData] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pythonVersions, setPythonVersions] = useState([]);
    const [ctrlRepoVersions, setCtrlRepoVersions] = useState([]);
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => setOpen(!open);

    const fetchPyVersion = async () => {
        try {
            const { versions } = await getPythonVersions();
            console.log("Python versions are:", versions);
            setPythonVersions(versions);
        } catch (error) {
            setError(error);
        }
    };

    const fetchCtrlRepoVersions = async () => {
        try {
            const response = await getCtrlRepoVersionsAPI(); // Add await
            console.log("Ctrl Repo versions are:", response);
            setCtrlRepoVersions(response); // Assuming this is how you handle the response
        } catch (error) {
            setError(error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getVenvStatusAPI_v2(venvID); // Add await
                setVenvData(response);
                console.log("Venv data is:", response);
            } catch (error) {
                console.error("Error in useEffect getVenvStatusAPI_v2:", error);
                setError(error);
            }
        };
        fetchData();
        fetchPyVersion();
        fetchCtrlRepoVersions();
        setLoading(false);

        // No cleanup needed here unless using subscriptions or event listeners
    }, [venvID]);

    return (
        <>
            <Button onClick={handleOpen} variant="gradient">
                Open Dialog
            </Button>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <Dialog open={open} handler={handleOpen}>
                    <DialogHeader>Its a simple dialog.</DialogHeader>
                    <DialogBody>
                        <Card color="transparent" shadow={false}>
                            <Typography variant="h4" color="blue-gray">
                                Edit Virtual Environment Details
                            </Typography>
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
                                        className="-mb-3"
                                    >
                                        Python Version
                                    </Typography>
                                    <Menu>
                                        <MenuHandler>
                                            <Button>
                                                {venvData.python_version ||
                                                    "Select version"}
                                            </Button>
                                        </MenuHandler>
                                        <MenuList>
                                            {pythonVersions.map((version) => (
                                                <MenuItem
                                                    key={version}
                                                    onClick={setVenvData({
                                                        ...venvData,
                                                        [python_version]:
                                                            version,
                                                    })}
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
                                    {/* <Menu>
                                        <MenuHandler>
                                            <Button>
                                                {venvData.ctrl_package_version ||
                                                    "Select version"}
                                            </Button>
                                        </MenuHandler>
                                        <MenuList>
                                            {ctrlRepoVersions.map((version) => (
                                                <MenuItem key={version}>
                                                    {version}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </Menu> */}
                                </div>
                                <Button className="mt-6" fullWidth>
                                    Save
                                </Button>
                            </form>
                        </Card>
                    </DialogBody>
                </Dialog>
            )}
        </>
    );
};

export default VenvCRUDForm;
