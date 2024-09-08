"use client";
import React, { Component, useEffect, useState } from "react";
import { getVenvStatusAPI } from "@/api/base_apis";
import { CustomTable, SortableTable } from "@/components/tables/SortableTable";
// import { Tab } from "@material-tailwind/react";

const VenvStatusComponent = () => {
    // const [venvStatus, setVenvStatus] = useState(null); // Renamed to avoid conflict with API function
    const [error, setError] = useState(null);
    const [rowData, setRowData] = useState([]); // Store row data separately
    const columns = [
        "Venv Name",
        "Ctrl Pkg Version",
        "User",
        "Nickname",
        "Status",
        "Test Cases",
    ]; // Define columns here

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getVenvStatusAPI(1); // Replace `1` with dynamic userId if needed
                console.log("Data for venv is:", data);
                // Process the data for the table once venvStatus is available

                // const user = data.user;
                // const venvs = data.venvs;
                const rows = data.map((venv) => ({
                    name: venv.venv_name,
                    status: venv.status,
                    user: venv.user,
                    num_tests: venv.num_test_cases,
                    ctrl_pkg_version: venv.ctrl_pkg_version,
                    nickname: venv.nickname,
                }));
                setRowData(rows); // Set the row data for the table
                // setVenvStatus(venvs);
                console.log("Row data is:", rows);
                // console.log("Venv status is:", venvStatus);
                // console.log("User is:", user);
                // console.log("Venvs are:", venvs);
            } catch (error) {
                console.error("Error in useEffect:", error);
                setError(error);
            }
        }
        fetchData();
    }, []);

    if (error) {
        return <div>Error fetching data</div>;
    }

    return (
        <div>
            <h1>Venv Status</h1>
            {/* <pre>{JSON.stringify(rowData, null, 2)}</pre> */}
            {rowData ? (
                // <pre>{JSON.stringify(venvStatus, null, 2)}</pre>
                <>
                    {/* <CustomTable columns={columns} data={rowData} /> */}
                    <SortableTable columns={columns} data={rowData} />
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default VenvStatusComponent;
