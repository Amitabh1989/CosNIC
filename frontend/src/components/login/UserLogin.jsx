// "use client";
// import {
//     Card,
//     CardHeader,
//     CardBody,
//     CardFooter,
//     Input,
//     Button,
//     Typography,
//     Spinner,
// } from "@material-tailwind/react";
// import React, { useEffect, useState } from "react";
// import { loginUserApi } from "@/api/user_apis";
// import { useRouter } from "next/navigation";

// import { motion, AnimatePresence } from "framer-motion";
// import { Switch } from "@headlessui/react";
// // import { Stepper, Step } from "@material-tailwind/react";

// export default function UserLoginForm() {
//     const [isLogin, setIsLogin] = useState(true);
//     const [darkMode, setDarkMode] = useState(false);
//     const [formData, setFormData] = useState({
//         email: "",
//         password: "",
//     });
//     const [error, setError] = useState(""); // Track form errors
//     const [loading, setLoading] = useState(false);
//     const router = useRouter(); // Use Next.js built-in router hook

//     // Handle form data change
//     const handleFormChange = (e) => {
//         e.preventDefault();
//         const { name, value } = e.target;

//         setFormData((prevData) => ({
//             ...prevData,
//             [name]: value,
//         }));
//         setError(""); // Clear error when user is typing
//     };

//     // Form submission
//     const handleSubmit = async (e) => {
//         setError(""); // Clear error when user is submitting form
//         e.preventDefault();

//         // Check if both username and password are provided
//         if (!formData.email || !formData.password) {
//             setError("Both username and password are required");
//             return;
//         }

//         setLoading(true);

//         try {
//             const response = await loginUserApi(formData);
//             console.log("Login response is:", response);
//             console.log("Login response status is:", response.status);

//             if (response.status === 200) {
//                 const { access, refresh } = response.data; // Adjust based on your API response format
//                 sessionStorage.setItem("access_token", access); // Store the access token
//                 sessionStorage.setItem("refresh_token", refresh); // Store the refresh token

//                 // Check if there's a redirect URL stored
//                 let redirectUrl =
//                     sessionStorage.getItem("redirect_after_login") ||
//                     "/user/dashboard";
//                 sessionStorage.removeItem("redirect_after_login"); // Clear redirect URL after use

//                 console.log(
//                     "Redirecting to from login component:",
//                     redirectUrl
//                 );

//                 // Define disallowed URLs
//                 const disallowedPaths = ["/login", "/logout", "/register"];

//                 // Check if the redirect URL is disallowed
//                 if (
//                     disallowedPaths.some((path) => redirectUrl.includes(path))
//                 ) {
//                     redirectUrl = "/user/dashboard"; // Default to dashboard or another valid page
//                 }

//                 console.log(
//                     "Redirecting URL just before actual redirect:",
//                     redirectUrl
//                 );
//                 router.push(redirectUrl); // Redirect to the valid URL
//             } else {
//                 setError(response.message || "Something went wrong");
//             }
//         } catch (err) {
//             if (err.response) {
//                 setError(err.response.data.message || "Failed to login");
//             } else {
//                 setError("Failed to login: " + err.message);
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSwitch = () => setIsLogin(!isLogin);

//     const formVariants = {
//         hidden: { opacity: 0, x: "100vw" },
//         visible: {
//             opacity: 1,
//             x: 0,
//             transition: { type: "spring", stiffness: 60 },
//         },
//         exit: {
//             opacity: 0,
//             x: "100vw",
//             transition: { type: "spring", stiffness: 60 },
//         },
//     };

//     const cosnicTextVariants = {
//         hidden: { opacity: 0, scale: 0.8 },
//         visible: {
//             opacity: 1,
//             scale: 1,
//             transition: { duration: 2, ease: "easeInOut" },
//         },
//     };

//     const backgroundVariants = {
//         animate: {
//             backgroundColor: [
//                 "#ffffff",
//                 "#dddddd",
//                 "#bbbbbb",
//                 "#999999",
//                 "#666666",
//                 "#333333",
//                 "#000000",
//             ],
//             transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
//         },
//     };

//     return (
//         <div
//             className={`h-screen flex flex-col items-center justify-center transition-all duration-500 overflow-hidden ${
//                 darkMode ? "bg-gray-900" : "bg-white"
//             }`}
//         >
//             <div className="w-full h-full grid grid-cols-3 overflow-hidden">
//                 {/* Left 2/3: COSNIC Animation */}
//                 <motion.div
//                     className={`col-span-2 flex items-center justify-center p-8 transition-all duration-1000 ${
//                         darkMode ? "bg-gray-800" : "bg-gray-300"
//                     }`}
//                     variants={backgroundVariants}
//                     animate="animate"
//                 >
//                     <motion.div
//                         className="text-9xl font-bold text-black"
//                         variants={cosnicTextVariants}
//                         initial="hidden"
//                         animate="visible"
//                         style={{ fontFamily: "system-ui, sans-serif" }} // Rounded and smooth native font
//                     >
//                         CosN<span className="text-white">i</span>C
//                         <Typography className="text-sm font-poppins font-bold pl-5 -mt-2 place-content-end">
//                             the cosmos of nic
//                         </Typography>
//                     </motion.div>
//                 </motion.div>

//                 {/* Right 1/3: Login/Register Form */}
//                 <div
//                     className={`col-span-1 flex flex-col justify-center items-center transition-all duration-500 ${
//                         darkMode ? "bg-gray-900" : "bg-white"
//                     } p-8 rounded-lg shadow-lg`}
//                 >
//                     <div className="flex justify-between mb-6 w-full">
//                         <h2 className="text-2xl font-bold text-black">
//                             {isLogin ? "Login" : "Register"} to Cos-NIC
//                             {error && (
//                                 <Typography color="red" className="text-sm">
//                                     {error}
//                                 </Typography>
//                             )}
//                         </h2>
//                         <Switch
//                             checked={darkMode}
//                             onChange={setDarkMode}
//                             className={`${
//                                 darkMode ? "bg-gray-600" : "bg-gray-200"
//                             } relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 ease-in-out`}
//                         >
//                             <span
//                                 className={`${
//                                     darkMode ? "translate-x-6" : "translate-x-1"
//                                 } inline-block h-4 w-4 transform bg-white rounded-full transition`}
//                             />
//                         </Switch>
//                     </div>

//                     <AnimatePresence mode="wait">
//                         {isLogin ? (
//                             <motion.form
//                                 key="loginForm"
//                                 variants={formVariants}
//                                 initial="hidden"
//                                 animate="visible"
//                                 exit="exit"
//                                 className="space-y-4 w-full"
//                                 onSubmit={handleSubmit}
//                             >
//                                 <Input
//                                     size="lg"
//                                     placeholder="name@mail.com"
//                                     className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
//                                     value={formData.email}
//                                     onChange={handleFormChange}
//                                     name="email"
//                                     labelProps={{
//                                         className:
//                                             "before:content-none after:content-none",
//                                     }}
//                                 />
//                                 <Input
//                                     type="password"
//                                     size="lg"
//                                     placeholder="********"
//                                     className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
//                                     onChange={handleFormChange}
//                                     value={formData.password}
//                                     name="password"
//                                     labelProps={{
//                                         className:
//                                             "before:content-none after:content-none",
//                                     }}
//                                 />

//                                 <Button
//                                     className="items-center w-full justify-center rounded-lg font-poppins hover:animate-bounce"
//                                     fullWidth
//                                     size="lg"
//                                     type="submit"
//                                     loading={loading ? true : false}
//                                 >
//                                     Sign in
//                                 </Button>
//                             </motion.form>
//                         ) : (
//                             <motion.form
//                                 key="registerForm"
//                                 variants={formVariants}
//                                 initial="hidden"
//                                 animate="visible"
//                                 exit="exit"
//                                 className="space-y-4 w-full"
//                             >
//                                 <Input
//                                     size="lg"
//                                     placeholder="name@mail.com"
//                                     className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
//                                     value={formData.email}
//                                     onChange={handleFormChange}
//                                     name="email"
//                                     labelProps={{
//                                         className:
//                                             "before:content-none after:content-none",
//                                     }}
//                                 />
//                                 <Input
//                                     type="password"
//                                     size="lg"
//                                     placeholder="********"
//                                     className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
//                                     onChange={handleFormChange}
//                                     value={formData.password}
//                                     name="password"
//                                     labelProps={{
//                                         className:
//                                             "before:content-none after:content-none",
//                                     }}
//                                 />
//                                 <Input
//                                     type="password"
//                                     size="lg"
//                                     placeholder="********"
//                                     className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
//                                     onChange={handleFormChange}
//                                     value={formData.password}
//                                     name="password"
//                                     labelProps={{
//                                         className:
//                                             "before:content-none after:content-none",
//                                     }}
//                                 />
//                                 <motion.button
//                                     type="submit"
//                                     className="w-full py-2 text-white bg-black rounded-lg hover:bg-gray-800"
//                                     whileHover={{ scale: 1.05 }}
//                                 >
//                                     Register
//                                 </motion.button>
//                             </motion.form>
//                         )}
//                     </AnimatePresence>

//                     <motion.p
//                         onClick={handleSwitch}
//                         className="mt-6 text-center text-black cursor-pointer hover:text-gray-800"
//                         whileHover={{ scale: 1.05 }}
//                     >
//                         {isLogin ? (
//                             <Typography>
//                                 Don't have an account?{" "}
//                                 <span className="font-bold pl-2">
//                                     Register now !
//                                 </span>{" "}
//                             </Typography>
//                         ) : (
//                             <Typography>
//                                 {" "}
//                                 Already have an account?{" "}
//                                 <span className="font-bold pl-2">
//                                     {" "}
//                                     Login !
//                                 </span>{" "}
//                             </Typography>
//                         )}
//                     </motion.p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// ==========================

"use client";
import { Card, Input, Button, Typography } from "@material-tailwind/react";
import React, { useState } from "react";
import { loginUserApi } from "@/api/user_apis";
import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@headlessui/react";

// Define LoginForm as a separate component
const LoginForm = ({ formData, handleFormChange, handleSubmit, loading }) => {
    return (
        <motion.form
            key="loginForm"
            className="space-y-4 w-full"
            onSubmit={handleSubmit}
        >
            <Input
                size="lg"
                placeholder="name@mail.com"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                value={formData.email}
                onChange={handleFormChange}
                name="email"
                labelProps={{
                    className: "before:content-none after:content-none",
                }}
            />
            <Input
                type="password"
                size="lg"
                placeholder="********"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                onChange={handleFormChange}
                value={formData.password}
                name="password"
                labelProps={{
                    className: "before:content-none after:content-none",
                }}
            />

            <Button
                className="items-center w-full justify-center rounded-lg hover:animate-bounce"
                fullWidth
                size="lg"
                type="submit"
                loading={loading ? true : false}
            >
                Sign in
            </Button>
        </motion.form>
    );
};

// Define RegisterForm as a separate component
const RegisterForm = ({ formData, handleFormChange, handleSubmit }) => {
    return (
        <motion.form
            key="registerForm"
            className="space-y-4 w-full"
            onSubmit={handleSubmit}
        >
            <Input
                size="lg"
                placeholder="name@mail.com"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                value={formData.email}
                onChange={handleFormChange}
                name="email"
                labelProps={{
                    className: "before:content-none after:content-none",
                }}
            />
            <Input
                type="password"
                size="lg"
                placeholder="********"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                onChange={handleFormChange}
                value={formData.password}
                name="password"
                labelProps={{
                    className: "before:content-none after:content-none",
                }}
            />
            <Button
                className="items-center w-full justify-center rounded-lg hover:animate-bounce"
                fullWidth
                size="lg"
                type="submit"
            >
                Register
            </Button>
        </motion.form>
    );
};

export default function UserLoginForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleFormChange = (e) => {
        e.preventDefault();
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setError("");
    };

    // Login form submission
    const handleSubmit = async (e) => {
        setError("");
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError("Both username and password are required");
            return;
        }

        setLoading(true);

        try {
            const response = await loginUserApi(formData);
            if (response.status === 200) {
                const { access, refresh } = response.data;
                sessionStorage.setItem("access_token", access);
                sessionStorage.setItem("refresh_token", refresh);

                let redirectUrl =
                    sessionStorage.getItem("redirect_after_login") ||
                    "/user/dashboard";
                sessionStorage.removeItem("redirect_after_login");

                const disallowedPaths = ["/login", "/logout", "/register"];

                if (
                    disallowedPaths.some((path) => redirectUrl.includes(path))
                ) {
                    redirectUrl = "/user/dashboard";
                }

                router.push(redirectUrl);
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

    const handleSwitch = () => setIsLogin(!isLogin);

    const cosnicTextVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 4, ease: "easeInOut" },
        },
    };

    const backgroundVariants = {
        animate: {
            backgroundColor: darkMode
                ? ["#333333", "#666666", "#999999", "#bbbbbb", "#dddddd"]
                : ["#ffffff", "#dddddd", "#bbbbbb", "#999999", "#666666"],
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        },
    };

    return (
        <div
            className={`h-screen flex flex-col items-center justify-center transition-all duration-500 overflow-hidden ${
                darkMode ? "bg-gray-900" : "bg-white"
            }`}
        >
            <div className="w-full h-full grid grid-cols-3 overflow-hidden">
                {/* Left 2/3: COSNIC Animation */}
                <motion.div
                    className={`col-span-2 flex items-center justify-center p-8 transition-all duration-1000 ${
                        darkMode ? "bg-gray-800" : "bg-gray-300"
                    }`}
                    variants={backgroundVariants}
                    animate="animate"
                >
                    {/* <motion.div
                        className="text-9xl font-bold text-black h-full bg-transparent place-content-center ml-20"
                        variants={cosnicTextVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ fontFamily: "system-ui, sans-serif" }}
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 drop-shadow-xl">
                            CosN<span className="text-white">i</span>
                            C.{" "}
                        </span>
                        <Typography className="text-sm font-poppins font-bold mt-2 align-left">
                            the cosmos of nic
                        </Typography>
                    </motion.div>
                </motion.div> */}
                    <motion.div
                        className="text-9xl font-bold text-black h-full bg-transparent place-content-center ml-20"
                        variants={cosnicTextVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ fontFamily: "system-ui, sans-serif" }}
                    >
                        <span
                            className="bg-clip-text text-transparent drop-shadow-xl animate-gradient"
                            style={{
                                backgroundImage:
                                    "linear-gradient(90deg, #ec4899, #8b5cf6)", // Start with gradient color
                                backgroundSize: "200%", // Ensures gradient spreads over the entire text and can be animated
                                backgroundPosition: "0% 50%", // Position it initially for the animation
                            }}
                        >
                            CosN<span className="text-white">i</span>C
                        </span>
                        <Typography className="text-sm font-poppins font-bold mt-2 align-left">
                            the cosmos of nic
                        </Typography>
                    </motion.div>

                    <style jsx>{`
                        @keyframes gradient-rotation {
                            0% {
                                background-position: 0% 50%; // Start at the left
                            }
                            100% {
                                background-position: 100% 50%; // Move to the right
                            }
                        }
                        .animate-gradient {
                            animation: gradient-rotation 4s linear infinite; // Rotate gradient infinitely every 4 seconds
                        }
                    `}</style>
                </motion.div>

                {/* Right 1/3: Login/Register Form */}
                <div
                    className={`col-span-1 flex flex-col justify-center items-center transition-all duration-500 ${
                        darkMode ? "bg-gray-900" : "bg-white"
                    } p-8 rounded-lg shadow-lg overflow-hidden`}
                >
                    <div className="flex justify-between mb-6 w-full">
                        <h2 className="text-2xl text-black antialiased font-extrabold tracking-wider">
                            {isLogin ? "Login" : "Register"} to Cos-NIC
                            {error && (
                                <Typography color="red" className="text-sm">
                                    {error}
                                </Typography>
                            )}
                        </h2>
                        <Switch
                            checked={darkMode}
                            onChange={setDarkMode}
                            className={`${
                                darkMode ? "bg-gray-600" : "bg-gray-200"
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 ease-in-out`}
                        >
                            <span
                                className={`${
                                    darkMode ? "translate-x-6" : "translate-x-1"
                                } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                            />
                        </Switch>
                    </div>

                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <LoginForm
                                formData={formData}
                                handleFormChange={handleFormChange}
                                handleSubmit={handleSubmit}
                                loading={loading}
                            />
                        ) : (
                            <RegisterForm
                                formData={formData}
                                handleFormChange={handleFormChange}
                                handleSubmit={handleSubmit}
                            />
                        )}
                    </AnimatePresence>

                    <motion.p
                        onClick={handleSwitch}
                        className="mt-4 cursor-pointer text-blue-500 underline"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isLogin
                            ? "Don't have an account? Register here!"
                            : "Already registered? Login here!"}
                    </motion.p>
                </div>
            </div>
        </div>
    );
}
