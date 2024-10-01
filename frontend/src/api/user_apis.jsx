import baseBackendApi from "./base_api"; // Axios instance with interceptors
import Cookies from "js-cookie";
import apiEndpoints from "./apiEndpoints";

export const loginUserApi = async (credentials) => {
    try {
        // const response = await baseBackendApi.post("api/token/", credentials);
        console.log(
            "Backend base URL is login :",
            process.env.NEXT_PUBLIC_BACKEND_BASE_URL
        );

        console.log("Credentials are:", credentials);
        console.log("API endpoint is:", apiEndpoints.loginUser);
        // const response = await baseBackendApi.post("login/", credentials);
        const response = await baseBackendApi.post(
            apiEndpoints.loginUser,
            credentials
        );
        sessionStorage.setItem("access_token", response.data.access); // Store access token in memory
        Cookies.set("refresh_token", response.data.refresh, {
            secure: true,
            httpOnly: true,
        }); // Secure cookie
        return response;
    } catch (error) {
        console.log("Login failed", error);
        throw error;
    }
};

export const logoutUserApi = async () => {
    sessionStorage.removeItem("access_token");
    Cookies.remove("refresh_token");
};

export const registerUserApi = async (credentials) => {
    try {
        const response = await baseBackendApi.post(
            "/user/register/",
            credentials
        );
        return response.data;
    } catch (error) {
        console.log("Registration failed => ", error.response.data);
        console.log("Registration failed", error);
        throw error;
    }
};

// # https://api.multiavatar.com/
// # https://multiavatar.com/
// """
// let avatarId = 'Binx Bond'
// fetch('https://api.multiavatar.com/'
// +JSON.stringify(avatarId))
//   .then(res => res.text())
//   .then(svg => console.log(svg))
// """
