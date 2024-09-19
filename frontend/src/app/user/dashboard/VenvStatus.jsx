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
    // const venvs = useSelector((state) => state.venv.venvs); // venv is the slice name
    const venvsStore = useSelector((state) => state.venv); // Access the Redux store

    const columns = [
        "Venv Name",
        "Nickname",
        "Ctrl Pkg Version",
        "Status",
        "Config File",
        "Modified At",
    ]; // Define columns here

    // const fetchData = async (url = null, forceUpdate = false) => {
    //     console.log("Venvs from redux is : ", venvs);
    //     let apiUrl,
    //         response,
    //         offset = 0,
    //         limit = 10;

    //     // if (!forceUpdate && venvs.length > 0) {
    //     //     // If data exists in Redux, use that
    //     //     console.log("Using cached data from Redux");
    //     //     setRowData(venvs);
    //     //     return;
    //     // }

    //     try {
    //         if (url && !forceUpdate) {
    //             // Extract offset and limit from URL (use default if absent)
    //             const urlParams = new URLSearchParams(new URL(url).search);
    //             offset = urlParams.get("offset") || 0;
    //             limit = urlParams.get("limit") || 10;

    //             // Check if the page (offset) is already in Redux store
    //             const pageKey = `${offset}-${limit}`;
    //             if (venvsStore.pages[pageKey]) {
    //                 console.log(
    //                     "Fetching page from Redux store, no API call needed"
    //                 );
    //                 setRowData(venvsStore.pages[pageKey]); // Load the stored page
    //                 return;
    //             }
    //         } //     apiUrl = url;
    //         //     offset = new URL(url).searchParams.get("offset");
    //         //     console.log("Offset is:", offset);

    //         //     if (venvs.length >= offset) {
    //         //         // If data exists in Redux, use that
    //         //         console.log("Using cached data from Redux");
    //         //         setRowData(venvs);
    //         //         return;
    //         //     }
    //         // }

    //         // Await the API call to get the URL or data
    //         console.log("URL is:", url);
    //         // let apiUrl, response, offset;
    //         // let venvId = null;
    //         if (url) {
    //             apiUrl = url; // Use the passed pagination URL if available
    //             response = await getVenvStatusAPI_v2(null, url);
    //         } else {
    //             response = await getVenvStatusAPI_v2(null); // first api call
    //         }

    //         // Fetch the data from the constructed URL
    //         // const response = await fetch(apiUrl);

    //         const data = response; // Parse the JSON data
    //         const pageKey = `${offset}-${limit}`; // Create unique key for this page
    //         // const data = response.data;
    //         console.log("Data for venv is from URL : ", url, " is : ", data);
    //         // Process the data for the table once venvStatus is available
    //         setTotalCount(data.count);
    //         setPrevLink(data.previous);
    //         setNextLink(data.next);
    //         const apiData = data.results;
    //         const rows = apiData.map((venv) => ({
    //             id: venv.id,
    //             user: venv.user,
    //             status: venv.status,
    //             name: venv.venv_name,
    //             nickname: venv.nickname,
    //             config_file: venv.config_file,
    //             modified_at: venv.modified_at,
    //             python_version: venv.python_version,
    //             ctrl_package_version: venv.ctrl_package_version,
    //         }));
    //         setRowData(rows); // Set the row data for the table
    //         dispatch(
    //             setVenvs({
    //                 newVenvs: data.results, // Add results to Redux
    //                 next: data.next,
    //                 previous: data.previous,
    //                 total: data.count,
    //                 pageKey: pageKey,
    //             })
    //         );
    //         console.log("Row data is:", rows);
    //         console.log("Next URL data is:", data.next);
    //         console.log("Prev URL data is:", data.previous);
    //     } catch (error) {
    //         console.error("Error in useEffect:", error);
    //         setError(error);
    //     }
    // };
    const fetchData = async (url = null, forceUpdate = false) => {
        console.log("Venvs from redux is : ", venvsStore.venvs); // Access the venvs array from the store

        let apiUrl,
            response,
            offset = 0,
            limit = 10;

        try {
            if (url && !forceUpdate) {
                // Extract offset and limit from URL (use default if absent)
                const urlParams = new URLSearchParams(new URL(url).search);
                offset = urlParams.get("offset") || 0;
                limit = urlParams.get("limit") || 10;

                // Check if the page (offset) is already in Redux store
                const pageKey = `${offset}-${limit}`;
                if (venvsStore.pages[pageKey]) {
                    console.log(
                        "Fetching page from Redux store, no API call needed"
                    );
                    setRowData(venvsStore.pages[pageKey]); // Load the stored page
                    return;
                }
            }

            // Make API call if no data found in Redux store
            if (url) {
                apiUrl = url; // Use the passed pagination URL if available
                response = await getVenvStatusAPI_v2(null, url);
            } else {
                response = await getVenvStatusAPI_v2(null); // First API call
            }

            const data = response;
            const pageKey = `${offset}-${limit}`; // Create unique key for this page
            console.log("Data for venv is from URL : ", url, " is : ", data);

            // Process and set data
            setTotalCount(data.count);
            setPrevLink(data.previous);
            setNextLink(data.next);

            const rows = data.results.map((venv) => ({
                id: venv.id,
                user: venv.user,
                status: venv.status,
                name: venv.venv_name,
                nickname: venv.nickname,
                config_file: venv.config_file,
                modified_at: venv.modified_at,
                python_version: venv.python_version,
                ctrl_package_version: venv.ctrl_package_version,
            }));

            setRowData(rows); // Set the row data for the table

            // Dispatch to Redux store
            dispatch(
                setVenvs({
                    newVenvs: data.results, // Add results to Redux
                    next: data.next,
                    previous: data.previous,
                    total: data.count,
                    pageKey: pageKey,
                })
            );
        } catch (error) {
            console.error("Error in fetchData:", error);
            setError(error);
        }
    };

    // Handle pagination
    const handlePagination = (url, direction) => {
        // `url` is either the next or previous link, based on direction
        console.log(
            "handlePagination URL is:",
            url,
            "   drrection is : ",
            direction
        );
        // Determine the offset and limit from the URL
        let offset = 0,
            limit = 10;
        if (url) {
            const urlParams = new URLSearchParams(new URL(url).search);
            offset = urlParams.get("offset") || 0;
            limit = urlParams.get("limit") || 10;
        }

        // Construct the page key to check Redux store
        const pageKey = `${offset}-${limit}`;

        // Check if the requested page is already in Redux store
        console.log("Page key is:", pageKey);
        console.log("Pages in Redux are:", venvsStore.pages);
        if (venvsStore.pages[pageKey]) {
            console.log("Page exists in Redux, no API call needed");
            const pageData = venvsStore.pages[pageKey];

            setRowData(venvsStore.pages[pageKey]);
            // Set the next and previous links from the Redux store
            setNextLink(pageData.next || null);
            setPrevLink(pageData.previous || null);
            return;
        }

        if (url) {
            fetchData(url); // Fetch the page using the `url`
        } else if (direction === "next" && !venvsStore.nextLink) {
            setPrevLink(venvsStore.previous); // Ensure previous link is set
            console.log("No more pages available to fetch.");
        } else if (direction === "prev" && !venvsStore.prevLink) {
            setPrevLink(venvsStore.previous); // Ensure this gets set correctly
            console.log("No previous pages available.");
        }
    };

    useEffect(() => {
        fetchData();
    }, [venvsStore]);

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
                        nextLink={nextLink}
                        prevLink={prevLink}
                        onNext={() => handlePagination(nextLink, "next")}
                        onPrevious={() => handlePagination(prevLink, "prev")}
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

// onNext={() => handlePagination(nextLink)}
// onPrevious={() => handlePagination(prevLink)}
