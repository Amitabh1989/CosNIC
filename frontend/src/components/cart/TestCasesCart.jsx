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
    IconButton,
} from "@material-tailwind/react";
import { useSelector, useDispatch } from "react-redux";
import { resetTestCasesCart } from "@/reduxToolkit/selectedTestCaseCartSlice";
import { HiOutlineShoppingCart } from "react-icons/hi";

const TestCasesCart = () => {
    const dispatch = useDispatch();
    const testCaseCart = useSelector((state) => state.testCasesCart);
    const internalTestCasesCart = useSelector(
        (state) => state.testCasesCart.selectedTestCases
    );

    useEffect(() => {});

    return (
        <Card className="w-full h-full relative flex flex-col">
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
                    className="h-15 flex w-full justify-center items-center bg-black relative"
                >
                    <div className="flex items-center justify-between w-full">
                        <Typography
                            variant="h4"
                            color="white"
                            className="p-2 ml-10"
                        >
                            Test Case cart
                        </Typography>

                        <HiOutlineShoppingCart
                            className="h-7 w-7 mr-10"
                            color="white"
                        />
                    </div>
                </CardHeader>
            </Badge>
            <CardBody className="w-full overflow-y-auto flex-grow">
                <table className="w-full text-left">
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
                                                    const updatedSubtests =
                                                        testCase.subtests.map(
                                                            (subtest) => {
                                                                if (
                                                                    typeof subtest.selected ===
                                                                    "undefined"
                                                                ) {
                                                                    return {
                                                                        ...subtest,
                                                                        selected: true,
                                                                    };
                                                                }
                                                                return subtest;
                                                            }
                                                        );

                                                    const selectedCount =
                                                        updatedSubtests.filter(
                                                            (subtest) =>
                                                                subtest.selected
                                                        ).length;

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
            <CardFooter className="mt-4 w-full flex justify-end">
                <div className="flex gap-2">
                    <Button>Confirm</Button>
                    <Button onClick={() => dispatch(resetTestCasesCart())}>
                        Clear
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default TestCasesCart;
