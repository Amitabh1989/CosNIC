import baseBackendApi from "./base_api";
import apiEndpoints from "./apiEndpoints";

export const getVenvStatusAPI = async (userId = null, url = null) => {
    // export const getVenvStatusAPI = async (url = null, userId = null) => {
    try {
        if (url) {
            console.log("Came to URL logic : ", url);
            // const response = await baseBackendApi.get(url);
            const response = await baseBackendApi.get(url);
            console.log("Response from URL logic is:", response);
            return response.data;
        }

        // var user_id = parseInt(userId);
        console.log("Came to userId logic : ", userId);
        // const response = await baseBackendApi.get(`test_ops/venv-status/`);
        const response = await baseBackendApi.get(`test_ops/user/venvs`);
        return response.data;
    } catch (error) {
        console.error(error);
    }
};

export const getVenvStatusAPI_v2 = async (venvId = null, url = null) => {
    // export const getVenvStatusAPI = async (url = null, userId = null) => {
    try {
        if (url) {
            console.log("Came to URL logic : ", url);
            const response = await baseBackendApi.get(url);
            console.log("Response from URL logic is:", response);
            return response.data;
        }

        if (venvId) {
            console.log("Came to venvID logic : ", venvId);
            const response = await baseBackendApi.get(
                `test_ops/user/venvs/${venvId}/`
            );
            console.log("Response from venvID logic is:", response);
            return response.data;
        }

        if (!venvId && !url) {
            // List of all Venvs has been asked
            const response = await baseBackendApi.get(`test_ops/user/venvs/`);
            return response.data;
        }
        throw new Error("Venv ID is required");
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getCtrlRepoVersionsAPI = async () => {
    try {
        const response = await baseBackendApi.get(
            `test_ops/ctrl_repo/repo_versions/`
        );
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};
