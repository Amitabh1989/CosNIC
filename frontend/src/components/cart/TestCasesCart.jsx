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
import { useSelector, useDispatch } from "react-redux";
import { resetTestCasesCart } from "@/reduxToolkit/selectedTestCaseCartSlice";

const TestCasesCart = () => {
    const dispatch = useDispatch();
    const testCaseCart = useSelector((state) => state.testCasesCart);
    const internalTestCasesCart = useSelector(
        (state) => state.testCasesCart.selectedTestCases
    );

    useEffect(() => {});

    return (
        <Card className="mt-48 w-full h-1/2 relative">
            <Badge
                color="red"
                className="absolute top-4 right-4 transform translate-x-1/2 -translate-y-1/2 font-bold"
                content={
                    internalTestCasesCart.length === 0
                        ? "0"
                        : internalTestCasesCart.length
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
                <table className="w-full text-left">
                    {/* <table className="w-full min-w-max table-auto text-left"> */}
                    <thead>
                        <tr>
                            {["#", "ID", "Subtests", "Suite"].map((head) => (
                                <th
                                    key={head}
                                    className="border-b border-blue-gray-100 bg-blue-gray-50 p-2"
                                >
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal leading-none opacity-70"
                                    >
                                        {head}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {internalTestCasesCart.map((testCase, index) => {
                            const isEven = index % 2 === 0;
                            const classes = `${isEven ? "bg-white" : "bg-gray-100"}`;

                            return (
                                <tr key={index} className={classes}>
                                    <td className="p-2">
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="text-sm font-bold pl-2"
                                        >
                                            {index}
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
                                    <td className="p-2 ">
                                        <div className="flex items-center w-12 gap-3">
                                            <Chip
                                                variant="ghost"
                                                className="font-bold"
                                                value={(() => {
                                                    // Ensure each subtest has a `selected` property
                                                    const updatedSubtests =
                                                        testCase.subtests.map(
                                                            (subtest) => {
                                                                if (
                                                                    typeof subtest.selected ===
                                                                    "undefined"
                                                                ) {
                                                                    // Add `selected: true` if it's missing
                                                                    return {
                                                                        ...subtest,
                                                                        selected: true,
                                                                    };
                                                                }
                                                                return subtest;
                                                            }
                                                        );

                                                    // Count the number of selected subtests
                                                    const selectedCount =
                                                        updatedSubtests.filter(
                                                            (subtest) =>
                                                                subtest.selected
                                                        ).length;

                                                    // Return the formatted result `selectedCount / totalSubtests`
                                                    return `${selectedCount} / ${updatedSubtests.length}`;
                                                })()}
                                            />
                                        </div>
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
                        {/* <Button onClick={() => dispatch(addToTestCasesCart())}> */}
                        <Button>Confirm</Button>
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
