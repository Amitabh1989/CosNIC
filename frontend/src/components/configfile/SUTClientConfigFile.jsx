"use client";
import React, { useState, useEffect } from "react";
import { getSutClientYmlConfigFilesListAPI } from "../../api/configFile_apis";

import AceEditor from "react-ace";
import * as jsYAML from "js-yaml"; // YAML parser for validation

import "ace-builds/src-noconflict/mode-yaml"; // YAML mode
import "ace-builds/src-noconflict/theme-monokai"; // Dark theme (you can change this to other Ace themes)
import "ace-builds/src-noconflict/theme-github"; // Dark theme (you can change this to other Ace themes)
import "ace-builds/src-noconflict/ext-language_tools"; // Enables autocompletion and syntax validation

import ConfigFileList from "../tables/ConfigFileList";
import TableWithSearch from "../tables/TableWithSearch";

const SUTClientConfigFile = () => {
    const [yamlContent, setYamlContent] = useState(""); // YAML content
    const [errorMessage, setErrorMessage] = useState(null); // To store YAML error message

    // Get the list and content of YAML config files : DONE
    // Display in table and editor : DONE

    // Fetch YAML config files
    const fetchConfigFiles = async () => {
        try {
            const response = await getSutClientYmlConfigFilesListAPI();
            console.log(`Config files all : ${JSON.stringify(response)}`);
            console.log(`Config files: ${JSON.stringify(response[0])}`);
            const rawYaml = response[0].content.replace(/\\r\\n/g, "\n"); // Normalize newlines
            setYamlContent(rawYaml);
        } catch (error) {
            console.error(error);
        }
    };

    // Handle changes in YAML editor
    const handleYamlChange = (newValue) => {
        setYamlContent(newValue);
        try {
            jsYAML.load(newValue); // Validate YAML using js-yaml
            setErrorMessage(null); // Clear error if no issues
        } catch (e) {
            setErrorMessage(`YAML Error: ${e.message}`); // Show YAML errors
        }
    };

    useEffect(() => {
        fetchConfigFiles();
    }, []);

    return (
        <div>
            {yamlContent ? (
                <div>
                    {/* <AceEditor
                        mode="yaml" // YAML mode for syntax highlighting
                        theme="monokai" // Dark theme (choose others like monokai, github, dracula, etc.)
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
                            height: "500px",
                            fontSize: "14px",
                        }} // Editor style
                    /> */}
                    <ConfigFileList />
                    {errorMessage && (
                        <div style={{ color: "red", marginTop: "10px" }}>
                            <strong>{errorMessage}</strong>
                        </div>
                    )}
                </div>
            ) : (
                <p>Loading YAML content...</p>
            )}
        </div>
    );
};

export default SUTClientConfigFile;
