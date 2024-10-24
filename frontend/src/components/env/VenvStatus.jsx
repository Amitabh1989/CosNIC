"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getVenvStatusAPI_v2 } from "@/api/venv_apis";
import { SortableTable } from "@/components/tables/SortableTable";
import { useSelector, useDispatch } from "react-redux";
// import { setVenvs } from "./slice"; // import the action to store data in Redux
import { setVenvs, fetchVenvs } from "@/reduxToolkit/venvSlice";
import { Button } from "@material-tailwind/react";

const VenvStatusComponent = () => {
    const [error, setError] = useState(null);
    const [rowData, setRowData] = useState([]); // Store row data separately
    const [totalCount, setTotalCount] = useState(0);
    const [prevLink, setPrevLink] = useState(null);
    const [nextLink, setNextLink] = useState(null);
    const dispatch = useDispatch();
    // const venvs = useSelector((state) => state.venv.venvs); // venv is the slice name
    const venvsStore = useSelector((state) => state.venv); // Access the Redux store

    {
        /* 
        // Selector to get the venv state
    const selectVenvState = (state) => state.venv;

    // Memoized selector using reselect
    const selectVenvsStore = createSelector(
        [selectVenvState],
        (venvState) => venvState
    );

    // Use the memoized selector
    const venvsStore = useSelector(selectVenvsStore);
        */
    }

    const columns = useMemo(
        () => [
            "Venv Name",
            "Nickname",
            "Ctrl Pkg Version",
            "Status",
            "Config File",
            "Modified At",
        ],
        []
    ); // Define columns here

    const fetchData = useCallback(
        async (url = null, forceUpdate = false) => {
            console.log("Venvs from redux is:", venvsStore.venvs);

            let offset = 0,
                limit = 10;

            try {
                if (url && !forceUpdate) {
                    const urlParams = new URLSearchParams(new URL(url).search);
                    offset = urlParams.get("offset") || 0;
                    limit = urlParams.get("limit") || 10;
                }

                const pageKey = `${offset}-${limit}`;

                // Dispatch the thunk to fetch data
                const resultAction = await dispatch(
                    fetchVenvs({ pageKey, url, hardRefresh: forceUpdate })
                );
                console.log("Result action from fetchVenvs:", resultAction);

                const result = resultAction.payload; // Access the payload here
                console.log("Result from fetchVenvs:", result);

                // If the data came from the Redux store
                if (result?.fromStore) {
                    console.log("Data from Redux store:", result.data);
                    setRowData(result.data.results); // Set the rows from the Redux store
                    setTotalCount(result.data.count);
                    setNextLink(result.data.next);
                    setPrevLink(result.data.previous);
                } else if (result?.data) {
                    // Set from API response
                    const data = result.data;
                    setTotalCount(data.count);
                    setPrevLink(data.previous);
                    setNextLink(data.next);
                    setRowData(data.results);
                }
            } catch (error) {
                console.error("Error in fetchData:", error);
                setError(error);
            }
        },
        [dispatch, venvsStore]
    );
    // Pagination handler
    // const handlePagination = useCallback(
    //     (url, direction) => {
    //         console.log("handlePagination URL:", url, "direction:", direction);

    //         let offset = 0,
    //             limit = 10;

    //         if (url) {
    //             const urlParams = new URLSearchParams(new URL(url).search);
    //             offset = urlParams.get("offset") || 0;
    //             limit = urlParams.get("limit") || 10;
    //         }

    //         const pageKey = `${offset}-${limit}`;

    //         // Check if the page already exists in the Redux store
    //         if (venvsStore.pages[pageKey]) {
    //             console.log("Page found in Redux store:", pageKey);
    //             setRowData(venvsStore.pages[pageKey].results);
    //             setNextLink(venvsStore.pages[pageKey].next);
    //             setPrevLink(venvsStore.pages[pageKey].previous);
    //         } else {
    //             // Fetch data if not found in the store
    //             fetchData(url);
    //         }
    //     },
    //     [venvsStore, fetchData]
    // );

    const handlePagination = useCallback(
        (url) => {
            if (!url) return;

            let offset = 0,
                limit = 10;

            const urlParams = new URLSearchParams(new URL(url).search);
            offset = urlParams.get("offset") || 0;
            limit = urlParams.get("limit") || 10;
            const pageKey = `${offset}-${limit}`;

            // Check if data is already in the store
            if (venvsStore.pages[pageKey]) {
                setRowData(venvsStore.pages[pageKey].results);
                setNextLink(venvsStore.pages[pageKey].next);
                setPrevLink(venvsStore.pages[pageKey].previous);
                return;
            }

            // If not, fetch new data
            fetchData(url);
        },
        [venvsStore, fetchData]
    );

    // Initial fetch on component mount
    useEffect(() => {
        fetchData();
    }, []);

    if (error) {
        return <div>Error fetching data</div>;
    }

    return (
        <div>
            <h1>Venv Status</h1>

            <SortableTable
                columns={columns}
                data={rowData}
                count={totalCount}
                nextLink={nextLink}
                prevLink={prevLink}
                onNext={() => handlePagination(nextLink, "next")}
                onPrevious={() => handlePagination(prevLink, "prev")}
                refreshData={() => fetchData(null, true)}
            />

            {/* <Button color="blue" onClick={() => fetchData(null, true)}>
                Refresh from backend
            </Button> */}
        </div>
    );
};

export default VenvStatusComponent;

//     return (
//         <div>
//             <h1>Venv Status</h1>
//             {rowData ? (
//                 <>
//                     <SortableTable
//                         columns={columns}
//                         data={rowData}
//                         count={totalCount}
//                         nextLink={nextLink}
//                         prevLink={prevLink}
//                         onNext={() => handlePagination(nextLink, "next")}
//                         onPrevious={() => handlePagination(prevLink, "prev")}
//                     />
//                 </>
//             ) : (
//                 <p>Loading...</p>
//             )}
//             <Button color="blue" onClick={() => fetchData(null, true)}>
//                 Refresh from backend
//             </Button>
//         </div>
//     );
// };

// // Fetch data from API
// const fetchData = async (url = null, forceUpdate = false) => {
//     console.log("Venvs from redux is:", venvsStore.venvs); // Access the venvs array from the store

//     let apiUrl,
//         response,
//         offset = 0,
//         limit = 10,
//         pageKeyFound = false;

//     try {
//         if (url && !forceUpdate) {
//             // Extract offset and limit from URL (use default if absent)
//             const urlParams = new URLSearchParams(new URL(url).search);
//             offset = urlParams.get("offset") || 0;
//             limit = urlParams.get("limit") || 10;

//             const pageKey = `${offset}-${limit}`;

//             // Check if the page is already in Redux store
//             if (venvsStore.pages[pageKey]) {
//                 pageKeyFound = true;
//                 console.log(
//                     "Fetching page from Redux store, no API call needed:",
//                     venvsStore.pages[pageKey]
//                 );

//                 // Check for links, and fallback to API if missing
//                 if (
//                     !venvsStore.pages[pageKey].next ||
//                     !venvsStore.pages[pageKey].previous
//                 ) {
//                     console.log(
//                         "Pagination links missing, fetching from API..."
//                     );
//                     response = await getVenvStatusAPI_v2(null, url);

//                     // Dispatch new data to Redux with updated links
//                     dispatch(
//                         setVenvs({
//                             newVenvs: response.results, // Add results to Redux
//                             next: response.next,
//                             previous: response.previous,
//                             total: response.count,
//                             pageKey: pageKey,
//                         })
//                     );
//                 } else {
//                     console.log(
//                         "Page and links exist in Redux. Loading from store."
//                     );
//                     setRowData(venvsStore.pages[pageKey].results); // Load data from Redux
//                     setNextLink(venvsStore.pages[pageKey].next);
//                     setPrevLink(venvsStore.pages[pageKey].previous);
//                     return;
//                 }
//             }
//         }

//         // Make an API call if no data found in Redux store
//         if (url && !pageKeyFound) {
//             console.log(
//                 "The URL ONLY condition is being invoked : pageKeyFound : ",
//                 pageKeyFound
//             );
//             apiUrl = url; // Use the passed pagination URL if available
//             response = await getVenvStatusAPI_v2(null, url);
//         } else if (!pageKeyFound) {
//             console.log("The URL FIRST condition is being invoked");
//             response = await getVenvStatusAPI_v2(null); // First API call
//         }

//         console.log(
//             "Response from API is after all conditions :",
//             response
//         );

//         const data = response;
//         const pageKey = `${offset}-${limit}`; // Create unique key for this page
//         console.log("Data for venv is from URL:", url, " is:", data);

//         if (!pageKeyFound) {
//             // Dispatch to Redux store, storing both results and pagination links
//             dispatch(
//                 setVenvs({
//                     newVenvs: data.results, // Add results to Redux
//                     next: data.next,
//                     previous: data.previous,
//                     total: data.count,
//                     pageKey: pageKey, // Store pageKey for future lookups
//                 })
//             );
//         }

//         // Process and set data
//         setTotalCount(data.count);
//         setPrevLink(data.previous);
//         setNextLink(data.next);

//         const rows = data.results.map((venv) => ({
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
//     } catch (error) {
//         console.error("Error in fetchData:", error);
//         setError(error);
//     }
// };

// // Handle pagination
// const handlePagination = (url, direction) => {
//     // `url` is either the next or previous link, based on direction
//     console.log(
//         "handlePagination URL is:",
//         url,
//         "   direction is : ",
//         direction
//     );
//     // Determine the offset and limit from the URL
//     let offset = 0,
//         limit = 10;
//     if (url) {
//         const urlParams = new URLSearchParams(new URL(url).search);
//         offset = urlParams.get("offset") || 0;
//         limit = urlParams.get("limit") || 10;
//     }

//     // Construct the page key to check Redux store
//     const pageKey = `${offset}-${limit}`;

//     // Check if the requested page is already in Redux store
//     console.log("Page key is:", pageKey);
//     console.log("Pages in Redux are:", venvsStore.pages);
//     console.log(
//         "Links in Redux are:",
//         venvsStore.nextLink,
//         "   prev link :  ",
//         venvsStore.prevLink
//     );
//     if (venvsStore.pages[pageKey]) {
//         console.log(
//             "Page exists in Redux, no API call needed for pageKey : ",
//             pageKey
//         );
//         const pageData = venvsStore.pages[pageKey];
//         console.log("pageData in Redux are:", pageData);

//         setRowData(venvsStore.pages[pageKey]);

//         // If next or previous links are missing, trigger fetchData to update them
//         if (!pageData.next || !pageData.previous) {
//             console.log("Fetching data to update links");
//             fetchData(url); // Fetch the page using the `url` to update links
//         }
//         // Set the next and previous links from the Redux store
//         setNextLink(pageData.next || null);
//         setPrevLink(pageData.previous || null);
//         return;
//     }

//     if (url) {
//         console.log("Fetching data from URL:", url);
//         fetchData(url); // Fetch the page using the `url`
//     } else if (direction === "next" && !venvsStore.nextLink) {
//         setPrevLink(venvsStore.prevLink); // Ensure previous link is set
//         console.log("No more pages available to fetch.");
//     } else if (direction === "prev" && !venvsStore.prevLink) {
//         setPrevLink(venvsStore.nextLink); // Ensure this gets set correctly
//         console.log("No previous pages available.");
//     }
// };

// useEffect(() => {
//     fetchData();
// }, [venvsStore]);
/**
 * Fetches data either from Redux or API.
 * If forceUpdate is true, it bypasses Redux and fetches fresh data.
 */
// const fetchData = useCallback(
//     async (url = null, forceUpdate = false) => {
//         console.log("Venvs from redux is:", venvsStore.venvs);

//         let apiUrl,
//             response,
//             offset = 0,
//             limit = 10,
//             pageKeyFound = false;

//         try {
//             if (url && !forceUpdate) {
//                 const urlParams = new URLSearchParams(new URL(url).search);
//                 offset = urlParams.get("offset") || 0;
//                 limit = urlParams.get("limit") || 10;

//                 const pageKey = `${offset}-${limit}`;

//                 // Check if the page is in Redux store
//                 if (venvsStore.pages[pageKey]) {
//                     pageKeyFound = true;
//                     console.log(
//                         "Fetching page from Redux store:",
//                         venvsStore.pages[pageKey]
//                     );

//                     setRowData(venvsStore.pages[pageKey].results);
//                     setNextLink(venvsStore.pages[pageKey].next);
//                     setPrevLink(venvsStore.pages[pageKey].previous);

//                     // Check for pagination links and fetch from API if missing
//                     if (
//                         !venvsStore.pages[pageKey].next ||
//                         !venvsStore.pages[pageKey].previous
//                     ) {
//                         console.log(
//                             "Pagination links missing, fetching from API..."
//                         );
//                         response = await getVenvStatusAPI_v2(null, url);
//                         dispatch(
//                             setVenvs({
//                                 newVenvs: response.results,
//                                 next: response.next,
//                                 previous: response.previous,
//                                 total: response.count,
//                                 pageKey: pageKey,
//                             })
//                         );
//                     }
//                     return; // Return early if data is found in Redux
//                 }
//             }

//             // Fallback to API call if data is not in Redux
//             if (!pageKeyFound) {
//                 console.log("Fetching data from API...");
//                 response = await getVenvStatusAPI_v2(null, url);
//                 const data = response;
//                 const pageKey = `${offset}-${limit}`;

//                 dispatch(
//                     setVenvs({
//                         newVenvs: data.results,
//                         next: data.next,
//                         previous: data.previous,
//                         total: data.count,
//                         pageKey: pageKey,
//                     })
//                 );

//                 setTotalCount(data.count);
//                 setPrevLink(data.previous);
//                 setNextLink(data.next);
//                 setRowData(data.results);
//             }
//         } catch (error) {
//             console.error("Error in fetchData:", error);
//             setError(error);
//         }
//     },
//     [dispatch, venvsStore]
// );

// https://refine.dev/blog/react-usememo/#improving-api-responses
// const PaginationComponent = ({ data, currentPage, itemsPerPage }) => {
//     const paginatedData = useMemo(() => {
//         const startIndex = (currentPage - 1) * itemsPerPage;
//         const endIndex = startIndex + itemsPerPage;
//         return data.slice(startIndex, endIndex);
//     }, [currentPage, data, itemsPerPage]);

//     return (
//         <div>
//             {paginatedData.map((item) => (
//                 <div key={item.id}>{item.name}</div>
//             ))}
//         </div>
//     );
// };
