"use client";
import React, { useState, useEffect } from "react";
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

const TABLE_HEAD = ["ID", "Name", "Description", "Modified At", "Actions"];

const ConfigFileList = ({ configFilesList }) => {
    const [configFiles, setConfigFiles] = useState(configFilesList); // List of YAML config files
    const [yamlRecord, setYamlRecord] = useState(""); // YAML content
    const [selected, setSelectedItem] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = React.useState(false); // Controls dialog visibility
    const [recordHasChanged, setRecordHasChanged] = React.useState(false);
    const [changedRecord, setChangedRecord] = React.useState(null);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Debounced search term
    const [searchTerm, setSearchTerm] = useState(""); // For handling the search term

    const handleEdit = (id) => {
        console.log("Edit file : ", id);
        const record = configFiles.find((file) => file.id === id);
        console.log(`Record : ${JSON.stringify(record)}`);
        if (record) {
            setYamlRecord(record);
            setIsEditorOpen(true); // Open the dialog
        } else {
            console.log("Record not found");
        }
    };

    const closeEditor = () => {
        console.log("Editor state being toggled");
        setIsEditorOpen(false); // Close the editor dialog
    };

    const handleRowClick = (id) => {
        setSelectedItem(id); // Set the selected ID
        console.log(`Selected ID: ${id}`);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        // console.log(`Search term: ${term}`);
        // // Find term in configFiles by name and description
        // const filteredRecords = configFilesList.filter((record) => {
        //     return (
        //         record.name.toLowerCase().includes(term.toLowerCase()) ||
        //         record.description.toLowerCase().includes(term.toLowerCase())
        //     );
        // });
        // if (filteredRecords.length > 0) {
        //     setConfigFiles(filteredRecords);
        // }
        // console.log(`Filtered records: ${JSON.stringify(filteredRecords)}`);
    };

    // Debouncing effect for the search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm); // Update after debounce delay
        }, 300); // 300ms debounce delay

        return () => {
            clearTimeout(handler); // Clean up the timeout on every render
        };
    }, [searchTerm]); // Only trigger when searchTerm changes

    // Handle filtering records based on search term
    useEffect(() => {
        if (debouncedSearchTerm === "") {
            setConfigFiles(configFilesList); // Reset to full list when search is cleared
        } else {
            const filteredRecords = configFilesList.filter((record) => {
                return (
                    record.name
                        .toLowerCase()
                        .includes(debouncedSearchTerm.toLowerCase()) ||
                    record.description
                        .toLowerCase()
                        .includes(debouncedSearchTerm.toLowerCase())
                );
            });
            setConfigFiles(filteredRecords); // Update state with filtered records
        }
    }, [debouncedSearchTerm, configFilesList]); // Triggered when the debounced search term or original list changes

    useEffect(() => {
        console.log("configFiles state changed: ", configFiles);
        if (recordHasChanged) {
            console.log("Record has changed: ", changedRecord);
            setConfigFiles(changedRecord);
            setRecordHasChanged(false);
        } else {
            setConfigFiles(configFilesList);
        }
    }, [configFiles, configFilesList, changedRecord]);

    const updateConfigFiles = (updatedRecord) => {
        const record = configFiles.find((file) => file.id === updatedRecord.id);
        console.log(
            `Record : Updated ID : ${updatedRecord.id} : ${JSON.stringify(record)}`
        );
        setConfigFiles((prevConfigFiles) => {
            const newConfigFiles = prevConfigFiles.map((file) =>
                file.id === updatedRecord.id ? updatedRecord : file
            );
            console.log("Updated record in ConfigList: ", updatedRecord);
            console.log("New config files array:", newConfigFiles);
            setRecordHasChanged(true);
            setChangedRecord(newConfigFiles);
            setConfigFiles(newConfigFiles);
            return newConfigFiles; // Always return a new array reference
        });
    };

    return (
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
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </CardHeader>
            <table className="w-full min-w-max table-auto text-left">
                <thead>
                    <tr>
                        {TABLE_HEAD.map((head) => (
                            <th
                                key={head}
                                className="border-b border-gray-300 p-4"
                            >
                                <div className="flex items-center gap-1">
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
                    {configFiles?.map(
                        ({ id, name, description, modifiedAt }) => (
                            <tr key={id} onClick={() => handleRowClick(id)}>
                                <td className="p-4 border-b border-gray-300">
                                    {id}
                                </td>
                                <td className="p-4 border-b border-gray-300">
                                    {name}
                                </td>
                                <td className="p-4 border-b border-gray-300">
                                    {description}
                                </td>
                                <td className="p-4 border-b border-gray-300">
                                    {moment(modifiedAt).format("LLL")}
                                </td>
                                <td className="p-4 border-b border-gray-300">
                                    <IconButton
                                        variant="text"
                                        size="sm"
                                        onClick={() => handleEdit(id)}
                                    >
                                        <AiFillEdit className="h-4 w-4 text-gray-900" />
                                    </IconButton>
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>
            {isEditorOpen && (
                <YamlEditor
                    yamlRecord={yamlRecord}
                    closeEditor={closeEditor} // Pass a callback to close the editor
                    setConfigFiles={updateConfigFiles}
                />
            )}
        </Card>
    );
};

export default ConfigFileList;

// "use client";
// import React, { useState, useEffect } from "react";
// import {
//     ArrowDownTrayIcon,
//     MagnifyingGlassIcon,
// } from "@heroicons/react/24/outline";
// import {
//     Radio,
//     Card,
//     Input,
//     Tooltip,
//     CardHeader,
//     IconButton,
//     Typography,
// } from "@material-tailwind/react";
// import { AiFillEdit } from "react-icons/ai";
// import moment from "moment";
// import YamlEditor from "../editor/YamlEditor";

// // Table headers
// const TABLE_HEAD = ["ID", "Name", "Description", "Modified At", "Actions"];

// /**
//  * ConfigFileList component displays a list of configuration files and allows editing them.
//  * @param {Array} configFilesList - List of configuration files.
//  */
// const ConfigFileList = ({ configFilesList }) => {
//     // State to manage the list of configuration files
//     const [configFiles, setConfigFiles] = useState(configFilesList);
//     // State to manage the YAML content of the selected file
//     const [yamlRecord, setYamlRecord] = useState("");
//     // State to manage the selected file ID
//     const [selected, setSelectedItem] = useState(null);
//     // State to control the visibility of the editor dialog
//     const [isEditorOpen, setIsEditorOpen] = useState(false);
//     // State to track if the record has changed
//     const [recordHasChanged, setRecordHasChanged] = useState(false);
//     // State to manage the changed record
//     const [changedRecord, setChangedRecord] = useState(null);

//     /**
//      * Handles the edit action for a configuration file.
//      * @param {number} id - ID of the configuration file to edit.
//      */
//     const handleEdit = (id) => {
//         console.log("Edit file : ", id);
//         const record = configFiles.find((file) => file.id === id);
//         console.log(`Record : ${JSON.stringify(record)}`);
//         if (record) {
//             setYamlRecord(record);
//             setIsEditorOpen(true); // Open the dialog
//         } else {
//             console.log("Record not found");
//         }
//     };

//     /**
//      * Closes the editor dialog.
//      */
//     const closeEditor = () => {
//         console.log("Editor state being toggled");
//         setIsEditorOpen(false); // Close the editor dialog
//     };

//     /**
//      * Handles the row click action to select a configuration file.
//      * @param {number} id - ID of the configuration file to select.
//      */
//     const handleRowClick = (id) => {
//         setSelectedItem(id); // Set the selected ID
//     };

//     return (
//         <Card className="h-full w-full overflow-scroll">
//             <CardHeader
//                 floated={false}
//                 shadow={false}
//                 className="mb-2 rounded-none p-2"
//             >
//                 <div className="w-full md:w-96">
//                     <Input
//                         label="Search Invoice"
//                         icon={<MagnifyingGlassIcon className="h-5 w-5" />}
//                     />
//                 </div>
//             </CardHeader>
//             <table className="w-full min-w-max table-auto text-left">
//                 <thead>
//                     <tr>
//                         {TABLE_HEAD.map((head) => (
//                             <th
//                                 key={head}
//                                 className="border-b border-gray-300 p-4"
//                             >
//                                 <div className="flex items-center gap-1">
//                                     <Typography
//                                         color="blue-gray"
//                                         variant="small"
//                                         className="!font-bold"
//                                     >
//                                         {head}
//                                     </Typography>
//                                 </div>
//                             </th>
//                         ))}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {configFiles?.map(
//                         ({ id, name, description, modifiedAt }) => (
//                             <tr key={id} onClick={() => handleRowClick(id)}>
//                                 <td className="p-4 border-b border-gray-300">
//                                     {id}
//                                 </td>
//                                 <td className="p-4 border-b border-gray-300">
//                                     {name}
//                                 </td>
//                                 <td className="p-4 border-b border-gray-300">
//                                     {description}
//                                 </td>
//                                 <td className="p-4 border-b border-gray-300">
//                                     {moment(modifiedAt).format("LLL")}
//                                 </td>
//                                 <td className="p-4 border-b border-gray-300">
//                                     <IconButton
//                                         variant="text"
//                                         size="sm"
//                                         onClick={() => handleEdit(id)}
//                                     >
//                                         <AiFillEdit className="h-4 w-4 text-gray-900" />
//                                     </IconButton>
//                                 </td>
//                             </tr>
//                         )
//                     )}
//                 </tbody>
//             </table>
//             {isEditorOpen && (
//                 <YamlEditor
//                     yamlRecord={yamlRecord}
//                     closeEditor={closeEditor} // Pass a callback to close the editor
//                     setConfigFiles={updateConfigFiles}
//                 />
//             )}
//         </Card>
//     );
// };

// export default ConfigFileList;
