"use client";
import React, { useState, useEffect, useRef } from "react";
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

import ConfigFileList from "../tables/ConfigFileList";

// export default function YamlEditor({
//     yamlContent,
//     handleYamlChange,
//     closeEditor,
//     setIsEditorOpen,
// }) {
//     // console.log(`YAML content: ${yamlContent}`);
//     // console.log(`Close editor: ${closeEditor}`);
//     // console.log(`Handle YAML change: ${handleYamlChange}`);
//     const [open, setOpen] = React.useState(true); // Dialog is open initially

//     const handleOpen = () => {
//         setIsEditorOpen(!open);
//         setOpen(!open);
//     };

//     const handleClose = () => {
//         setIsEditorOpen(false);
//         setOpen(false);
//         closeEditor(); // Call the closeEditor callback to notify the parent
//     };

//     React.useEffect(() => {
//         console.log("Inside useEffect of YamlEditor");
//         setIsEditorOpen(true); // Ensure the dialog opens whenever the component mounts
//         setOpen(true);
//     }, [yamlContent]);

//     // <Dialog open={open} handler={handleOpen} onClose={handleClose}>
//     return (
//         <>
//             <Dialog
//                 // open={isEditorOpen}
//                 open={open}
//                 onClose={handleClose}
//                 handler={handleOpen}
//             >
//                 <DialogHeader>Edit YAML File</DialogHeader>
//                 <DialogBody>
//                     <AceEditor
//                         mode="yaml" // YAML mode for syntax highlighting
//                         theme="monokai" // Dark theme (choose others like monokai, github, dracula, etc.)
//                         onChange={handleYamlChange}
//                         name="yaml-editor"
//                         value={yamlContent} // Display the passed YAML content
//                         editorProps={{ $blockScrolling: true }}
//                         setOptions={{
//                             enableBasicAutocompletion: true,
//                             enableLiveAutocompletion: true,
//                             enableSnippets: true,
//                             showLineNumbers: true,
//                             tabSize: 8,
//                             fontSize: 16,
//                         }}
//                         style={{
//                             width: "100%",
//                             height: "500px",
//                             fontSize: "14px",
//                         }} // Editor style
//                     />
//                 </DialogBody>
//             </Dialog>
//         </>
//     );
// }

// export default function YamlEditor({
//     yamlContent,
//     handleYamlChange,
//     closeEditor,
// }) {
//     React.useEffect(() => {
//         console.log("Inside useEffect of YamlEditor");
//         // Any logic you want to run when yamlContent changes
//     }, [yamlContent]);

//     const sizes = ["xs", "sm", "md", "lg", "xl", "xxl"]; // Predefined modal sizes
//     const [sizeIndex, setSizeIndex] = React.useState(2); // Start with "md" (index 2)

//     // Function to open modal with a specific size
//     const handleOpen = (index) => {
//         if (index >= 0 && index < sizes.length) {
//             setSizeIndex(index);
//         }
//     };

//     // Increase modal size
//     const handleSizeUp = () => {
//         if (sizeIndex < sizes.length - 1) {
//             setSizeIndex(sizeIndex + 1);
//         }
//     };

//     // Decrease modal size
//     const handleSizeDown = () => {
//         if (sizeIndex > 0) {
//             setSizeIndex(sizeIndex - 1);
//         }
//     };
//     const handleClose = () => {
//         closeEditor(); // Call the closeEditor callback to notify the parent
//     };

//     // const handleOpen = (value) => setSize(value);

//     return (
//         <>
//             <Dialog open={true} onClose={closeEditor}>
//                 <DialogHeader>
//                     <div>Edit YAML File</div>
//                     <div className="mb-3 flex gap-3">
//                         <Button
//                             onClick={() => handleOpen(sizeIndex)}
//                             variant="gradient"
//                         >
//                             Open Modal
//                         </Button>
//                         <Button onClick={handleSizeUp} variant="gradient">
//                             Size +
//                         </Button>
//                         <Button onClick={handleSizeDown} variant="gradient">
//                             Size -
//                         </Button>
//                     </div>
//                 </DialogHeader>
//                 <DialogBody>
//                     <AceEditor
//                         mode="yaml" // YAML mode for syntax highlighting
//                         theme="monokai" // Dark theme (choose others like monokai, github, dracula, etc.)
//                         onChange={handleYamlChange}
//                         name="yaml-editor"
//                         value={yamlContent} // Display the passed YAML content
//                         editorProps={{ $blockScrolling: true }}
//                         setOptions={{
//                             enableBasicAutocompletion: true,
//                             enableLiveAutocompletion: true,
//                             enableSnippets: true,
//                             showLineNumbers: true,
//                             tabSize: 8,
//                             fontSize: 16,
//                         }}
//                         style={{
//                             width: "100%",
//                             height: "500px",
//                             fontSize: "14px",
//                         }} // Editor style
//                     />
//                 </DialogBody>
//                 <DialogFooter>
//                     <Button color="blue" onClick={handleClose}>
//                         Close
//                     </Button>
//                 </DialogFooter>
//             </Dialog>
//         </>
//     );
// }

export default function YamlEditor({
    yamlContent,
    handleYamlChange,
    closeEditor,
}) {
    React.useEffect(() => {
        console.log("Inside useEffect of YamlEditor");
    }, [yamlContent]);

    const sizes = ["xs", "sm", "md", "lg", "xl", "xxl"]; // Predefined modal sizes
    const [sizeIndex, setSizeIndex] = React.useState(2); // Start with "md" (index 2)
    const [editorHeight, setEditorHeight] = useState("500px"); // Editor height state
    const modalRef = useRef(null); // Reference to the modal element

    // Function to open modal with a specific size
    const handleOpen = (index) => {
        if (index >= 0 && index < sizes.length) {
            setSizeIndex(index);
            console.log(`Modal size set to: ${sizes[index]}`);
        }
    };

    // Increase modal size
    const handleSizeUp = () => {
        if (sizeIndex < sizes.length - 1) {
            setSizeIndex(sizeIndex + 1);
            console.log(`Increased size to: ${sizes[sizeIndex + 1]}`);
        }
    };

    // Decrease modal size
    const handleSizeDown = () => {
        if (sizeIndex > 0) {
            setSizeIndex(sizeIndex - 1);
            console.log(`Decreased size to: ${sizes[sizeIndex - 1]}`);
        }
    };

    const handleClose = () => {
        closeEditor(); // Call the closeEditor callback to notify the parent
    };

    // Adjust the YAML editor height based on modal size
    useEffect(() => {
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

        // Adjust height initially and on window resize
        adjustEditorHeight();
        window.addEventListener("resize", adjustEditorHeight);

        return () => window.removeEventListener("resize", adjustEditorHeight);
    }, [sizeIndex]); // Re-run whenever modal size changes

    return (
        <>
            <Dialog
                open={true}
                onClose={closeEditor}
                size={sizes[sizeIndex]} // Dynamically set the modal size
            >
                <DialogHeader>
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
                </DialogHeader>
                <DialogBody>
                    <AceEditor
                        mode="yaml"
                        theme="monokai"
                        onChange={handleYamlChange}
                        name="yaml-editor"
                        value={yamlContent}
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
                            height: editorHeight,
                            fontSize: "14px",
                        }}
                    />
                </DialogBody>
                <DialogFooter>
                    <Button color="blue" onClick={handleClose}>
                        Close
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}

// height: "500px",
