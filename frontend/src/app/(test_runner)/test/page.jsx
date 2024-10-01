"use client";
import React from "react";
import TestRunStepper from "@/components/stepper/TestRunStepper";

const TestStepper = () => {
    return (
        <div className="container w-1/2 h-screen">
            {/* TestCases */}
            <TestRunStepper />
        </div>
    );
};

export default TestStepper;
