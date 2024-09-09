import baseBackendApi from "./base_api"; // Axios instance with interceptors
import Cookies from "js-cookie";

export const loginUserApi = async (credentials) => {
    try {
        const response = await baseBackendApi.post(
            "/auth/jwt/create/",
            credentials
        );
        sessionStorage.setItem("access_token", response.data.access); // Store access token in memory
        Cookies.set("refresh_token", response.data.refresh, {
            secure: true,
            httpOnly: true,
        }); // Secure cookie
        return response.data;
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
        console.log("Registration failed", error);
        throw error;
    }
};
