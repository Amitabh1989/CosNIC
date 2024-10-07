"use client";
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import AceEditor from "react-ace";
import * as jsYAML from "js-yaml"; // YAML parser for validation

import "ace-builds/src-noconflict/mode-yaml"; // YAML mode
import "ace-builds/src-noconflict/theme-monokai"; // Dark theme (you can change this to other Ace themes)
import "ace-builds/src-noconflict/theme-github"; // Dark theme (you can change this to other Ace themes)
import "ace-builds/src-noconflict/ext-language_tools"; // Enables autocompletion and syntax validation

import { debounce } from "lodash"; // Import debounce from lodash
import { saveSutClientYmlConfigFileAPI } from "../../api/configFile_apis";

export default function YamlEditor({ yamlRecord, closeEditor }) {
    const sizes = ["xs", "sm", "md", "xxl", "lg", "xl"]; // Predefined modal sizes
    const [sizeIndex, setSizeIndex] = React.useState(2); // Start with "md" (index 2)
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
    };

    const handleSave = () => {
        try {
            jsYAML.load(yamlEditedContent); // Validate YAML using js-yaml
            setErrorMessage(null); // Clear error if no issues

            // Prepare data to send
            const dataToSend = {
                name: name, // Get the updated name
                description: description, // Get the updated description
                content: yamlEditedContent, // Use the edited YAML content
            };
            saveSutClientYmlConfigFileAPI(yamlRecord.id, dataToSend); // Save the edited content
        } catch (e) {
            setErrorMessage(`YAML Error: ${e.message}`); // Show YAML errors
            return;
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
                    modalHeight - headerHeight - footerHeight - 40; // Adjust with padding/margins
                setEditorHeight(`${availableHeight}px`);
            }
        };

        adjustEditorHeight();
        window.addEventListener("resize", adjustEditorHeight);

        return () => window.removeEventListener("resize", adjustEditorHeight);
    }, [sizeIndex]); // Re-run whenever modal size changes

    // const debouncedYamlChange = debounce((newValue) => {
    //     try {
    //         jsYaml.load(newValue); // Validate YAML using js-yaml
    //         setErrorMessage(null); // Clear error if no issues
    //     } catch (e) {
    //         setErrorMessage(`YAML Error: ${e.message}`); // Show YAML errors
    //     }
    // }, 500); // Debounce time in milliseconds

    // Handle changes in YAML editor
    const handleYamlChange = (newValue) => {
        try {
            jsYaml.load(newValue); // Validate YAML using js-yaml
            setYamlEditedContent(newValue); // Update edited content
            setErrorMessage(null); // Clear error if no issues
        } catch (e) {
            setErrorMessage(`YAML Error: ${e.message}`); // Show YAML errors
        }
        // debouncedYamlChange(newValue); // Debounce the validation
        setContentChanged(newValue !== originalContent); // Check if content has changed
    };

    useEffect(() => {
        if (yamlRecord && yamlRecord.content) {
            const rawYaml = yamlRecord.content.replace(/\\r\\n/g, "\n"); // Normalize newlines
            setOriginalContent(rawYaml);
            setYamlEditedContent(rawYaml); // Reset editor when yamlRecord changes
        }
    }, [yamlRecord]);

    return (
        <>
            <Dialog
                open={true}
                onClose={closeEditor}
                size={sizes[sizeIndex]} // Dynamically set the modal size
                ref={modalRef} // Set the reference to the modal
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <DialogHeader className="modal-header">
                    <div className="flex justify-between items-center w-full">
                        <div className="text-left">Edit YAML File</div>
                        <div className="flex gap-3">
                            <Button onClick={handleSizeUp} variant="gradient">
                                Size +
                            </Button>
                            <Button onClick={handleSizeDown} variant="gradient">
                                Size -
                            </Button>
                        </div>
                    </div>
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Description:</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </DialogHeader>
                <DialogBody className="h-full overflow-scroll">
                    <AceEditor
                        mode="yaml"
                        theme="monokai"
                        onChange={handleYamlChange} // Use the updated handleYamlChange function
                        name="yaml-editor"
                        value={yamlEditedContent} // Use yamlEditedContent to reflect user changes
                        editorProps={{ $blockScrolling: true }}
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: true,
                            showLineNumbers: true,
                            tabSize: 8,
                            fontSize: 16,
                        }}
                        style={{
                            width: "100%",
                            height: editorHeight, // Dynamically adjust height
                            fontSize: "14px",
                        }}
                    />
                </DialogBody>
                <DialogFooter className="modal-footer">
                    <div className="flex justify-end items-center w-full gap-3">
                        <div>
                            <Button
                                onClick={handleSave}
                                disabled={!contentChanged}
                            >
                                Save Changes
                            </Button>
                        </div>
                        <div>
                            <Button onClick={handleClose}>Close</Button>
                        </div>
                    </div>
                </DialogFooter>
            </Dialog>
        </>
    );
}
