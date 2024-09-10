"use client";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Input,
    Checkbox,
    Button,
    Typography,
    Spinner,
} from "@material-tailwind/react";
import React, { useState, useEffect } from "react";
import { registerUserApi } from "@/api/user_apis";

export default function UserRegistrationForm() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        password2: "",
    });
    const [error, setError] = useState(""); // Track password match errors
    const [loading, setLoading] = useState(false);

    // Handle form data change immediately
    const handleFormChange = (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        console.log("Form data is:", formData);
    };

    // Debounce password match check using useEffect
    useEffect(() => {
        const handler = setTimeout(() => {
            if (formData.password && formData.password2) {
                if (formData.password !== formData.password2) {
                    setError("Passwords do not match");
                } else {
                    setError("");
                }
            }
        }, 300); // 300ms delay

        return () => {
            clearTimeout(handler); // Cleanup
        };
    }, [formData.password, formData.password2]);

    // Form submission
    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        // Check for password match before submitting
        if (formData.password !== formData.password2) {
            setError("Passwords do not match");
            return;
        }
        // Remove password2 from formData
        const formDataToSend = { ...formData };
        delete formDataToSend.password2;
        try {
            const response = await registerUserApi(formDataToSend);

            if (response.status === 200) {
                // Handle successful registration
                alert("Registration successful!");
            } else {
                const data = await response.json();
                setError(data.message || "Something went wrong");
            }
        } catch (err) {
            // Check if error.response is available
            if (err.response) {
                // Extract and display the message from the response
                console.error("Error response:", err.response.data);
                setError(err.response.data.message || "Failed to register");
            } else {
                // Fallback if error.response is not available
                console.error("Error message:", err.message);
                setError("Failed to register: " + err.message);
            }
        } finally {
            // Stop loading
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="w-96">
                {/* Card header */}
                <CardHeader
                    variant="gradient"
                    color="gray"
                    className="mb-4 grid h-20 place-items-center w-96"
                >
                    <Typography variant="h1" color="white" className="p-6">
                        Cos-NIC
                    </Typography>
                    <Typography variant="h4" color="white" className="p-4">
                        Register for Cosmos of the NIC
                    </Typography>
                </CardHeader>

                {/* Card body */}
                <CardBody className="flex flex-col gap-4">
                    <Typography variant="h4" color="blue-gray">
                        Sign Up for Cosmos of NIC World!
                    </Typography>
                    <Typography color="gray" className="mt-1 font-normal">
                        Nice to meet you! Enter your details to register.
                    </Typography>
                    <form
                        className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96"
                        onSubmit={handleSubmit}
                    >
                        <div className="mb-1 flex flex-col gap-6">
                            <Typography
                                variant="h6"
                                color="blue-gray"
                                className="-mb-3 mt-4"
                            >
                                Your Name
                            </Typography>
                            <Input
                                size="lg"
                                placeholder="name@mail.com"
                                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                                onChange={handleFormChange}
                                value={formData.username}
                                name="username" // Add name for form data tracking
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
                            {error && (
                                <Typography color="red" className="text-sm">
                                    {error}
                                </Typography>
                            )}
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
                            <Typography
                                variant="h6"
                                color="blue-gray"
                                className="-mb-3 mt-4"
                            >
                                Confirm Password
                            </Typography>
                            <Input
                                type="password"
                                size="lg"
                                placeholder="********"
                                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                                onChange={handleFormChange}
                                value={formData.password2}
                                name="password2"
                                labelProps={{
                                    className:
                                        "before:content-none after:content-none",
                                }}
                            />
                        </div>
                        {/* {error && (
                            <Typography color="red" className="text-sm">
                                {error}
                            </Typography>
                        )} */}
                        <Checkbox
                            label={
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="flex items-center font-normal"
                                >
                                    I agree to the Terms of Service and Privacy
                                </Typography>
                            }
                            containerProps={{ className: "-ml-2.5" }}
                        />

                        <Button
                            className="mt-6 flex items-center justify-center w-full"
                            fullWidth
                            type="submit"
                        >
                            {loading ? (
                                <Spinner className="h-4 w-4" />
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                    </form>
                </CardBody>

                {/* Card footer */}
                <CardFooter className="pt-0">
                    <Typography
                        variant="small"
                        className="mt-6 flex justify-center"
                    >
                        Already have an account?{" "}
                        <Typography
                            as="a"
                            variant="small"
                            color="blue-gray"
                            className="ml-1 font-bold"
                        >
                            Sign in
                        </Typography>
                    </Typography>
                </CardFooter>
            </Card>
        </div>
    );
}
