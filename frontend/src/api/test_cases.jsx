import baseBackendApi from "./base_api"; // Axios instance with interceptors
import Cookies from "js-cookie";
import apiEndpoints from "./apiEndpoints";

export const getTestCasesApi = async () => {
    try {
        const response = await apiEndpoints.getTestCases();
        return response; // Return the response for further processing
    } catch (error) {
        console.error("Error fetching test cases:", error);
        throw error; // Re-throw the error for handling in the calling code
    }
};

export const getTestCaseByIDApi = async ({ id }) => {
    try {
        const response = await apiEndpoints.getTestCaseByID(id);
        return response; // Return the response for further processing
    } catch (error) {
        console.error("Error fetching test case : ", id, " : ", error);
        throw error; // Re-throw the error for handling in the calling code
    }
};
