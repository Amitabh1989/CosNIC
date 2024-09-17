"use client";
import React, { Component, useEffect, useState } from "react";
import { getVenvStatusAPI_v2 } from "@/api/venv_apis";
import { SortableTable } from "@/components/tables/SortableTable";
import { useSelector, useDispatch } from "react-redux";
// import { setVenvs } from "./slice"; // import the action to store data in Redux
import { setVenvs } from "@/reduxToolkit/slice";
import { Button } from "@material-tailwind/react";

// import { Tab } from "@material-tailwind/react";
// import VenvCRUDForm from "./VenvCRUDForm";

const VenvStatusComponent = () => {
    const [error, setError] = useState(null);
    const [rowData, setRowData] = useState([]); // Store row data separately
    const [totalCount, setTotalCount] = useState(0);
    const [prevLink, setPrevLink] = useState(null);
    const [nextLink, setNextLink] = useState(null);
    const dispatch = useDispatch();
    const venvs = useSelector((state) => state.venv.venvs); // venv is the slice name

    const columns = [
        "Venv Name",
        "Nickname",
        "Ctrl Pkg Version",
        "Status",
        "Config File",
        "Modified At",
    ]; // Define columns here

    const fetchData = async (url = null, forceUpdate = false) => {
        console.log("Venvs from redux is : ", venvs);
        if (!forceUpdate && venvs.length > 0) {
            // If data exists in Redux, use that
            console.log("Using cached data from Redux");
            setRowData(venvs);
            return;
        }

        try {
            // // Await the API call to get the URL or data
            console.log("URL is:", url);
            let apiUrl;
            let response;
            let venvId = null;
            if (url) {
                apiUrl = url; // Use the passed pagination URL if available
                response = await getVenvStatusAPI_v2(null, url);
            } else {
                response = await getVenvStatusAPI_v2(venvId);
            }

            // Fetch the data from the constructed URL
            // const response = await fetch(apiUrl);

            const data = response; // Parse the JSON data
            // const data = response.data;
            console.log("Data for venv is from URL : ", url, " is : ", data);
            // Process the data for the table once venvStatus is available
            setTotalCount(data.count);
            setPrevLink(data.previous);
            setNextLink(data.next);
            const apiData = data.results;
            const rows = apiData.map((venv) => ({
                id: venv.id,
                name: venv.venv_name,
                nickname: venv.nickname,
                ctrl_package_version: venv.ctrl_package_version,
                status: venv.status,
                user: venv.user,
                config_file: venv.config_file,
                modified_at: venv.modified_at,
                python_version: venv.python_version,
            }));
            setRowData(rows); // Set the row data for the table
            dispatch(setVenvs(rows)); // Store the fetched data in Redux
            console.log("Row data is:", rows);
            console.log("Next URL data is:", data.next);
            console.log("Prev URL data is:", data.previous);
        } catch (error) {
            console.error("Error in useEffect:", error);
            setError(error);
        }
    };

    // Handle pagination
    const handlePagination = async (url) => {
        console.log("handlePagination URL is:", url);
        if (url) {
            await fetchData(url);
        }
    };

    useEffect(() => {
        fetchData();
    }, [venvs]);

    if (error) {
        return <div>Error fetching data</div>;
    }

    return (
        <div>
            <h1>Venv Status</h1>
            {/* <pre>{JSON.stringify(rowData, null, 2)}</pre> */}
            {rowData ? (
                <>
                    <SortableTable
                        columns={columns}
                        data={rowData}
                        count={totalCount}
                        next={nextLink}
                        previous={prevLink}
                        onNext={() => handlePagination(nextLink)}
                        onPrevious={() => handlePagination(prevLink)}
                    />
                </>
            ) : (
                <p>Loading...</p>
            )}
            <Button color="blue" onClick={() => fetchData(null, true)}>
                Refresh from backend
            </Button>
        </div>
    );
};

export default VenvStatusComponent;
