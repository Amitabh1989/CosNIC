"use client";
import React, { useState, useEffect } from "react";
import { getSutClientYmlConfigFilesListAPI } from "../../api/configFile_apis";
import CodeMirror from "@uiw/react-codemirror";

import { oneDark } from "@codemirror/theme-one-dark";
import { yaml } from "@codemirror/lang-yaml";

const SUTClientConfigFile = () => {
    const [yamlContent, setYamlContent] = useState("");

    const fetchConfigFiles = async () => {
        try {
            const response = await getSutClientYmlConfigFilesListAPI();
            console.log(`Config files: ${JSON.stringify(response[0])}`);
            let rawYaml = response[0].content;
            const formattedYaml = rawYaml.replace(/\\r\\n/g, "\n");
            setYamlContent(formattedYaml);
        } catch (error) {
            console.error(error);
        }
    };

    const handleYamlChange = (value) => {
        console.log("Updated YAML:", value);
        setYamlContent(value);
    };

    useEffect(() => {
        fetchConfigFiles();
    }, []);

    // theme={dracula}
    return (
        <div>
            {yamlContent ? (
                <div style={{ height: 500 }}>
                    <CodeMirror
                        value={yamlContent}
                        height="500px"
                        onChange={handleYamlChange}
                        extensions={[yaml()]} // Make sure to invoke yaml() as a function
                    />
                </div>
            ) : (
                <p>Loading YAML content...</p>
            )}
        </div>
    );
};

export default SUTClientConfigFile;
