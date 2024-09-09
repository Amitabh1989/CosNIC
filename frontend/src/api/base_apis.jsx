import axios from "axios";
// import { BASE_URL } from "../uilts/appURLS";
// export const API_BASE_URL = "http://127.0.0.1:8000";
// Update with your actual API base URL

// const BACKEND_BASE_URL = process.env.DJANGO_BACKEND_BASE_URL;
const BACKEND_BASE_URL = "http://127.0.0.1:8000";

// Create an Axios instance with a base URL
export const baseBackendApi = axios.create({
    baseURL: BACKEND_BASE_URL, // Set your base URL here
});

// export const getVenvStatusAPI = async (userId = null, url = null) => {
//     console.log("userId is:", userId);
//     console.log("url is:", url);
//     try {
//         let response;
//         if (url) {
//             response = await baseBackendApi.get(url + "/");
//         } else if (user_id) {
//             var user_id = parseInt(userId);
//             response = await baseBackendApi.get(
//                 `test_ops/venv-status/?user=${user_id}/`
//             );
//         } else {
//             response = await baseBackendApi.get(`test_ops/venv-status/`);
//         }
//         return response.data;
//     } catch (error) {
//         console.error(error);
//     }
// };

export const getVenvStatusAPI = async (userId = null, url = null) => {
    // export const getVenvStatusAPI = async (url = null, userId = null) => {
    try {
        if (url) {
            console.log("Came to URL logic : ", url);
            const response = await baseBackendApi.get(url);
            console.log("Response from URL logic is:", response);
            return response.data;
        }

        // var user_id = parseInt(userId);
        console.log("Came to userId logic : ", userId);
        const response = await baseBackendApi.get(`test_ops/venv-status/`);
        return response.data;
    } catch (error) {
        console.error(error);
    }
};
