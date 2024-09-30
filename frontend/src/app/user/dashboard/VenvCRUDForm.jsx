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

// const VenvCRUDForm = ({ venvID, onClose, dialogOpen }) => {
//     const [venvData, setVenvData] = useState({});
//     const [formData, setFormData] = useState(null);
//     const [hasChanged, setHasChanged] = useState(false);
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [pythonVersions, setPythonVersions] = useState([]);
//     const [ctrlRepoVersions, setCtrlRepoVersions] = useState([]);

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const venvResponse = await getVenvStatusAPI_v2(venvID);
//                 setVenvData(venvResponse);

//                 // Uncomment and adjust if Python version fetching is needed
//                 // const pyVersionResponse = await getPythonVersions();
//                 // setPythonVersions(pyVersionResponse.versions);
//                 setPythonVersions([
//                     "3.10.11",
//                     "3.10.12",
//                     "3.10.13",
//                     "3.10.14",
//                     "3.10.15",
//                 ]);

//                 const ctrlRepoResponse = await getCtrlRepoVersionsAPI();
//                 setCtrlRepoVersions(ctrlRepoResponse.repo_versions);
//                 // Initialize formData with venvData
//                 setFormData(venvResponse);
//             } catch (error) {
//                 console.error("Error fetching data:", error);
//                 setError(error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (venvID) {
//             fetchData();
//         }
//     }, [venvID]); // Depend on venvID

//     // Utility function to compare form data with original venvData
//     const hasFormChanged = () => !_.isEqual(formData, venvData);

//     const handleFormChange = (e) => {
//         const { name, value } = e.target;
//         setVenvData({
//             ...venvData,
//             [name]: value,
//         });

//         // Update hasChanged based on content difference
//         setHasChanged(hasFormChanged());
//     };

//     return (
//         <Dialog open={dialogOpen} onClose={onClose} className="h-1/2">
//             <DialogHeader variant="h4" color="blue-gray">
//                 Edit Virtual Environment Details
//             </DialogHeader>
//             <DialogBody>
//                 {loading ? (
//                     <div className="flex justify-center items-center h-full w-full">
//                         <Spinner className="h-8 w-8" />
//                     </div>
//                 ) : (
//                     // <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96 h-full gap-4">
//                     <div>
//                         <form className="flex flex-col h-full gap-4">
//                             {/* <div className="flex flex-col gap-6 mb-10"> */}
//                             <div className="grid grid-rows-2 gap-y-4">
//                                 <div>
//                                     <Typography
//                                         variant="h6"
//                                         color="blue-gray"
//                                         className="-mb-3"
//                                     >
//                                         VENV Nickname
//                                     </Typography>
//                                 </div>
//                                 <div>
//                                     <Input
//                                         size="lg"
//                                         placeholder="Enter nickname"
//                                         className="!border-t-blue-gray-600 focus:!border-t-gray-900"
//                                         value={venvData.nickname || ""}
//                                         onChange={(e) => {}}
//                                         labelProps={{
//                                             className:
//                                                 "before:content-none after:content-none",
//                                         }}
//                                     />
//                                 </div>
//                             </div>
//                             <div className="grid">
//                                 <Typography
//                                     variant="h6"
//                                     color="blue-gray"
//                                     className="-mb-3"
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
//                                                 onClick={(e) =>
//                                                     handleFormChange(e)
//                                                 }
//                                             >
//                                                 {version}
//                                             </MenuItem>
//                                         ))}
//                                     </MenuList>
//                                 </Menu>
//                             </div>
//                             <div className="grid">
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
//                                                 onClick={(e) =>
//                                                     handleFormChange(e)
//                                                 }
//                                             >
//                                                 {version}
//                                             </MenuItem>
//                                         ))}
//                                     </MenuList>
//                                 </Menu>
//                             </div>
//                             <div className="flex gap-4 justify-end items-end">
//                                 {hasChanged && (
//                                     <Button className="mt-6" color="blue">
//                                         Save
//                                     </Button>
//                                 )}
//                                 {/* <Button className="mt-6" color="green">
//                                     Prepare
//                                 </Button> */}
//                                 <Button
//                                     className="mt-6"
//                                     color="red"
//                                     onClick={onClose}
//                                 >
//                                     Cancel
//                                 </Button>
//                             </div>
//                         </form>
//                     </div>
//                 )}
//             </DialogBody>
//         </Dialog>
//     );
// };

// const VenvCRUDForm = ({ venvID, onClose, dialogOpen }) => {
//     const [venvData, setVenvData] = useState({});
//     const [formData, setFormData] = useState(null);
//     const [originalData, setOriginalData] = useState(null); // Store original data here
//     const [hasChanged, setHasChanged] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [pythonVersions, setPythonVersions] = useState([]);
//     const [ctrlRepoVersions, setCtrlRepoVersions] = useState([]);

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const venvResponse = await getVenvStatusAPI_v2(venvID);
//                 setVenvData(venvResponse);
//                 setFormData(venvResponse); // Initialize formData with backend data
//                 setOriginalData(venvResponse); // Keep original values

//                 setPythonVersions([
//                     ...(venvResponse.python_version
//                         ? [venvResponse.python_version]
//                         : []), // Include backend value
//                     "3.10.11",
//                     "3.10.12",
//                     "3.10.13",
//                     "3.10.14",
//                     "3.10.15",
//                 ]);

//                 const ctrlRepoResponse = await getCtrlRepoVersionsAPI();
//                 setCtrlRepoVersions(ctrlRepoResponse.repo_versions);
//             } catch (error) {
//                 console.error("Error fetching data:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (venvID) {
//             fetchData();
//         }
//     }, [venvID]);

//     // Compare originalData with formData to detect changes
//     useEffect(() => {
//         if (originalData && formData) {
//             setHasChanged(!_.isEqual(originalData, formData));
//         }
//     }, [formData, originalData]);

//     const handleFormChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prevData) => ({
//             ...prevData,
//             [name]: value,
//         }));
//     };

//     return (
//         <Dialog open={dialogOpen} onClose={onClose} className="h-1/2">
//             <DialogHeader>Edit Virtual Environment Details</DialogHeader>
//             <DialogBody>
//                 {loading ? (
//                     <Spinner />
//                 ) : (
//                     <form className="flex flex-col gap-4">
//                         <div className="grid gap-4">
//                             <div>
//                                 <Typography>VENV Nickname</Typography>
//                                 <Input
//                                     name="nickname"
//                                     value={formData?.nickname || ""}
//                                     onChange={handleFormChange}
//                                     placeholder="Enter nickname"
//                                 />
//                             </div>

//                             <div>
//                                 <Typography>Python Version</Typography>
//                                 <Menu>
//                                     <MenuHandler>
//                                         <Button>
//                                             {formData?.python_version ||
//                                                 "Select version"}
//                                         </Button>
//                                     </MenuHandler>
//                                     <MenuList>
//                                         {pythonVersions.map((version) => (
//                                             <MenuItem
//                                                 key={version}
//                                                 onClick={() =>
//                                                     setFormData((prevData) => ({
//                                                         ...prevData,
//                                                         python_version: version,
//                                                     }))
//                                                 }
//                                             >
//                                                 {version}
//                                             </MenuItem>
//                                         ))}
//                                     </MenuList>
//                                 </Menu>
//                             </div>

//                             <div>
//                                 <Typography>Controller Repo Version</Typography>
//                                 <Menu>
//                                     <MenuHandler>
//                                         <Button>
//                                             {formData?.ctrl_package_version ||
//                                                 "Select version"}
//                                         </Button>
//                                     </MenuHandler>
//                                     <MenuList>
//                                         {ctrlRepoVersions.map((version) => (
//                                             <MenuItem
//                                                 key={version}
//                                                 onClick={() =>
//                                                     setFormData((prevData) => ({
//                                                         ...prevData,
//                                                         ctrl_package_version:
//                                                             version,
//                                                     }))
//                                                 }
//                                             >
//                                                 {version}
//                                             </MenuItem>
//                                         ))}
//                                     </MenuList>
//                                 </Menu>
//                             </div>
//                         </div>

//                         <div className="flex justify-end gap-4">
//                             {hasChanged && (
//                                 <Button className="mt-6" color="blue">
//                                     Save
//                                 </Button>
//                             )}
//                             <Button
//                                 className="mt-6"
//                                 color="red"
//                                 onClick={onClose}
//                             >
//                                 Cancel
//                             </Button>
//                         </div>
//                     </form>
//                 )}
//             </DialogBody>
//         </Dialog>
//     );
// };

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
        <Dialog open={dialogOpen} onClose={onClose} className="h-1/2">
            <DialogHeader variant="h4" color="blue-gray">
                Edit Virtual Environment Details
            </DialogHeader>
            <DialogBody>
                {loading ? (
                    <div className="flex justify-center items-center h-full w-full">
                        <Spinner className="h-8 w-8" />
                    </div>
                ) : (
                    // <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96 h-full gap-4">
                    <div>
                        <form className="flex flex-col h-full gap-4">
                            {/* <div className="flex flex-col gap-6 mb-10"> */}
                            <div className="grid grid-rows-2 gap-y-4">
                                <div>
                                    <Typography
                                        variant="h6"
                                        color="blue-gray"
                                        className="-mb-3"
                                    >
                                        VENV Nickname
                                    </Typography>
                                </div>
                                <div>
                                    <Input
                                        size="lg"
                                        placeholder="Enter nickname"
                                        className="!border-t-blue-gray-600 focus:!border-t-gray-900"
                                        value={formData?.nickname || ""}
                                        onChange={handleFormChange}
                                        labelProps={{
                                            className:
                                                "before:content-none after:content-none",
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="grid">
                                <Typography
                                    variant="h6"
                                    color="blue-gray"
                                    className="-mb-3"
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
                                            {formData?.python_version ||
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
                                                    setFormData((prevData) => ({
                                                        ...prevData,
                                                        python_version: version,
                                                    }))
                                                }
                                            >
                                                {version}
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </Menu>
                            </div>
                            <div className="grid">
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
                                            {formData?.ctrl_package_version ||
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
                            <div className="flex gap-4 justify-end items-end">
                                {hasChanged && (
                                    <Button className="mt-6" color="blue">
                                        Prepare
                                    </Button>
                                )}
                                <Button
                                    className="mt-6"
                                    color="red"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </DialogBody>
        </Dialog>
    );
};

export default VenvCRUDForm;
