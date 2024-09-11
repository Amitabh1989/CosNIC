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

function isValidRedirectUrl(url) {
    // Define allowed paths
    const allowedPaths = ["/user/dashboard", "/profile", "/settings"];
    // Check if URL is within allowed paths
    return allowedPaths.includes(url) || url === "/";
}

// You called this URL via POST, but the URL doesn't end in a slash and you have APPEND_SLASH set.
//  Django can't redirect to the slash URL while maintaining POST data.
//  Change your form to point to 127.0.0.1: 8000 / user / register / (note the trailing slash),
//  or set APPEND_SLASH = False in your Django settings.

// Intercept request to include access token
baseBackendApi.interceptors.request.use(
    (config) => {
        const accessToken = sessionStorage.getItem("access_token"); // Store in memory (e.g., sessionStorage)
        console.log("Access token is in request interceptors :", accessToken);
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
        console.log("Error in response interceptors:", error);

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const response = await refreshAccessToken();
                sessionStorage.setItem("access_token", response.data.access); // Store new access token
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return baseBackendApi(originalRequest); // Retry the original request with new token
            } catch (refreshError) {
                console.log("Token refresh failed", refreshError);
                // Store the current URL before redirecting
                sessionStorage.removeItem("redirect_after_login");
                let redirectUrl = isValidRedirectUrl(window.location.pathname);
                console.log("Redirecting URL in baseAPI :", redirectUrl);
                sessionStorage.setItem("redirect_after_login", redirectUrl);
                window.location.href = "/login"; // Redirect to login page
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

// Function to refresh access token
const refreshAccessToken = async () => {
    return baseBackendApi.post(
        "api/token/refresh/",
        {},
        {
            withCredentials: true, // Allows sending cookies (refresh token)
        }
    );
};

export default baseBackendApi;
