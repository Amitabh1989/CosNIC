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

// export default function UserLoginForm() {
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

//     return (
//         <>
//             <div className="bg-gray-100 flex justify-center items-center h-screen">
//                 {/* <!-- Left: Image --> */}
//                 <div className="w-1/2 h-screen hidden lg:block">
//                     <img
//                         src="https://placehold.co/800x/667fff/ffffff.png?text=Your+Image&font=Montserrat"
//                         alt="Placeholder Image"
//                         className="object-cover w-full h-full"
//                     />
//                     <div class="typewriter">
//                         <span class="font-serif text-gray-400">C</span>
//                         <span class="font-sans text-blue-500">o</span>
//                         <span class="font-mono text-purple-600">s</span>
//                         <span class="font-serif text-yellow-400">m</span>
//                         <span class="font-sans text-green-500">i</span>
//                         <span class="font-mono text-pink-600">c</span>
//                     </div>
//                 </div>
//                 {/* <!-- Right: Login Form --> */}
//                 <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
//                     <h1 className="text-2xl font-semibold mb-4">Login</h1>
//                     <form action="#" method="POST">
//                         {/* <!-- Username Input --> */}
//                         <div className="mb-4">
//                             <label
//                                 for="username"
//                                 className="block text-gray-600"
//                             >
//                                 Username
//                             </label>
//                             <input
//                                 type="text"
//                                 id="username"
//                                 name="username"
//                                 className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
//                                 autocomplete="off"
//                             />
//                         </div>
//                         {/* <!-- Password Input --> */}
//                         <div className="mb-4">
//                             <label
//                                 for="password"
//                                 className="block text-gray-600"
//                             >
//                                 Password
//                             </label>
//                             <input
//                                 type="password"
//                                 id="password"
//                                 name="password"
//                                 className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
//                                 autocomplete="off"
//                             />
//                         </div>
//                         {/* <!-- Remember Me Checkbox --> */}
//                         <div className="mb-4 flex items-center">
//                             <input
//                                 type="checkbox"
//                                 id="remember"
//                                 name="remember"
//                                 className="text-blue-500"
//                             />
//                             <label
//                                 for="remember"
//                                 className="text-gray-600 ml-2"
//                             >
//                                 Remember Me
//                             </label>
//                         </div>
//                         {/* <!-- Forgot Password Link --> */}
//                         <div className="mb-6 text-blue-500">
//                             <a href="#" class="hover:underline">
//                                 Forgot Password?
//                             </a>
//                         </div>
//                         {/* <!-- Login Button --> */}
//                         <button
//                             type="submit"
//                             className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
//                         >
//                             Login
//                         </button>
//                     </form>
//                     {/* <!-- Sign up  Link --> */}
//                     <div className="mt-6 text-blue-500 text-center">
//                         <a href="#" className="hover:underline">
//                             Sign up Here
//                         </a>
//                     </div>
//                 </div>
//             </div>
//             <div className="flex flex-grow items-center justify-center bg-gray-100 h-screen w-full">
//                 {/* <Card className="absolute shadow-lg w-96 items-center h-1/2"> */}
//                 {/* <Card className="shadow-lg w-96 items-center h-1/2 place-items-center"> */}
//                 <Card className="shadow-lg w-96 flex justify-center items-center">
//                     {/* Card Header */}
//                     <CardHeader
//                         variant="solid"
//                         color="gray"
//                         className="w-full mb-4 grid h-24 place-items-center shadow-lg min-w-[24rem]"
//                     >
//                         <Typography variant="h1" color="white" className="p-4">
//                             Cos-NIC
//                         </Typography>
//                         {/* <Typography variant="h4" color="white" className="pb-2">
//                         Welcome back
//                     </Typography> */}
//                     </CardHeader>
//                     {/* Card body */}
//                     <CardBody className="flex flex-col gap-4 w-full h-full justify-center items-center p-4">
//                         <Typography variant="h4" color="blue-gray">
//                             Login to your account
//                         </Typography>
//                         {error && (
//                             <Typography color="red" className="text-sm">
//                                 {error}
//                             </Typography>
//                         )}
//                         <form
//                             className="mt-6 mb-2 min-w-[24rem] w-full sm:w-auto max-w-screen-lg pad-4"
//                             onSubmit={handleSubmit}
//                         >
//                             <div className="flex flex-col gap-4 h-full p-4">
//                                 <div className="mb-1 flex flex-col gap-6">
//                                     <Typography
//                                         variant="h6"
//                                         color="blue-gray"
//                                         className="-mb-3 mt-4"
//                                     >
//                                         Your Email
//                                     </Typography>
//                                     <Input
//                                         size="lg"
//                                         placeholder="name@mail.com"
//                                         className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
//                                         value={formData.email}
//                                         onChange={handleFormChange}
//                                         name="email"
//                                         labelProps={{
//                                             className:
//                                                 "before:content-none after:content-none",
//                                         }}
//                                     />
//                                     <Typography
//                                         variant="h6"
//                                         color="blue-gray"
//                                         className="-mb-3 mt-4"
//                                     >
//                                         Password
//                                     </Typography>
//                                     <Input
//                                         type="password"
//                                         size="lg"
//                                         placeholder="********"
//                                         className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
//                                         onChange={handleFormChange}
//                                         value={formData.password}
//                                         name="password"
//                                         labelProps={{
//                                             className:
//                                                 "before:content-none after:content-none",
//                                         }}
//                                     />
//                                 </div>
//                                 <div className="mt-6 flex w-full h-10">
//                                     <Button
//                                         className="items-center w-full justify-center !pt-0 !pb-0 rounded-full"
//                                         fullWidth
//                                         size="lg"
//                                         type="submit"
//                                         loading={loading ? true : false}
//                                     >
//                                         Sign in
//                                     </Button>
//                                 </div>
//                             </div>
//                         </form>
//                     </CardBody>
//                     {/* Card Footer */}
//                     <CardFooter className="pt-0">
//                         <Typography
//                             variant="small"
//                             className="mt-6 flex justify-center"
//                         >
//                             Don't have an account?{" "}
//                             <Typography
//                                 as="a"
//                                 variant="small"
//                                 color="blue-gray"
//                                 className="ml-1 font-bold"
//                             >
//                                 Create account
//                             </Typography>
//                         </Typography>
//                     </CardFooter>
//                 </Card>
//             </div>
//         </>
//     );
// }

// ===========================================================
// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Switch } from "@headlessui/react";

// export default function Auth() {
//     const [isLogin, setIsLogin] = useState(true);
//     const [darkMode, setDarkMode] = useState(false);

//     const handleSwitch = () => setIsLogin(!isLogin);

//     const containerVariants = {
//         hidden: { opacity: 0, x: "-100vw" },
//         visible: {
//             opacity: 1,
//             x: 0,
//             transition: { type: "spring", stiffness: 60 },
//         },
//     };

//     const buttonVariants = {
//         hover: {
//             scale: 1.1,
//             boxShadow: "0px 0px 8px rgb(255, 255, 255)",
//             transition: { yoyo: Infinity },
//         },
//     };

//     return (
//         <div
//             className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gradient-to-r from-blue-500 to-indigo-500"}`}
//         >
//             <motion.div
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="visible"
//                 className="p-8 bg-white rounded-lg shadow-md w-96"
//             >
//                 <div className="flex justify-between mb-6">
//                     <h2 className="text-2xl font-bold text-gray-700">
//                         {isLogin ? "Login" : "Register"} to Cos-NIC
//                     </h2>
//                     <Switch
//                         checked={darkMode}
//                         onChange={setDarkMode}
//                         className={`${
//                             darkMode ? "bg-indigo-600" : "bg-gray-200"
//                         } relative inline-flex h-6 w-11 items-center rounded-full`}
//                     >
//                         <span
//                             className={`${
//                                 darkMode ? "translate-x-6" : "translate-x-1"
//                             } inline-block h-4 w-4 transform bg-white rounded-full transition`}
//                         />
//                     </Switch>
//                 </div>

//                 <form className="space-y-4">
//                     <input
//                         type="email"
//                         placeholder="Email"
//                         className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
//                     />
//                     <input
//                         type="password"
//                         placeholder="Password"
//                         className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
//                     />
//                     {!isLogin && (
//                         <motion.input
//                             type="password"
//                             placeholder="Confirm Password"
//                             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             transition={{ duration: 0.5 }}
//                         />
//                     )}
//                     <motion.button
//                         type="submit"
//                         className="w-full py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//                         variants={buttonVariants}
//                         whileHover="hover"
//                     >
//                         {isLogin ? "Login" : "Register"}
//                     </motion.button>
//                 </form>

//                 <motion.p
//                     onClick={handleSwitch}
//                     className="mt-6 text-center text-blue-600 cursor-pointer hover:text-blue-800"
//                     whileHover={{ scale: 1.05 }}
//                 >
//                     {isLogin
//                         ? "Don't have an account? Register now!"
//                         : "Already have an account? Login!"}
//                 </motion.p>
//             </motion.div>
//         </div>
//     );
// }

// ===========================================

// pages/auth.js

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Switch } from "@headlessui/react";

// export default function Auth() {
//     const [isLogin, setIsLogin] = useState(true);
//     const [darkMode, setDarkMode] = useState(false);
//     const [cosnicText, setCosnicText] = useState("Cos-NIC");
//     const [colorIndex, setColorIndex] = useState(0);
//     const colors = [
//         "text-red-500",
//         "text-blue-500",
//         "text-green-500",
//         "text-yellow-500",
//     ];

//     useEffect(() => {
//         let isMounted = true;
//         const loopTypingEffect = () => {
//             let index = 0;
//             let direction = 1;
//             const typingInterval = setInterval(() => {
//                 if (isMounted) {
//                     if (index === cosnicText.length) direction = -1;
//                     if (index === 0) direction = 1;
//                     setCosnicText((prev) => prev.slice(0, index));
//                     index += direction;
//                 }
//             }, 200);
//             return () => clearInterval(typingInterval);
//         };

//         const loopColorChange = setInterval(() => {
//             setColorIndex((prev) => (prev + 1) % colors.length);
//         }, 2000);

//         loopTypingEffect();
//         return () => {
//             isMounted = false;
//             clearInterval(loopColorChange);
//         };
//     }, [cosnicText.length]);

//     const handleSwitch = () => setIsLogin(!isLogin);

//     const containerVariants = {
//         hidden: { opacity: 0, x: "100vw" },
//         visible: {
//             opacity: 1,
//             x: 0,
//             transition: { type: "spring", stiffness: 60 },
//         },
//     };

//     const buttonVariants = {
//         hover: {
//             scale: 1.1,
//             boxShadow: "0px 0px 8px rgb(255, 255, 255)",
//             transition: { yoyo: Infinity },
//         },
//     };

//     return (
//         <div
//             className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-black" : "bg-white"}`}
//         >
//             <div className="absolute top-10">
//                 <h1
//                     className={`text-5xl font-bold tracking-wider ${colors[colorIndex]} animate-pulse`}
//                 >
//                     {cosnicText}
//                     <motion.span
//                         className="inline-block"
//                         initial={{ scale: 1 }}
//                         animate={{
//                             scale: [1, 2, 1],
//                             opacity: [1, 0, 1],
//                             transition: { duration: 1 },
//                         }}
//                     >
//                         i
//                     </motion.span>
//                 </h1>
//             </div>
//             <motion.div
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="visible"
//                 className="p-8 bg-white rounded-lg shadow-md w-96 border-2 border-black"
//             >
//                 <div className="flex justify-between mb-6">
//                     <h2 className="text-2xl font-bold text-black">
//                         {isLogin ? "Login" : "Register"} to Cos-NIC
//                     </h2>
//                     <Switch
//                         checked={darkMode}
//                         onChange={setDarkMode}
//                         className={`${
//                             darkMode ? "bg-gray-600" : "bg-gray-200"
//                         } relative inline-flex h-6 w-11 items-center rounded-full`}
//                     >
//                         <span
//                             className={`${
//                                 darkMode ? "translate-x-6" : "translate-x-1"
//                             } inline-block h-4 w-4 transform bg-white rounded-full transition`}
//                         />
//                     </Switch>
//                 </div>

//                 <form className="space-y-4">
//                     <input
//                         type="email"
//                         placeholder="Email"
//                         className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
//                     />
//                     <input
//                         type="password"
//                         placeholder="Password"
//                         className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
//                     />
//                     {!isLogin && (
//                         <motion.input
//                             type="password"
//                             placeholder="Confirm Password"
//                             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             transition={{ duration: 0.5 }}
//                         />
//                     )}
//                     <motion.button
//                         type="submit"
//                         className="w-full py-2 text-white bg-black rounded-lg hover:bg-gray-800"
//                         variants={buttonVariants}
//                         whileHover="hover"
//                     >
//                         {isLogin ? "Login" : "Register"}
//                     </motion.button>
//                 </form>

//                 <motion.p
//                     onClick={handleSwitch}
//                     className="mt-6 text-center text-black cursor-pointer hover:text-gray-800"
//                     whileHover={{ scale: 1.05 }}
//                 >
//                     {isLogin
//                         ? "Don't have an account? Register now!"
//                         : "Already have an account? Login!"}
//                 </motion.p>
//             </motion.div>
//         </div>
//     );
// }

// ======================================================================

// pages/auth.js

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Switch } from "@headlessui/react";
// import { Typography } from "@material-tailwind/react";

// export default function Auth() {
//     const [isLogin, setIsLogin] = useState(true);
//     const [darkMode, setDarkMode] = useState(false);
//     const [cosnicText, setCosnicText] = useState("");
//     const [typingIndex, setTypingIndex] = useState(0);
//     const [deleting, setDeleting] = useState(false);
//     const [fontIndex, setFontIndex] = useState(0);

//     const cosnicFullText = "Cos-NiC";
//     const fonts = [
//         "font-mono",
//         "font-sans",
//         "font-serif",
//         "font-bold",
//         "italic",
//     ];

//     // Typewriter effect with font rotation
//     useEffect(() => {
//         const typingSpeed = 300;
//         const deletingSpeed = 100;
//         const pauseBetween = 1000;
//         let timeoutId;

//         const handleTyping = () => {
//             if (!deleting && typingIndex < cosnicFullText.length) {
//                 setCosnicText(cosnicText + cosnicFullText.charAt(typingIndex));
//                 setTypingIndex(typingIndex + 1);
//             } else if (deleting && typingIndex > 0) {
//                 setCosnicText(cosnicText.slice(0, -1));
//                 setTypingIndex(typingIndex - 1);
//             } else {
//                 setDeleting(!deleting);
//                 if (!deleting)
//                     setFontIndex((prev) => (prev + 1) % fonts.length);
//                 timeoutId = setTimeout(() => {}, pauseBetween);
//             }
//         };

//         timeoutId = setTimeout(
//             handleTyping,
//             deleting ? deletingSpeed : typingSpeed
//         );

//         return () => clearTimeout(timeoutId);
//     }, [typingIndex, deleting, cosnicText]);

//     const handleSwitch = () => setIsLogin(!isLogin);

//     const containerVariants = {
//         hidden: { opacity: 0, x: "100vw" },
//         visible: {
//             opacity: 1,
//             x: 0,
//             transition: { type: "spring", stiffness: 60 },
//         },
//     };

//     const buttonVariants = {
//         hover: {
//             scale: 1.1,
//             boxShadow: "0px 0px 8px rgb(255, 255, 255)",
//             transition: { yoyo: Infinity },
//         },
//     };

//     return (
//         <div
//             className={`min-h-screen flex flex-col items-center justify-center h-full ${darkMode ? "bg-black" : "bg-white"}`}
//         >
//             <div className="w-full h-full grid grid-cols-3 m-10 p-10">
//                 {/* Left 2/3: COS-NIC Animation */}
//                 <div className="col-span-2 flex items-center justify-center p-8 bg-blue-gray-300">
//                     <motion.div
//                         className={`text-6xl font-bold ${fonts[fontIndex]} text-black`}
//                         animate={{
//                             color: ["#FF0000", "#00FF00", "#0000FF"],
//                             transition: { duration: 2, repeat: Infinity },
//                         }}
//                     >
//                         {cosnicText}
//                         <motion.span
//                             className="inline-block"
//                             initial={{ scale: 1 }}
//                             animate={{
//                                 scale: [1, 2, 1],
//                                 opacity: [1, 0, 1],
//                                 transition: { duration: 1 },
//                             }}
//                         ></motion.span>
//                     </motion.div>
//                 </div>

//                 {/* Right 1/3: Login/Register Form */}
//                 <div className="col-span-1 flex flex-col justify-center items-center bg-white border-2 border-black p-8 rounded-lg shadow-lg">
//                     <div className="flex justify-between mb-6 w-full">
//                         <h2 className="text-2xl font-bold text-black font-poppins">
//                             {isLogin ? "Login" : "Register"} to Cos-NIC
//                         </h2>
//                         <Switch
//                             checked={darkMode}
//                             onChange={setDarkMode}
//                             className={`${
//                                 darkMode ? "bg-gray-600" : "bg-gray-200"
//                             } relative inline-flex h-6 w-11 items-center rounded-full`}
//                         >
//                             <span
//                                 className={`${
//                                     darkMode ? "translate-x-6" : "translate-x-1"
//                                 } inline-block h-4 w-4 transform bg-white rounded-full transition`}
//                             />
//                         </Switch>
//                     </div>

//                     <form className="space-y-4 w-full">
//                         <input
//                             type="email"
//                             placeholder="Email"
//                             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
//                         />
//                         <input
//                             type="password"
//                             placeholder="Password"
//                             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
//                         />
//                         {!isLogin && (
//                             <motion.input
//                                 type="password"
//                                 placeholder="Confirm Password"
//                                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 transition={{ duration: 0.5 }}
//                             />
//                         )}
//                         <motion.button
//                             type="submit"
//                             className="w-full py-2 text-white bg-black rounded-lg hover:bg-gray-800"
//                             variants={buttonVariants}
//                             whileHover="hover"
//                         >
//                             {isLogin ? "Login" : "Register"}
//                         </motion.button>
//                     </form>

//                     <motion.p
//                         onClick={handleSwitch}
//                         className="mt-6 text-center text-black cursor-pointer hover:text-gray-800"
//                         whileHover={{ scale: 1.05 }}
//                     >
//                         {isLogin ? (
//                             <Typography>
//                                 Don't have an account?{" "}
//                                 <span className="font-bold pl-2">
//                                     Register now!
//                                 </span>
//                             </Typography>
//                         ) : (
//                             <Typography>
//                                 Already have an account?{" "}
//                                 <span className="font-bold pl-2">Login!</span>
//                             </Typography>
//                         )}
//                     </motion.p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// ===============================================================================

// pages/auth.js

// pages/auth.js

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Switch } from "@headlessui/react";

// export default function Auth() {
//     const [isLogin, setIsLogin] = useState(true);
//     const [darkMode, setDarkMode] = useState(false);
//     const [cosnicText, setCosnicText] = useState("");
//     const [typingIndex, setTypingIndex] = useState(0);
//     const [deleting, setDeleting] = useState(false);
//     const [fontIndex, setFontIndex] = useState(0);

//     const cosnicFullText = "CosNIC";
//     const fonts = [
//         "font-extrabold",
//         // "font-figtree",
//         "font-poppins",
//         "font-semibold",
//     ];

//     // Typewriter effect with font rotation
//     useEffect(() => {
//         const typingSpeed = 400;
//         const deletingSpeed = 1;
//         const pauseBetween = 10000;
//         let timeoutId;

//         const handleTyping = () => {
//             if (!deleting && typingIndex < cosnicFullText.length) {
//                 setCosnicText(cosnicText + cosnicFullText.charAt(typingIndex));
//                 setTypingIndex(typingIndex + 1);
//             } else if (deleting && typingIndex > 0) {
//                 setCosnicText(cosnicText.slice(0, -1));
//                 setTypingIndex(typingIndex - 1);
//             } else {
//                 setDeleting(!deleting);
//                 if (!deleting)
//                     setFontIndex((prev) => (prev + 1) % fonts.length);
//                 timeoutId = setTimeout(() => {}, pauseBetween);
//             }
//             timeoutId = setTimeout(() => {}, pauseBetween);
//         };

//         timeoutId = setTimeout(
//             handleTyping,
//             deleting ? deletingSpeed : typingSpeed
//         );

//         return () => clearTimeout(timeoutId);
//     }, [typingIndex, deleting, cosnicText]);

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
//         animate: {
//             // color: ["#FF0000", "#00FF00", "#0000FF"],
//             color: ["#27447a", "#7e8187", "#000000"],
//             transition: { duration: 2, repeat: Infinity },
//         },
//     };

//     return (
//         <div
//             // className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? "bg-gray-900" : "bg-white"}`}
//             className={`h-screen flex flex-col items-center justify-center ${darkMode ? "bg-gray-900" : "bg-white"}`}
//         >
//             <div className="w-full h-full grid grid-cols-3">
//                 {/* Left 2/3: COS-NIC Animation */}
//                 <div
//                     className={`col-span-2 flex items-center justify-center p-8 ${darkMode ? "bg-gray-700" : "bg-blue-gray-500"}`}
//                 >
//                     <motion.div
//                         className={`text-7xl ${fonts[fontIndex]} text-black`}
//                         animate={cosnicTextVariants.animate}
//                     >
//                         {cosnicText}
//                         {cosnicText === cosnicFullText && (
//                             <motion.span
//                                 className="inline-block"
//                                 initial={{ scale: 1 }}
//                                 animate={{
//                                     scale: [1, 2, 1],
//                                     opacity: [1, 0, 1],
//                                     transition: { duration: 3 },
//                                 }}
//                             >
//                                 {" "}
//                             </motion.span>
//                         )}
//                     </motion.div>
//                 </div>

//                 {/* Right 1/3: Login/Register Form */}
//                 <div
//                     className={`col-span-1 flex flex-col justify-center items-center ${darkMode ? "bg-gray-900" : "bg-white"} p-8 rounded-lg shadow-lg`}
//                 >
//                     <div className="flex justify-between mb-6 w-full">
//                         <h2 className="text-2xl font-bold text-black">
//                             {isLogin ? "Login" : "Register"} to Cos-NIC
//                         </h2>
//                         <Switch
//                             checked={darkMode}
//                             onChange={setDarkMode}
//                             className={`${
//                                 darkMode ? "bg-gray-600" : "bg-gray-200"
//                             } relative inline-flex h-6 w-11 items-center rounded-full`}
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
//                             >
//                                 <input
//                                     type="email"
//                                     placeholder="Email"
//                                     className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
//                                 />
//                                 <input
//                                     type="password"
//                                     placeholder="Password"
//                                     className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
//                                 />
//                                 <motion.button
//                                     type="submit"
//                                     className="w-full py-2 text-white bg-black rounded-lg hover:bg-gray-800"
//                                     whileHover={{ scale: 1.05 }}
//                                 >
//                                     Login
//                                 </motion.button>
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
//                                 <input
//                                     type="email"
//                                     placeholder="Email"
//                                     className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
//                                 />
//                                 <input
//                                     type="password"
//                                     placeholder="Password"
//                                     className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
//                                 />
//                                 <input
//                                     type="password"
//                                     placeholder="Confirm Password"
//                                     className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
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
//                         {isLogin
//                             ? "Don't have an account? Register now!"
//                             : "Already have an account? Login!"}
//                     </motion.p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// =============================================================

// pages/auth.js

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Switch } from "@headlessui/react";

// export default function Auth() {
//     const [isLogin, setIsLogin] = useState(true);
//     const [darkMode, setDarkMode] = useState(false);

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
//         hidden: { opacity: 0, scale: 0.5 },
//         visible: {
//             opacity: 1,
//             scale: 1,
//             transition: { duration: 5, ease: "easeInOut" },
//         },
//     };

//     const backgroundVariants = {
//         animate: {
//             backgroundColor: [
//                 "#ffffff",
//                 "#333333",
//                 "#000000",
//                 "#666666",
//                 "#000000",
//             ],
//             transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
//         },
//     };

//     return (
//         <div
//             className={`h-screen flex flex-col items-center justify-center ${darkMode ? "bg-gray-900" : "bg-white"}`}
//         >
//             <div className="w-full h-full grid grid-cols-3">
//                 {/* Left 2/3: COS-NIC Animation */}
//                 <motion.div
//                     className={`col-span-2 flex items-center justify-center p-8 ${darkMode ? "bg-gray-800" : "bg-gray-300"}`}
//                     variants={backgroundVariants}
//                     animate="animate"
//                 >
//                     <motion.div
//                         className="text-9xl font-bold text-black rounded-xl shadow-lg"
//                         // variants={cosnicTextVariants}
//                         initial="hidden"
//                         animate="visible"
//                     >
//                         CosN<span className="text-white">i</span>C
//                     </motion.div>
//                 </motion.div>

//                 {/* Right 1/3: Login/Register Form */}
//                 <div
//                     className={`col-span-1 flex flex-col justify-center items-center ${darkMode ? "bg-gray-900" : "bg-white"} p-8 rounded-lg shadow-lg`}
//                 >
//                     <div className="flex justify-between mb-6 w-full">
//                         <h2 className="text-2xl font-bold text-black">
//                             {isLogin ? "Login" : "Register"} to Cos-NIC
//                         </h2>
//                         <Switch
//                             checked={darkMode}
//                             onChange={setDarkMode}
//                             className={`${
//                                 darkMode ? "bg-gray-600" : "bg-gray-200"
//                             } relative inline-flex h-6 w-11 items-center rounded-full`}
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
//                             >
//                                 <input
//                                     type="email"
//                                     placeholder="Email"
//                                     className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
//                                 />
//                                 <input
//                                     type="password"
//                                     placeholder="Password"
//                                     className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
//                                 />
//                                 <motion.button
//                                     type="submit"
//                                     className="w-full py-2 text-white bg-black rounded-lg hover:bg-gray-800"
//                                     whileHover={{ scale: 1.05 }}
//                                 >
//                                     Login
//                                 </motion.button>
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
//                                 <input
//                                     type="email"
//                                     placeholder="Email"
//                                     className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
//                                 />
//                                 <input
//                                     type="password"
//                                     placeholder="Password"
//                                     className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
//                                 />
//                                 <input
//                                     type="password"
//                                     placeholder="Confirm Password"
//                                     className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
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
//                         {isLogin
//                             ? "Don't have an account? Register now!"
//                             : "Already have an account? Login!"}
//                     </motion.p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// ======================================================

// pages/auth.js

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@headlessui/react";
import { Stepper, Step, Button, Typography } from "@material-tailwind/react";

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const handleSwitch = () => setIsLogin(!isLogin);

    const formVariants = {
        hidden: { opacity: 0, x: "100vw" },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: "spring", stiffness: 60 },
        },
        exit: {
            opacity: 0,
            x: "100vw",
            transition: { type: "spring", stiffness: 60 },
        },
    };

    const cosnicTextVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 2, ease: "easeInOut" },
        },
    };

    const backgroundVariants = {
        animate: {
            backgroundColor: [
                "#ffffff",
                "#dddddd",
                "#bbbbbb",
                "#999999",
                "#666666",
                "#333333",
                "#000000",
            ],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        },
    };

    return (
        <div
            className={`h-screen flex flex-col items-center justify-center transition-all duration-500 overflow-hidden ${
                darkMode ? "bg-gray-900" : "bg-white"
            }`}
        >
            <div className="w-full h-full grid grid-cols-3">
                {/* Left 2/3: COSNIC Animation */}
                <motion.div
                    className={`col-span-2 flex items-center justify-center p-8 transition-all duration-1000 ${
                        darkMode ? "bg-gray-800" : "bg-gray-300"
                    }`}
                    variants={backgroundVariants}
                    animate="animate"
                >
                    <motion.div
                        className="text-9xl font-bold text-black"
                        variants={cosnicTextVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ fontFamily: "system-ui, sans-serif" }} // Rounded and smooth native font
                    >
                        CosN<span className="text-white">i</span>C
                        <Typography className="text-sm font-poppins font-bold pl-5 -mt-2 place-content-end">
                            the cosmos of nic
                        </Typography>
                    </motion.div>
                </motion.div>

                {/* Right 1/3: Login/Register Form */}
                <div
                    className={`col-span-1 flex flex-col justify-center items-center transition-all duration-500 ${
                        darkMode ? "bg-gray-900" : "bg-white"
                    } p-8 rounded-lg shadow-lg`}
                >
                    <div className="flex justify-between mb-6 w-full">
                        <h2 className="text-2xl font-bold text-black">
                            {isLogin ? "Login" : "Register"} to Cos-NIC
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
                            <motion.form
                                key="loginForm"
                                variants={formVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-4 w-full"
                            >
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
                                />
                                <motion.button
                                    type="submit"
                                    className="w-full py-2 text-white bg-black rounded-lg hover:bg-gray-800"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Login
                                </motion.button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="registerForm"
                                variants={formVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-4 w-full"
                            >
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-black"
                                />
                                <motion.button
                                    type="submit"
                                    className="w-full py-2 text-white bg-black rounded-lg hover:bg-gray-800"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Register
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <motion.p
                        onClick={handleSwitch}
                        className="mt-6 text-center text-black cursor-pointer hover:text-gray-800"
                        whileHover={{ scale: 1.05 }}
                    >
                        {isLogin ? (
                            <Typography>
                                Don't have an account?{" "}
                                <span className="font-bold pl-2">
                                    Register now !
                                </span>{" "}
                            </Typography>
                        ) : (
                            <Typography>
                                {" "}
                                Already have an account?{" "}
                                <span className="font-bold pl-2">
                                    {" "}
                                    Login !
                                </span>{" "}
                            </Typography>
                        )}
                    </motion.p>
                </div>
            </div>
        </div>
    );
}
