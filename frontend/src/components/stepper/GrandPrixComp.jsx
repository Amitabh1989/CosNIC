// Install the react-icons library first by running: npm install react-icons
import React, { useState } from "react";
import { FaCar } from "react-icons/fa"; // Import car icon from react-icons
import { GiF1Car } from "react-icons/gi";
import {
    Card,
    CardBody,
    CardFooter,
    Typography,
    Button,
    CardHeader,
    Chip,
    Badge,
    IconButton,
} from "@material-tailwind/react";
import { FaFlagCheckered } from "react-icons/fa";

function GrandPrixButton() {
    const [showCar, setShowCar] = useState(false); // State to control car visibility
    const [animationKey, setAnimationKey] = useState(0); // State to reset animation

    const handleClick = () => {
        setShowCar(true); // Show car when button is clicked

        // Trigger a re-render to restart the animation
        setAnimationKey((prevKey) => prevKey + 1);

        // Hide car after animation finishes (2 seconds in this case)
        setTimeout(() => {
            setShowCar(false);
        }, 5000); // Adjust this timeout to match the animation duration
    };
    return (
        <>
            {/* Flex container for the button and car */}
            <div className="flex items-center gap-3 w-full max-w-4xl relative">
                {/* Button with fixed width */}
                <div className="w-40">
                    {" "}
                    {/* Fixed width for button */}
                    <Button
                        onClick={handleClick}
                        className="flex items-center gap-3 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition transform hover:scale-105 focus:outline-none"
                    >
                        <FaFlagCheckered className="text-2xl mr-2" />
                        Go
                    </Button>
                </div>

                {/* Car animation (controlled by state) */}
                <div className="relative w-full h-20 pt-5">
                    {" "}
                    {/* Wide area for the car's path */}
                    {showCar && (
                        <div
                            key={animationKey} // This resets the animation on every click
                            className="absolute left-0"
                            style={{ animation: "carRace 6s forwards" }} // 4s for car running off
                        >
                            <GiF1Car className="text-6xl" />
                        </div>
                    )}
                </div>
            </div>

            {/* CSS for car racing animation */}
            <style>{`
                @keyframes carRace {
                    0% {
                        transform: translateX(0) scale(4); /* Start at the button, scale from 0 */
                    }
                    // 10% {
                    //     transform: translateX(800px) scale(4); /* Car scales up midway */
                    // }
                    100% {
                        transform: translateX(3200px) scale(0); /* Car shrinks to 0 and speeds off */
                    }
                }
            `}</style>
        </>
    );
}

//     return (
//         <div>
//             {/* <div className="relative flex items-center justify-center h-screen bg-gray-100"> */}
//             {/* Go button */}
//             <div className="flex items-center justify-center h-screen bg-gray-100">
//             {/* Flex container for the button and car */}
//                 <div className="flex items-center gap-3 w-full max-w-4xl relative">
//                     <div className="w-40"> {/* Fixed width for button */}
//                         <Button
//                             onClick={handleClick}
//                             // className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition transform hover:scale-105 focus:outline-none"
//                             className="flex items-center gap-3 hover:bg-blue-700 transition transform hover:scale-105 focus:outline-none"
//                         >
//                             <FaFlagCheckered className="text-2xl mr-2" />
//                             Go
//                                 </Button>
//                     </div>

//                     {/* Car animation (controlled by state) */}
//                     <div className="relative w-full h-20"> {/* Wide area for the car's path */}
//                         {showCar && (
//                             <div
//                                 key={animationKey} // This resets the animation on every click
//                                 // className="relative left-0"
//                                 className="relative"
//                                 style={{ animation: "carRace 4s forwards" }} // 2s for car running off
//                             >
//                                 <GiF1Car className="text-6xl " />{" "}
//                             </div>
//                                 )}
//                     </div>
//                 </div>

//                 {/* CSS for car racing animation */}
//                 <style>{`
//           @keyframes carRace {
//             0% {
//               transform: translateX(800px) scale(5); /* Start at the button, scale from 0 */
//             }
//             // 10% {
//             //   transform: translateX(800px) scale(1); /* Car grows to max size midway */
//             // }
//             100% {
//               transform: translateX(3200px) scale(0); /* Car shrinks to 0 and speeds off */
//             }
//           }
//         `}</style>
//             </div>
//             </div>
//         </>
//     );
// }

export default GrandPrixButton;

{
    /* Checkered flag (appears on hover) */
}
{
    /* <img
                src="https://media.giphy.com/media/12wteMTWzjK7UQ/giphy.gif"
                alt="Waving flag"
                className="absolute top-0 left-0 w-8 h-8 flag-hover"
                style={{ display: showCar ? "none" : "block" }} // Hide flag when car runs
            /> */
}
