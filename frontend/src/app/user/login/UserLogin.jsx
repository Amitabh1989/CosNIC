"use client";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Input,
    Button,
    Typography,
    Spinner,
} from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import { loginUserApi } from "@/api/user_apis";
import { useRouter } from "next/navigation";

export default function UserLoginForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState(""); // Track form errors
    const [loading, setLoading] = useState(false);
    const router = useRouter(); // Use Next.js built-in router hook

    // Handle form data change
    const handleFormChange = (e) => {
        e.preventDefault();
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setError(""); // Clear error when user is typing
    };

    // Form submission
    const handleSubmit = async (e) => {
        setError(""); // Clear error when user is submitting form
        e.preventDefault();

        // Check if both username and password are provided
        if (!formData.email || !formData.password) {
            setError("Both username and password are required");
            return;
        }

        setLoading(true);

        try {
            const response = await loginUserApi(formData);
            console.log("Login response is:", response);
            // console.log("Login response data is:", response.data);
            console.log("Login response status is:", response.status);

            if (response.status === 200) {
                // alert("Login successful!");
                // Redirect to dashboard
                // Check if there's a redirect URL stored
                const { access, refresh } = response.data; // Adjust this based on your API response format
                sessionStorage.setItem("access_token", access); // Store the access token
                sessionStorage.setItem("refresh_token", refresh); // Store the refresh token
                try {
                    // Get the stored redirect URL
                    let redirectUrl =
                        sessionStorage.getItem("redirect_after_login") ||
                        "/user/dashboard";
                    sessionStorage.removeItem("redirect_after_login"); // Clear redirect URL after use
                    console.log(
                        "Redirecting to from login component :",
                        redirectUrl
                    );
                    // Define disallowed URLs
                    const disallowedPaths = ["/login", "/logout", "/register"];

                    // Check if the redirect URL is disallowed
                    if (disallowedPaths.includes(redirectUrl)) {
                        redirectUrl = "/user/dashboard"; // Default to home page or another valid URL
                    }
                    console.log(
                        "Redirecting URL just before actual redirect :",
                        redirectUrl
                    );
                    router.push(redirectUrl); // Redirect to the valid URL
                } catch (err) {
                    console.log("Error redirecting after login:", err);
                    router.push("/user/dashboard");
                }
            } else {
                setError(response.message || "Something went wrong");
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || "Failed to login");
            } else {
                setError("Failed to login: " + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-grow w-1/2 items-center justify-center bg-gray-100 h-screen">
            <Card className="absolute shadow-lg w-1/4 items-center h-1/2">
                {/* Card Header */}
                <CardHeader
                    variant="solid"
                    color="gray"
                    className="w-full mb-4 grid h-24 place-items-center shadow-lg min-w-[24rem]"
                >
                    <Typography variant="h1" color="white" className="p-4">
                        Cos-NIC
                    </Typography>
                    <Typography variant="h4" color="white" className="pb-2">
                        Welcome back
                    </Typography>
                </CardHeader>

                {/* Card body */}
                <CardBody className="flex flex-col gap-4 w-full h-full">
                    <Typography variant="h4" color="blue-gray">
                        Login to your account
                    </Typography>
                    {error && (
                        <Typography color="red" className="text-sm">
                            {error}
                        </Typography>
                    )}
                    <form
                        className="mt-6 mb-2 min-w-[24rem] w-full sm:w-auto max-w-screen-lg"
                        onSubmit={handleSubmit}
                    >
                        <div className="flex flex-col gap-4 h-full">
                            <div className="mb-1 flex flex-col gap-6">
                                <Typography
                                    variant="h6"
                                    color="blue-gray"
                                    className="-mb-3 mt-4"
                                >
                                    Your Email
                                </Typography>
                                <Input
                                    size="lg"
                                    placeholder="name@mail.com"
                                    className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    name="email"
                                    labelProps={{
                                        className:
                                            "before:content-none after:content-none",
                                    }}
                                />
                                <Typography
                                    variant="h6"
                                    color="blue-gray"
                                    className="-mb-3 mt-4"
                                >
                                    Password
                                </Typography>
                                <Input
                                    type="password"
                                    size="lg"
                                    placeholder="********"
                                    className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                                    onChange={handleFormChange}
                                    value={formData.password}
                                    name="password"
                                    labelProps={{
                                        className:
                                            "before:content-none after:content-none",
                                    }}
                                />
                            </div>
                            <div className="mt-10">
                                <Button
                                    className="flex items-center justify-center w-full !pt-0 !pb-0"
                                    fullWidth
                                    type="submit"
                                >
                                    {loading ? (
                                        <Spinner className="h-4 w-4" />
                                    ) : (
                                        "Sign in"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardBody>

                {/* Card Footer */}
                <CardFooter className="pt-0">
                    <Typography
                        variant="small"
                        className="mt-6 flex justify-center"
                    >
                        Don't have an account?{" "}
                        <Typography
                            as="a"
                            variant="small"
                            color="blue-gray"
                            className="ml-1 font-bold"
                        >
                            Create account
                        </Typography>
                    </Typography>
                </CardFooter>
            </Card>
        </div>
    );
}
