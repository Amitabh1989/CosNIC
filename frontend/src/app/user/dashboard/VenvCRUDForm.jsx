// "use client";
// import React, { useState, useEffect } from "react";
// import {
//     Card,
//     Input,
//     Button,
//     Typography,
//     Menu,
//     MenuHandler,
//     MenuList,
//     MenuItem,
//     Dialog,
//     DialogHeader,
//     DialogBody,
//     DialogFooter,
//     Spinner,
// } from "@material-tailwind/react";
// import { getPythonVersions } from "@/api/getPythonVersion";
// import { getVenvStatusAPI_v2, getCtrlRepoVersionsAPI } from "@/api/venv_apis";

// // const VenvCRUDForm = ({ venvID }) => {
// //     console.log("Venv ID is:", venvID);
// //     const [venvData, setVenvData] = useState({});
// //     const [error, setError] = useState(null);
// //     const [loading, setLoading] = useState(true);
// //     const [pythonVersions, setPythonVersions] = useState([]);
// //     const [ctrlRepoVersions, setCtrlRepoVersions] = useState([]);
// //     const [open, setOpen] = React.useState(true);

// //     const handleOpen = () => setOpen(!open);

// //     const fetchPyVersion = async () => {
// //         try {
// //             const { versions } = await getPythonVersions();
// //             console.log("Python versions are:", versions);
// //             setPythonVersions(versions);
// //         } catch (error) {
// //             setError(error);
// //         }
// //     };

// //     const fetchCtrlRepoVersions = async () => {
// //         try {
// //             const response = await getCtrlRepoVersionsAPI(); // Add await
// //             console.log("Ctrl Repo versions are:", response.repo_versions);
// //             setCtrlRepoVersions(response.repo_versions); // Assuming this is how you handle the response
// //             console.log(
// //                 "Ctrl Repo versions are ctrlRepoVersions :",
// //                 ctrlRepoVersions
// //             );
// //         } catch (error) {
// //             setError(error);
// //         }
// //     };

// //     useEffect(() => {
// //         const fetchData = async () => {
// //             setLoading(true); // Start loading before any async operation
// //             try {
// //                 // Fetch the venv data
// //                 const response = await getVenvStatusAPI_v2(venvID);
// //                 setVenvData(response);
// //                 console.log("Venv data is:", response);

// //                 // Fetch the python versions
// //                 await fetchPyVersion();

// //                 // Fetch the controller repo versions
// //                 await fetchCtrlRepoVersions();
// //             } catch (error) {
// //                 console.error("Error in useEffect getVenvStatusAPI_v2:", error);
// //                 setError(error);
// //             } finally {
// //                 setLoading(false); // Stop loading once all data is fetched
// //             }
// //         };

// //         let isLoaded = true;

// //         if (isLoaded) {
// //             fetchData();
// //         } else {
// //             return () => {
// //                 isLoaded = false;
// //             };
// //         }
// //         // }

// //         // No cleanup needed here unless using subscriptions or event listeners
// //     }, [venvID]);

// const VenvCRUDForm = ({ venvID, onClose }) => {
//     console.log("Venv ID is:", venvID);

//     const [venvData, setVenvData] = useState({});
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [pythonVersions, setPythonVersions] = useState([]);
//     const [ctrlRepoVersions, setCtrlRepoVersions] = useState([]);
//     // const [dialogOpen, setDialogOpen] = useState(true);

//     // const handleOpen = () => {
//     //     setDialogOpen(true);
//     // };

//     // const handleClose = () => {
//     //     setDialogOpen(false);
//     // };

//     useEffect(() => {
//         if (dialogOpen) {
//             const fetchData = async () => {
//                 setLoading(true);
//                 try {
//                     const venvResponse = await getVenvStatusAPI_v2(venvID);
//                     setVenvData(venvResponse);

//                     // Uncomment and adjust if Python version fetching is needed
//                     // const pyVersionResponse = await getPythonVersions();
//                     // setPythonVersions(pyVersionResponse.versions);
//                     setPythonVersions([
//                         "3.10.11",
//                         "3.10.12",
//                         "3.10.13",
//                         "3.10.14",
//                         "3.10.15",
//                     ]);

//                     const ctrlRepoResponse = await getCtrlRepoVersionsAPI();
//                     setCtrlRepoVersions(ctrlRepoResponse.repo_versions);
//                 } catch (error) {
//                     console.error("Error fetching data:", error);
//                     setError(error);
//                 } finally {
//                     setLoading(false);
//                 }
//             };
//             if (venvID) {
//                 handleOpen();
//             }
//             fetchData();
//         }
//     }, [dialogOpen, venvID]); // Depend on dialogOpen and venvID

//     return (
//         <>
//             {/* <Button onClick={handleOpen} variant="gradient">
//                 Open Dialog
//             </Button> */}
//             <Dialog open={dialogOpen} onClose={handleClose}>
//                 <DialogHeader variant="h4" color="blue-gray">
//                     Edit Virtual Environment Details
//                 </DialogHeader>
//                 <DialogBody>
//                     {loading ? (
//                         <div className="flex justify-center items-center h-full w-full">
//                             <Spinner className="h-8 w-8" />
//                         </div>
//                     ) : (
//                         <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
//                             <div className="mb-1 flex flex-col gap-6">
//                                 <Typography
//                                     variant="h6"
//                                     color="blue-gray"
//                                     className="-mb-3"
//                                 >
//                                     VENV Nickname
//                                 </Typography>
//                                 <Input
//                                     size="lg"
//                                     placeholder="Enter nickname"
//                                     className="!border-t-blue-gray-200 focus:!border-t-gray-900"
//                                     value={venvData.nickname || ""}
//                                     onChange={(e) => {}}
//                                     labelProps={{
//                                         className:
//                                             "before:content-none after:content-none",
//                                     }}
//                                 />
//                                 <Typography
//                                     variant="h6"
//                                     color="blue-gray"
//                                     className="-mb-3 mt-6"
//                                 >
//                                     Python Version
//                                 </Typography>
//                                 <Menu
//                                     animate={{
//                                         mount: { y: 0 },
//                                         unmount: { y: 25 },
//                                     }}
//                                 >
//                                     <MenuHandler>
//                                         <Button variant="outlined">
//                                             {venvData.python_version ||
//                                                 "Select version"}
//                                         </Button>
//                                     </MenuHandler>
//                                     <MenuList
//                                         className="absolute z-[9999]"
//                                         menuProps={{
//                                             className: "z-[9999]",
//                                         }}
//                                     >
//                                         {pythonVersions.map((version) => (
//                                             <MenuItem
//                                                 key={version}
//                                                 onClick={() =>
//                                                     setVenvData({
//                                                         ...venvData,
//                                                         python_version: version,
//                                                     })
//                                                 }
//                                             >
//                                                 {version}
//                                             </MenuItem>
//                                         ))}
//                                     </MenuList>
//                                 </Menu>
//                                 <Typography
//                                     variant="h6"
//                                     color="blue-gray"
//                                     className="-mb-3"
//                                 >
//                                     Controller Repo Version
//                                 </Typography>
//                                 <Menu
//                                     animate={{
//                                         mount: { y: 0 },
//                                         unmount: { y: 25 },
//                                     }}
//                                 >
//                                     <MenuHandler>
//                                         <Button variant="outlined">
//                                             {venvData.ctrl_package_version ||
//                                                 "Select version"}
//                                         </Button>
//                                     </MenuHandler>
//                                     <MenuList
//                                         className="absolute z-[9999]"
//                                         menuProps={{
//                                             className: "z-[9999]",
//                                         }}
//                                     >
//                                         {ctrlRepoVersions.map((version) => (
//                                             <MenuItem
//                                                 key={version}
//                                                 onClick={() =>
//                                                     setVenvData({
//                                                         ...venvData,
//                                                         ctrl_package_version:
//                                                             version,
//                                                     })
//                                                 }
//                                             >
//                                                 {version}
//                                             </MenuItem>
//                                         ))}
//                                     </MenuList>
//                                 </Menu>
//                             </div>
//                             <Button className="mt-6" fullWidth>
//                                 Save
//                             </Button>
//                         </form>
//                     )}
//                 </DialogBody>
//                 <DialogFooter>
//                     <Button variant="gradient" color="green" onClick={onClose}>
//                         <span>Cancel</span>
//                     </Button>
//                 </DialogFooter>
//             </Dialog>
//         </>
//     );
// };

// export default VenvCRUDForm;

// // setPythonVersions([
// //     "3.10.0",
// //     "3.10.1",
// //     "3.10.10",
// //     "3.10.11",
// //     "3.10.12",
// //     "3.10.13",
// //     "3.10.14",
// //     "3.10.15",
// //     "3.10.2",
// //     "3.10.3",
// //     "3.10.4",
// //     "3.10.5",
// //     "3.10.6",
// //     "3.10.7",
// //     "3.10.8",
// //     "3.10.9",
// //     "3.11.0",
// //     "3.11.1",
// //     "3.11.10",
// //     "3.11.2",
// //     "3.11.3",
// //     "3.11.4",
// //     "3.11.5",
// //     "3.11.6",
// //     "3.11.7",
// //     "3.11.8",
// //     "3.11.9",
// //     "3.12.0",
// //     "3.12.1",
// //     "3.12.2",
// //     "3.12.3",
// //     "3.12.4",
// //     "3.12.5",
// //     "3.12.6",
// //     "3.13.0",
// //     "3.14.0",
// // ]);

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
