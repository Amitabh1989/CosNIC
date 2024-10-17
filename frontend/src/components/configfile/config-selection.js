"use client";
import React from "react";
// import ConfigFileForm from "./UserLogin";
// import SUTClientConfigFile from "@/components/configfile/SUTClientConfigFile_Experiment";
import ConfigFileList from "../tables/ConfigFileList";
// import Link from "next/link";

const ConfigFileSelector = () => {
    return (
        <>
            <div>Select Config File</div>;{/* <SUTClientConfigFile /> */}
            <ConfigFileList />
        </>
    );
};

export default ConfigFileSelector;
