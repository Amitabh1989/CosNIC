"use client";
// import AceEditor from "react-ace";
// import * as jsYAML from "js-yaml"; // YAML parser for validation

// import "ace-builds/src-noconflict/mode-yaml"; // YAML mode
// import "ace-builds/src-noconflict/theme-monokai"; // Dark theme (you can change this to other Ace themes)
// import "ace-builds/src-noconflict/theme-github"; // Dark theme (you can change this to other Ace themes)
// import "ace-builds/src-noconflict/ext-language_tools"; // Enables autocompletion and syntax validation

import React, { useState, useEffect } from "react";
// import { getSutClientYmlConfigFilesListAPI } from "../../api/configFile_apis";
import { getSutClientYmlConfigFilesListAPI } from "@/api/configFile_apis";

import ConfigFileList from "../tables/ConfigFileList";
// import TableWithSearch from "../tables/TableWithSearch";

const SUTClientConfigFile = () => {
    const [yamlContent, setYamlContent] = useState(""); // YAML content
    const [errorMessage, setErrorMessage] = useState(null); // To store YAML error message
    const [configFilesList, setConfigFilesList] = useState([]); // To store YAML error message

    // Get the list and content of YAML config files : DONE
    // Display in table and editor : DONE

    // Fetch YAML config files
    const fetchConfigFiles = async () => {
        try {
            const response = await getSutClientYmlConfigFilesListAPI();
            console.log("Response from API:", response.length);
            // console.log(`Config files all : ${JSON.stringify(response)}`);
            // console.log(`Config files: ${JSON.stringify(response[0])}`);
            // const rawYaml = response[0].content.replace(/\\r\\n/g, "\n"); // Normalize newlines
            // setYamlContent(rawYaml);
            setConfigFilesList(response);
        } catch (error) {
            console.error(error);
            setErrorMessage("Failed to fetch YAML content");
        }
    };

    useEffect(() => {
        fetchConfigFiles();
    }, []);

    return (
        <div>
            {configFilesList ? (
                <div>
                    <ConfigFileList configFilesList={configFilesList} />
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
