import axios from "axios";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
console.log("Backend base URL is in baseAPI :", BACKEND_BASE_URL);

// Create an Axios instance with a base URL
export const baseBackendApi = axios.create({
    baseURL: BACKEND_BASE_URL, // Set your base URL here
});

// Utility sleep function (in milliseconds)
// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isValidRedirectUrl(url) {
    // Define allowed paths
    const allowedPaths = ["/user/dashboard", "/profile", "/settings"];
    // Check if URL is within allowed paths or if the root "/"
    return allowedPaths.includes(url) || url === "/";
}

// Intercept request to include access token
baseBackendApi.interceptors.request.use(
    (config) => {
        console.log("Backend base URL is :", baseBackendApi);

        const accessToken = sessionStorage.getItem("access_token");

        // Skip adding the token for login and refresh requests
        if (
            config.url.includes("/login/") ||
            config.url.includes("api/token/refresh/")
        ) {
            return config;
        }

        console.log("Access token is in request interceptors :", accessToken);
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
            console.log("Access token added to request");
        }
        // Sleep for 2 seconds (2000 ms) to allow time for debugging
        // sleep(2000);
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercept response for handling 401 and 403 status codes
baseBackendApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const forbiddenStatusCodes = new Set([401, 403]);
        console.log(
            "Original request in response interceptor is: ",
            originalRequest
        );
        console.log("Error in response interceptors:", error);

        if (
            !error.response ||
            !forbiddenStatusCodes.has(error.response.status)
        ) {
            return Promise.reject(error); // For non 401/403 errors
        }

        // Handle 401 (Unauthorized)
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                console.log(
                    `Since error code is ${error.response.status}, in try block`
                );
                const newAccessToken = await handleTokenRefresh();
                sessionStorage.setItem("access_token", newAccessToken); // Store new access token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return baseBackendApi(originalRequest); // Retry the original request with the new token
            } catch (refreshError) {
                console.log("Token refresh failed", refreshError);
                console.log(
                    "Token refresh failed response was : ",
                    error.response.status
                );
                // Sleep for 2 seconds (2000 ms) to allow time for debugging
                // await sleep(20000);

                // Redirect to login page after storing redirect URL
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }

        // Handle 403 (Forbidden)
        if (error.response.status === 403) {
            console.log("403 Forbidden error, redirecting to login.");
            // redirectToLogin();
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

// Token refresh logic
const handleTokenRefresh = async () => {
    const refreshToken = sessionStorage.getItem("refresh_token");

    if (!refreshToken) {
        console.log("No refresh token available.");
        throw new Error("Refresh token missing");
    }
    console.log(`In handleToken, refreshToken is : ${refreshToken}`);
    try {
        const response = await baseBackendApi.post(
            "api/token/refresh/",
            // { refresh: refreshToken }, // Send the refresh token in the body
            {
                withCredentials: true,
                // headers: {
                //     "Content-Type": "application/json",
                // },
            }
        );
        console.log(`Token refresh response : ${response.status}`);
        sessionStorage.setItem("access_token", response.data.access);
        console.log("Access token stored in the session");
        return response.data.access; // Return the new access token
    } catch (error) {
        console.error("Failed to refresh token", error);
        throw error; // Let it propagate to the interceptor
    }
};

// Redirect to login function
const redirectToLogin = () => {
    const currentUrl = window.location.pathname + window.location.search;
    console.log("Current URL before redirecting to login: ", currentUrl);

    sessionStorage.setItem("redirect_after_login", currentUrl);
    window.location.href = "/user/login"; // Redirect to login page
};

export default baseBackendApi;

// headers: {
//     Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, // If you need to send the access token
// },
