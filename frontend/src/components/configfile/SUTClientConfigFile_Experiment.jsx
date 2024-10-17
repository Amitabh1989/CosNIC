// "use client";
// import React, { useState, useEffect, useMemo } from "react";
// import {
//     getSutClientYmlConfigFilesListAPI,
//     getSutClientYmlConfigFileByIDAPI,
// } from "../../api/configFile_apis";

// // import { EditorView, keymap } from "@codemirror/view";
// // import { oneDark } from "@codemirror/theme-one-dark"; // One Dark Theme
// // import { indentWithTab } from "@codemirror/commands"; // For custom tab indentation
// // import { yaml } from "@codemirror/lang-yaml"; // YAML syntax highlighting
// // import { lintGutter } from "@codemirror/lint"; // Optional linting

// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import yaml from "js-yaml"; // For YAML validation

// import YamlEditor from "@focus-reactive/react-yaml";

// const SUTClientConfigFile = () => {
//     const [yamlContent, setYamlContent] = useState(""); // Store YAML content as string
//     const [yamlError, setYamlError] = useState(null); // Store YAML validation error

//     const editor = useEditor({
//         extensions: [StarterKit],
//         content: yamlContent,
//         onUpdate: ({ editor }) => {
//             const text = editor.getHTML(); // Get the content in HTML
//             handleYamlChange(text); // Update YAML content as user edits
//         },
//     });

//     const fetchConfigFiles = async () => {
//         try {
//             const response = await getSutClientYmlConfigFilesListAPI();
//             console.log(`Config files: ${JSON.stringify(response[0])}`);

//             // Extract and store the YAML content (it's a string, not JSON)
//             let rawYaml = response[0].content;

//             // Replace escaped newlines with actual newlines
//             const formattedYaml = rawYaml.replace(/\\r\\n/g, "\n");

//             setYamlContent(formattedYaml); // Set YAML as a string
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const handleYamlChange = ({ text }) => {
//         console.log("Updated YAML:", text);
//         setYamlContent(text); // Update YAML content as the user edits it
//     };

//     const validateYaml = (yamlText) => {
//         try {
//             yaml.load(yamlText); // Load YAML to validate
//             setYamlError(null); // Clear error if valid
//         } catch (e) {
//             setYamlError(e.message); // Set error message if invalid
//         }
//     };

//     useEffect(() => {
//         fetchConfigFiles();
//     }, []);

//     // return (
//     //     <div>
//     //         {yamlContent ? (
//     //             <YamlEditor
//     //                 text={yamlContent}
//     //                 onChange={handleYamlChange}
//     //                 style={{
//     //                     whiteSpace: "pre-wrap",
//     //                     width: "100%",
//     //                     height: "500px",
//     //                 }}
//     //             />
//     //         ) : (
//     //             <p>Loading YAML content...</p>
//     //         )}
//     //     </div>
//     // );
//     return (
//         <div>
//             {yamlError && <div className="error">{yamlError}</div>}{" "}
//             {/* Display error if present */}
//             {yamlContent ? (
//                 <EditorContent editor={editor} />
//             ) : (
//                 <p>Loading YAML content...</p>
//             )}
//         </div>
//     );
// };

// export default SUTClientConfigFile;
