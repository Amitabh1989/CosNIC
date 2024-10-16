"use client";
import React from "react";
import {
    Card,
    CardBody,
    CardFooter,
    Typography,
    Button,
} from "@material-tailwind/react";
import { TestCasesContext } from "@/contexts/TestCasesContext";

const TestCasesCart = () => {
    const { selectedTestCases, handleTestCasesSelection } =
        React.useContext(TestCasesContext);

    // Log the selected test cases to the console
    console.log("Selected Test Cases:", selectedTestCases);

    return (
        <Card className="mt-6 w-96">
            <CardBody>
                <Typography variant="h5" color="blue-gray" className="mb-2">
                    Test Case cart
                </Typography>
                <Typography>Test Case Cart details</Typography>
                <ul>
                    {selectedTestCases?.map((testCase) => {
                        return <li key={testCase}>{testCase}</li>;
                        // return <li key={testCase.id}>{testCase.tcid}</li>;
                    })}
                </ul>
            </CardBody>
            <CardFooter className="pt-0">
                <Button>Read More</Button>
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
