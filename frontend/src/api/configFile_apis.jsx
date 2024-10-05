import baseBackendApi from "./base_api";
import apiEndpoints from "./apiEndpoints";

export const getSutClientYmlConfigFilesListAPI = async () => {
    try {
        const response =
            // await apiEndpoints.getSutClientYmlConfigFilesList.get();
            await baseBackendApi.get(
                apiEndpoints.getSutClientYmlConfigFilesList
            );
        return response.data;
    } catch (error) {
        console.error(error);
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
