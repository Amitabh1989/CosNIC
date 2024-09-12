import { useState, useEffect } from "react";

// export async function getPythonVersions() {
//     let pythonVersions = [];

//     try {
//         const response = await fetch("https://www.python.org/ftp/python/");
//         if (!response.ok) {
//             throw new Error("Failed to fetch Python versions");
//         }
//         console.log("Response from python ftp is : ", response);
//         const data = response.text();
//         const soup = new DOMParser().parseFromString(data, "text/html");
//         const links = soup.querySelectorAll("a");

//         for (const link of links) {
//             if (link.textContent.startsWith("python-")) {
//                 const version = link.textContent.split("-")[1];
//                 if (version.startsWith("3.")) {
//                     pythonVersions.push(version);
//                 }
//             }
//         }

//         return pythonVersions;
//     } catch (error) {
//         console.error("Error fetching Python versions:", error);
//         return [
//             "3.10.0",
//             "3.10.1",
//             "3.10.10",
//             "3.10.11",
//             "3.10.12",
//             "3.10.13",
//             "3.10.14",
//             "3.10.15",
//             "3.10.2",
//             "3.10.3",
//             "3.10.4",
//             "3.10.5",
//             "3.10.6",
//             "3.10.7",
//             "3.10.8",
//             "3.10.9",
//             "3.11.0",
//             "3.11.1",
//             "3.11.10",
//             "3.11.2",
//             "3.11.3",
//             "3.11.4",
//             "3.11.5",
//             "3.11.6",
//             "3.11.7",
//             "3.11.8",
//             "3.11.9",
//             "3.12.0",
//             "3.12.1",
//             "3.12.2",
//             "3.12.3",
//             "3.12.4",
//             "3.12.5",
//             "3.12.6",
//             "3.13.0",
//             "3.14.0",
//         ]; // Return an empty array in case of error
//     }
// }

export function getPythonVersions() {
    // let pythonVersions = [];
    return [
        "3.10.0",
        "3.10.1",
        "3.10.10",
        "3.10.11",
        "3.10.12",
        "3.10.13",
        "3.10.14",
        "3.10.15",
        "3.10.2",
        "3.10.3",
        "3.10.4",
        "3.10.5",
        "3.10.6",
        "3.10.7",
        "3.10.8",
        "3.10.9",
        "3.11.0",
        "3.11.1",
        "3.11.10",
        "3.11.2",
        "3.11.3",
        "3.11.4",
        "3.11.5",
        "3.11.6",
        "3.11.7",
        "3.11.8",
        "3.11.9",
        "3.12.0",
        "3.12.1",
        "3.12.2",
        "3.12.3",
        "3.12.4",
        "3.12.5",
        "3.12.6",
        "3.13.0",
        "3.14.0",
    ]; // Return an empty array in case of error
}
