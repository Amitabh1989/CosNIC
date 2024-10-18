"use client";
import React, { useEffect } from "react";
import {
    Card,
    CardBody,
    CardFooter,
    Typography,
    Button,
    CardHeader,
    Chip,
    Badge,
} from "@material-tailwind/react";
import { TestCasesContext } from "@/contexts/TestCasesContext";
import { useSelector, useDispatch } from "react-redux";
import {
    resetTestCasesCart,
    finalizeTestCasesCart,
} from "@/reduxToolkit/selectedTestCaseCartSlice";

const TestCasesCart = () => {
    const dispatch = useDispatch();
    const testCasesCart = useSelector(
        (state) => state.testCasesCart.selectedTestCases
    );

    // Log the selected test cases to the console
    console.log("Selected Test Cases:", testCasesCart);

    return (
        <Card className="mt-48 w-full h-1/2 relative">
            <Badge
                color="red"
                className="absolute top-4 right-4 transform translate-x-1/2 -translate-y-1/2 font-bold"
                content={
                    testCasesCart.length === 0 ? "0" : testCasesCart.length
                }
            >
                <CardHeader
                    floated={false}
                    className="h-10 flex w-full justify-center items-center bg-black relative"
                >
                    <Typography variant="h5" color="white" className="p-2">
                        Test Case cart
                    </Typography>
                </CardHeader>
            </Badge>
            <CardBody className="w-full overflow-y-auto">
                <table className="w-full">
                    <tbody>
                        {testCasesCart.map((testCase, index) => {
                            const isEven = index % 2 === 0;
                            const classes = `${isEven ? "bg-white" : "bg-gray-100"}`;

                            return (
                                <tr key={index} className={classes}>
                                    <td className="p-2">
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-normal"
                                        >
                                            {index}
                                            {" : "}
                                        </Typography>
                                    </td>
                                    <td className="p-2">
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-bold"
                                        >
                                            {testCase.title}
                                        </Typography>
                                    </td>
                                    <td className="p-2">
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-normal text-sm"
                                        >
                                            ({testCase.suite_name})
                                        </Typography>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </CardBody>
            <CardFooter className="pt-0">
                <div className="grid grid-cols-4">
                    <div className="col-start-3 p-2">
                        <Button
                            onClick={() => dispatch(finalizeTestCasesCart())}
                        >
                            Confirm
                        </Button>
                    </div>
                    <div className="col-start-4 p-2">
                        <Button onClick={() => dispatch(resetTestCasesCart())}>
                            Clear
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};

export default TestCasesCart;

// import React from "react";
// import {
//     Card,
//     CardBody,
//     CardFooter,
//     Typography,
//     Button,
// } from "@material-tailwind/react";
// import { useSelector } from "react-redux"; // Import useSelector
// import { TestCasesContext } from "@/contexts/TestCasesContext";
// import { selectTestCasesData } from "@/reduxToolkit/testCasesSlice"; // Adjust this import path

// const TestCasesCart = () => {
//     const { selectedTestCases } = React.useContext(TestCasesContext);
//     const testCases = useSelector(selectTestCasesData); // Access your full test cases data

//     return (
//         <Card className="mt-6 w-96">
//             <CardBody>
//                 <Typography variant="h5" color="blue-gray" className="mb-2">
//                     Test Case Cart
//                 </Typography>
//                 <Typography>Test Case Cart details</Typography>
//                 <ul>
//                     {selectedTestCases.map((testCaseId) => {
//                         const testCase = testCases.find((tc) => tc.id === testCaseId); // Find the test case object
//                         return (
//                             <li key={testCaseId}>
//                                 {testCase ? testCase.name : "Test Case Not Found"}
//                             </li>
//                         );
//                     })}
//                 </ul>
//             </CardBody>
//             <CardFooter className="pt-0">
//                 <Button>Read More</Button>
//             </CardFooter>
//         </Card>
//     );
// };

// export default TestCasesCart;
