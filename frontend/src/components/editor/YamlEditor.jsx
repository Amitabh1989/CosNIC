"use client";
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
    Input,
    Spinner,
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import AceEditor from "react-ace";
import * as jsYAML from "js-yaml"; // YAML parser for validation
import moment from "moment";

import "ace-builds/src-noconflict/mode-yaml"; // YAML mode
import "ace-builds/src-noconflict/theme-monokai"; // Dark theme (you can change this to other Ace themes)
import "ace-builds/src-noconflict/theme-github"; // Dark theme (you can change this to other Ace themes)
import "ace-builds/src-noconflict/ext-language_tools"; // Enables autocompletion and syntax validation

import { debounce } from "lodash"; // Import debounce from lodash
import {
    saveSutClientYmlConfigFileAPI,
    getSutClientYmlConfigFileByIDAPI,
} from "../../api/configFile_apis";

export default function YamlEditor({
    yamlRecord,
    closeEditor,
    setConfigFiles,
}) {
    // const sizes = ["xs", "sm", "md", "xxl", "lg", "xl"]; // Predefined modal sizes
    const sizes = ["xs", "sm", "md", "lg", "xl", "xxl"]; // Predefined modal sizes
    const [sizeIndex, setSizeIndex] = React.useState(3); // Start with "lg" (index 3)
    const [editorHeight, setEditorHeight] = useState("500px"); // Editor height state
    const modalRef = useRef(null); // Reference to the modal element
    const [yamlEditedContent, setYamlEditedContent] = useState(
        yamlRecord.content
    ); // Initialize with yamlRecord
    const [errorMessage, setErrorMessage] = useState(null); // To store YAML error message
    const [name, setName] = useState(yamlRecord.name); // State for name input
    const [description, setDescription] = useState(yamlRecord.description); // State for description input
    const [contentChanged, setContentChanged] = useState(false); // To store if content has changed
    const [originalContent, setOriginalContent] = useState(yamlRecord.content); // To store original content
    const [isLoading, setIsLoading] = useState(false); // To store original content

    const refreshRecord = async (id) => {
        try {
            const record = await getSutClientYmlConfigFileByIDAPI(id);
            console.log("Record fetched:", record);
            setContentChanged(true);
            setOriginalContent(record);
            setYamlEditedContent(record.content);
            setName(record.name);
            setDescription(record.description);
            setConfigFiles(record);
            console.log("Record refreshed:", record);
            // return record;
        } catch (e) {
            setErrorMessage(`Error fetching record: ${e.message}`);
        }
    };

    // Function to open modal with a specific size
    const handleOpen = (index) => {
        if (index >= 0 && index < sizes.length) {
            setSizeIndex(index);
        }
    };

    // Increase modal size
    const handleSizeUp = () => {
        if (sizeIndex < sizes.length - 1) {
            setSizeIndex(sizeIndex + 1);
        }
    };

    // Decrease modal size
    const handleSizeDown = () => {
        if (sizeIndex > 0) {
            setSizeIndex(sizeIndex - 1);
        }
    };

    const handleClose = () => {
        closeEditor(); // Call the closeEditor callback to notify the parent
        // if (contentChanged) {
        //     refreshRecord(yamlRecord.id);
        // } else {
        //     setContentChanged(false);
        // }
    };

    // Function to handle input changes
    const handleInputChange = (event) => {
        console.log("Event:", event);
        const { name, value } = event.target;
        console.log(`Name: ${name}, Value: ${value}`);
        if (name === "name" && value != originalContent.name) {
            setName(value);
            setContentChanged(true);
        }
        if (name === "description" && value != originalContent.description) {
            setDescription(value);
            setContentChanged(true);
        }
        if (name === "content") {
            setYamlEditedContent(value);
            handleYamlChange(value); // Call handleYamlChange with updated value
        }
    };

    const handleSave = async (event) => {
        event.preventDefault(); // Prevent default form submission
        setIsLoading(true);
        try {
            jsYAML.load(yamlEditedContent); // Validate YAML using js-yaml
            setErrorMessage(null); // Clear error if no issues

            // Prepare data to send
            const dataToSend = {
                name: name, // Get the updated name
                description: description, // Get the updated description
                content: yamlEditedContent, // Use the edited YAML content
            };
            const response = await saveSutClientYmlConfigFileAPI(
                yamlRecord.id,
                dataToSend
            ); // Save the edited content
            console.log("Response from API:", response);
            console.log("Response content:", response.content);
            console.log("Updated name:", response.name);
            console.log("Updated description:", response.description);
            console.log(
                "Updated modified at:",
                moment(response.modified_at).format("MMM DD/YY, hh:MM A")
            );

            // Update the form with the latest saved data
            setYamlEditedContent(response.content);
            setDescription(response.description);
            setOriginalContent(response); // Update the original content with response
            setName(response.name);
            setContentChanged(true); // Disable save button after successful save

            // Update the parent component's list with the updated data
            // updateParentConfigList(response);
            setConfigFiles(response);
            // handleClose(); // Close the modal
            console.log("Saved successfully!");
        } catch (e) {
            setErrorMessage(`YAML Error: ${e.message}`); // Show YAML errors
        } finally {
            setIsLoading(false);
            setContentChanged(false); // Disable save button after successful save
        }
    };

    // Adjust the YAML editor height based on modal size
    useLayoutEffect(() => {
        const adjustEditorHeight = () => {
            if (modalRef.current) {
                const modalHeight = modalRef.current.offsetHeight;
                const headerHeight =
                    modalRef.current.querySelector(
                        ".modal-header"
                    ).offsetHeight;
                const footerHeight =
                    modalRef.current.querySelector(
                        ".modal-footer"
                    ).offsetHeight;
                const availableHeight =
                    modalHeight - headerHeight - footerHeight; // Adjust with padding/margins
                setEditorHeight(`${availableHeight}px`);
            }
        };

        adjustEditorHeight();
        window.addEventListener("resize", adjustEditorHeight);

        return () => window.removeEventListener("resize", adjustEditorHeight);
    }, [sizeIndex]); // Re-run whenever modal size changes

    // Handle changes in YAML editor
    const handleYamlChange = (newValue) => {
        try {
            jsYaml.load(newValue); // Validate YAML using js-yaml
            setYamlEditedContent(newValue); // Update edited content
            setErrorMessage(null); // Clear error if no issues
        } catch (e) {
            setErrorMessage(`YAML Error: ${e.message}`); // Show YAML errors
        }
        setContentChanged(newValue !== originalContent); // Check if content has changed
    };

    useEffect(() => {
        if (yamlRecord && yamlRecord.content) {
            const rawYaml = yamlRecord.content.replace(/\\r\\n/g, "\n"); // Normalize newlines
            setOriginalContent(rawYaml);
            setYamlEditedContent(rawYaml); // Reset editor when yamlRecord changes
        }
        let modified = moment(yamlRecord.modified_at).format(
            "MMM DD/YY, hh:MM A"
        );
        console.log("YAML Record changed:", { modified });
    }, [
        yamlRecord.content,
        yamlRecord.name,
        yamlRecord.description,
        yamlRecord.modified_at,
    ]);

    return (
        <>
            <form onSubmit={handleSave}>
                <Dialog
                    className="rounded-lg"
                    open={true}
                    onClose={closeEditor}
                    size={sizes[sizeIndex]} // Dynamically set the modal size
                    ref={modalRef} // Set the reference to the modal
                    animate={{
                        mount: { scale: 1, y: 0 },
                        unmount: { scale: 0.9, y: -100 },
                    }}
                >
                    <DialogHeader className="modal-header bg-blue-gray-100 rounded-t-lg">
                        <div className="flex justify-between items-center w-full">
                            <div className="text-left">Edit YAML File</div>
                            <p className="font-sans font-light text-sm">
                                Last modified at{" "}
                                {moment(yamlRecord.modified_at).format(
                                    "MMM DD/YY, hh:MM A"
                                )}
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleSizeUp}
                                    variant="gradient"
                                >
                                    Size +
                                </Button>
                                <Button
                                    onClick={handleSizeDown}
                                    variant="gradient"
                                >
                                    Size -
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                    <DialogBody className="h-full overflow-scroll">
                        <div className="p-4">
                            <Input
                                variant="outlined"
                                label="Any noteworthy name"
                                placeholder="Get Creative!"
                                name="name"
                                value={name}
                                onChange={(e) => handleInputChange(e)}
                            />
                        </div>
                        <div className="p-4">
                            {/* <label>Description:</label> */}
                            <Input
                                variant="outlined"
                                label="Description"
                                placeholder="SUT-Client IP should be good!"
                                name="description"
                                value={description}
                                onChange={(e) => handleInputChange(e)}
                            />
                        </div>
                        <div className="p-4">
                            <AceEditor
                                mode="yaml"
                                theme="monokai"
                                name="content"
                                onChange={(content) => {
                                    const mockEvent = {
                                        target: {
                                            name: "content",
                                            value: content,
                                        },
                                    };
                                    handleInputChange(mockEvent);
                                }}
                                value={yamlEditedContent} // Use yamlEditedContent to reflect user changes
                                editorProps={{ $blockScrolling: true }}
                                setOptions={{
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: true,
                                    navigateWithinSoftTabs: true,
                                    enableSnippets: true,
                                    showLineNumbers: true,
                                    tabSize: 8,
                                    fontSize: 16,
                                    setPadding: {
                                        top: 10,
                                        right: 10,
                                        bottom: 10,
                                        left: 10,
                                    },
                                }}
                                style={{
                                    width: "100%",
                                    height: editorHeight, // Dynamically adjust height
                                    fontSize: "14px",
                                    padding: "10px",
                                }}
                                className="rounded-lg border border-gray-300"
                                // If mouse misbehaves or anything, remove this below line
                                onLoad={function (editor) {
                                    editor.renderer.setPadding(10);
                                    editor.renderer.setScrollMargin(10);
                                }}
                            />
                        </div>
                    </DialogBody>
                    <DialogFooter className="modal-footer">
                        <div className="flex justify-end items-center w-full gap-3">
                            <div>
                                {isLoading ? (
                                    <>
                                        <Spinner className="h-4 w-4" />
                                        Saving...
                                    </>
                                ) : (
                                    <Button
                                        onClick={handleSave}
                                        disabled={!contentChanged}
                                    >
                                        Save Changes
                                    </Button>
                                )}
                            </div>
                            <div>
                                <Button onClick={handleClose}>Close</Button>
                            </div>
                        </div>
                    </DialogFooter>
                </Dialog>
            </form>
        </>
    );
}
