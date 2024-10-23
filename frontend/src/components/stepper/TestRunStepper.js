import React, { useEffect, useState } from "react";
import {
    Stepper,
    Step,
    Button,
    Typography,
    Alert,
} from "@material-tailwind/react";
import { GrConfigure } from "react-icons/gr";
import { IoHardwareChipOutline } from "react-icons/io5";
import { GrTest } from "react-icons/gr";
import { FaFlagCheckered } from "react-icons/fa";

import SUTClientConfigFile from "../configfile/SUTClientConfigFile";
import TestCasesListAndSelection from "../testcases/TestCasesListAndSelection";
import VenvStatusComponent from "../env/VenvStatus";
import ReviewSelections from "./ReviewSelections";
import { useDispatch, useSelector } from "react-redux";
import {
    setStepperStep,
    setCulminativeData,
} from "@/reduxToolkit/stepperSlice";
import GrandPrixButton from "./GrandPrixComp";

export default function TestRunStepper() {
    const dispatch = useDispatch();
    const stepperStep = useSelector((state) => state.stepper.currentView);
    const [activeStep, setActiveStep] = useState(stepperStep); // Initialize with Redux state
    const [isLastStep, setIsLastStep] = useState(false);
    const [isFirstStep, setIsFirstStep] = useState(false);
    // const [showAlert, setShowAlert] = React.useState(false); // State to manage alert visibility

    const steps = [
        {
            step_name: "Env Selection",
            icon: <IoHardwareChipOutline className="h-7 w-7" />,
            component: <VenvStatusComponent />,
        },
        {
            step_name: "Test Case Selection",
            icon: <GrTest className="h-6 w-6" />,
            component: <TestCasesListAndSelection />,
        },
        {
            step_name: "Config File Selection",
            icon: <GrConfigure className="h-6 w-6" />,
            component: <SUTClientConfigFile />,
        },
        {
            step_name: "Review and Submit",
            icon: <FaFlagCheckered className="h-6 w-6" />,
            component: (
                <>
                    <ReviewSelections />
                    <GrandPrixButton />
                </>
            ),
        },
    ];

    // Effect to sync activeStep with Redux and local state
    useEffect(() => {
        let isMounted = true;
        if (isMounted && stepperStep !== 0) {
            // Alert or log the resumption step
            console.log(`Resumed from step ${stepperStep + 1}`);
            // Show alert only if we're resuming from a step other than 0
            // setShowAlert(true);
        }
        setActiveStep(stepperStep);
        setIsLastStep(stepperStep === steps.length - 1);
        setIsFirstStep(stepperStep === 0);
        // Cleanup function on component unmount
        return () => {
            isMounted = false;
        };
    }, [stepperStep, steps.length]);

    // Save the step in Redux when changed
    const handleNext = () => {
        if (!isLastStep) {
            const nextStep = activeStep + 1;
            setActiveStep(nextStep);
            dispatch(setStepperStep(nextStep)); // Update Redux
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            const prevStep = activeStep - 1;
            setActiveStep(prevStep);
            dispatch(setStepperStep(prevStep)); // Update Redux
        }
    };

    return (
        <div className="w-screen px-24 py-24 bg-blue-gray-300">
            {/* Stepper Component */}
            <Stepper
                activeStep={activeStep}
                className="w-full h-32 border-red-300"
            >
                {steps.map((step, index) => (
                    <Step
                        key={index}
                        onClick={() => {
                            setActiveStep(index);
                            dispatch(setStepperStep(index)); // Update Redux
                        }}
                    >
                        <div className="flex items-center justify-center">
                            {step.icon}
                            <div className="absolute -bottom-[6rem] w-max text-center">
                                <Typography
                                    variant="h6"
                                    color={
                                        activeStep === index
                                            ? "blue-gray"
                                            : "gray"
                                    }
                                >
                                    Step {index + 1}
                                </Typography>
                                <Typography
                                    color={
                                        activeStep === index
                                            ? "blue-gray"
                                            : "gray"
                                    }
                                    className="font-normal mb-10"
                                >
                                    {step.step_name}
                                </Typography>
                            </div>
                        </div>
                    </Step>
                ))}
            </Stepper>

            {/* Render the active component dynamically */}
            <div className="mt-8 p-10 w-full h-2/3">
                {steps[activeStep].component}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button onClick={handlePrev} disabled={isFirstStep}>
                    Prev
                </Button>
                <Button onClick={handleNext} disabled={isLastStep}>
                    Next
                </Button>
            </div>
            {/* Alert to inform user about resuming from the last step */}
            {/* {showAlert && (
                <Alert
                    variant="outlined"
                    onClose={() => setShowAlert(false)} // Make it dismissible
                    className="mb-5 text-sm z-auto"
                >
                    Resumed from where you left off.
                </Alert>
            )} */}
        </div>
    );
}
