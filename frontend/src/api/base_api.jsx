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

// Intercept request to include access token
baseBackendApi.interceptors.request.use(
    (config) => {
        const accessToken = sessionStorage.getItem("access_token"); // Store in memory (e.g., sessionStorage)
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercept response for handling 401 and refreshing token
baseBackendApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        // If there's an error: If something goes wrong, like we don’t have permission, this part kicks in.
        // It's an async function because it might need to wait for something to finish (like getting a new token).
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const response = await refreshAccessToken();
                sessionStorage.setItem("access_token", response.data.access); // Store new access token
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return baseBackendApi(originalRequest); // Retry the original request with new token
            } catch (refreshError) {
                console.log("Token refresh failed", refreshError);
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

// Function to refresh access token
const refreshAccessToken = async () => {
    return baseBackendApi.post(
        "/auth/jwt/refresh/",
        {},
        {
            withCredentials: true, // Allows sending cookies (refresh token)
        }
    );
};

export default baseBackendApi;

// export const getVenvStatusAPI = async (userId = null, url = null) => {
//     // export const getVenvStatusAPI = async (url = null, userId = null) => {
//     try {
//         if (url) {
//             console.log("Came to URL logic : ", url);
//             const response = await baseBackendApi.get(url);
//             console.log("Response from URL logic is:", response);
//             return response.data;
//         }

//         // var user_id = parseInt(userId);
//         console.log("Came to userId logic : ", userId);
//         // const response = await baseBackendApi.get(`test_ops/venv-status/`);
//         const response = await baseBackendApi.get(`test_ops/user/venvs`);
//         return response.data;
//     } catch (error) {
//         console.error(error);
//     }
// };
