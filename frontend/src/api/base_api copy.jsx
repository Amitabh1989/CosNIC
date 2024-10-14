import axios from "axios";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
console.log("Backend base URL is in baseAPI :", BACKEND_BASE_URL);

// You called this URL via POST, but the URL doesn't end in a slash and you have APPEND_SLASH set.
//  Django can't redirect to the slash URL while maintaining POST data.
//  Change your form to point to 127.0.0.1: 8000 / user / register / (note the trailing slash),
//  or set APPEND_SLASH = False in your Django settings.

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

// Intercept request to include access token
baseBackendApi.interceptors.request.use(
    (config) => {
        console.log("Backend base URL is :", baseBackendApi);

        const accessToken = sessionStorage.getItem("access_token");
        const refreshToken = sessionStorage.getItem("refresh_token");

        // Check if the request URL is for login or refresh token
        if (
            config.url.includes("/login") ||
            config.url.includes("/token/refresh")
        ) {
            // Skip adding the token for login and refresh requests
            return config;
        }

        console.log("Access token is in request interceptors :", accessToken);
        console.log("Refresh token is in request interceptors :", refreshToken);
        console.log(`Config URL is : ${config.url}`);

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
        const forbiddenStatusCodes = new Set([401, 403]);
        console.log(
            "Original request in response interceptor is : ",
            originalRequest
        );
        console.log("Error in response interceptors:", error);

        // Check for 401/403 status codes and retry logic
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log(
                `Response interceptor 1st if : ${JSON.stringify(originalRequest)}`
            );
            originalRequest._retry = true;
            try {
                console.log("Going for token refresh");
                const response = await refreshAccessToken();
                console.log("Token refresh done");
                sessionStorage.setItem("access_token", response.data.access); // Store new access token
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                console.log(
                    `Response interceptor added access token and retrying`
                );
                return baseBackendApi(originalRequest); // Retry the original request with new token
            } catch (refreshError) {
                console.log("Token refresh failed", refreshError);
                redirectToLogin(); // Redirect to login if token refresh fails
                // Store the current URL before redirecting
                sessionStorage.removeItem("redirect_after_login");
                // Store the current URL before redirecting
                const redirectUrl =
                    window.location.pathname + window.location.search;
                // let redirectUrl = isValidRedirectUrl(window.location.pathname);
                console.log("Redirecting URL in baseAPI :", redirectUrl);
                sessionStorage.setItem("redirect_after_login", redirectUrl);
                window.location.href = "/user/login"; // Redirect to login page
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

const refreshAccessToken = async () => {
    const refreshToken = sessionStorage.getItem("refresh_token");

    if (!refreshToken) {
        console.log("No refresh token available.");
        throw new Error("Refresh token missing");
    }

    try {
        const response = await baseBackendApi.post(
            "api/token/refresh/",
            { refresh: refreshToken }, // Send the refresh token in the body
            {
                withCredentials: false, // Not using cookies, since tokens are stored in sessionStorage
            }
        );
        sessionStorage.setItem("access_token", response.data.access);
        return response.data.access;
    } catch (error) {
        console.error("Failed to refresh token", error);
        throw error; // Let it propagate to the interceptor
    }
};

// Redirect to login function
const redirectToLogin = () => {
    sessionStorage.removeItem("redirect_after_login");
    let redirectUrl = isValidRedirectUrl(window.location.pathname);
    console.log("Redirecting URL in baseAPI :", redirectUrl);
    sessionStorage.setItem("redirect_after_login", redirectUrl);
    window.location.href = "/user/login"; // Redirect to login page
};

export default baseBackendApi;

// } else if (error.response.status === 403) {
//     // Handle 403 specifically (e.g., show an error message, log out the user, etc.)
//     console.error(
//         "Access denied: You do not have permission to perform this action."
//     );
//     console.log(
//         `Response interceptor else condition 403 : ${originalRequest}`
//     );
//     sessionStorage.removeItem("redirect_after_login");
//     let redirectUrl = isValidRedirectUrl(window.location.pathname);
//     console.log("Redirecting URL in baseAPI :", redirectUrl);
//     sessionStorage.setItem("redirect_after_login", redirectUrl);
//     window.location.href = "/user/login"; // Redirect to login page
//     // Optionally redirect or display a specific error message to the user
//     return Promise.reject(error); // You may choose to reject or handle differently
// }
