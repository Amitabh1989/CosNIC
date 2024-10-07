import baseBackendApi from "./base_api";
import apiEndpoints from "./apiEndpoints";
import yaml from "js-yaml";

export const getSutClientYmlConfigFilesListAPI = async () => {
    console.log("Getting SUT Client YML config files list");
    try {
        const response = await baseBackendApi.get(
            apiEndpoints.getSutClientYmlConfigFilesList
        );

        // Check the response structure
        console.log("Response from API:", response);

        // If the response is not what you expect, log it or throw an error
        if (!response || !response.data) {
            throw new Error("Unexpected API response");
        }

        return response.data;
    } catch (error) {
        console.error("Error fetching SUT Client YML config files:", error);
        throw error;
    }
};

export const getSutClientYmlConfigFileByIDAPI = async (id) => {
    try {
        const response =
            // await apiEndpoints.getSutClientYmlConfigFileByID.get(id);
            await baseBackendApi.get(
                apiEndpoints.getSutClientYmlConfigFileByID,
                id
            );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/* That part of the code is specifying the headers to be included in the HTTP request
// when saving the SUT Client YML config file. In this case, it is setting the
// "Content-Type" header to "application/json", indicating that the content
// being sent in the request body is in JSON format. This is a common practice
// when sending JSON data to APIs to inform the server about the type of data being sent. */
export const saveSutClientYmlConfigFileAPI = async (id, data) => {
    try {
        const response = await baseBackendApi.patch(
            apiEndpoints.saveSutClientYmlConfigFile(id),
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("API response:", response);
        return response.data;
    } catch (error) {
        console.error("Error saving SUT Client YML config file:", error);
        throw error;
    }
};
