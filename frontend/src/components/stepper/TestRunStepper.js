import React, { useEffect } from "react";
import { Stepper, Step, Button, Typography } from "@material-tailwind/react";
import {
    CogIcon,
    UserIcon,
    BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { FaPython } from "react-icons/fa";
import { GrDocumentConfig } from "react-icons/gr";
import { ImList2 } from "react-icons/im";
import { VscPreview } from "react-icons/vsc";
// import EnvSelection from "../env/EnvSelector";
import ConfigFileList from "../tables/ConfigFileList";
import TestCasesListAndSelection from "../testcases/TestCasesListAndSelection";
import VenvStatusComponent from "../env/VenvStatus";

export default function TestRunStepper({ step }) {
    const [activeStep, setActiveStep] = React.useState(0);
    const [isLastStep, setIsLastStep] = React.useState(false);
    const [isFirstStep, setIsFirstStep] = React.useState(false);
    const steps = [
        {
            step_name: "Env Selection",
            icon: <FaPython />,
            component: <VenvStatusComponent />,
        },
        {
            step_name: "Test Case Selection",
            icon: <FaPython />,
            component: <TestCasesListAndSelection />,
        },
        {
            step_name: "Config File Selection",
            icon: <FaPython />,
            component: <ConfigFileList />,
        },
        // {
        //     step_name: "Config Selection",
        //     icon: <GrDocumentConfig />,
        //     component: <ConfigSelection />,
        // },
        // {
        //     step_name: "Test Selection",
        //     icon: <ImList2 />,
        //     component: <TestSelection />,
        // },
        // {
        //     step_name: "Review & Run",
        //     icon: <VscPreview />,
        //     component: <ReviewRun />,
        // },
    ];

    useEffect(() => {
        setIsLastStep(activeStep === steps.length - 1);
        setIsFirstStep(activeStep === 0);
    }, [activeStep, steps.length]);

    const handleNext = () => !isLastStep && setActiveStep((cur) => cur + 1);
    const handlePrev = () => !isFirstStep && setActiveStep((cur) => cur - 1);

    return (
        <div className="w-full px-24 py-24">
            {/* Stepper Component */}
            <Stepper activeStep={activeStep} className="w-full h-24">
                {steps.map((step, index) => (
                    <Step key={index} onClick={() => setActiveStep(index)}>
                        <div className="flex items-center">
                            {step.icon}
                            <div className="absolute -bottom-[4.5rem] w-max text-center">
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
            <div className="mt-32 flex justify-between">
                <Button onClick={handlePrev} disabled={isFirstStep}>
                    Prev
                </Button>
                <Button onClick={handleNext} disabled={isLastStep}>
                    Next
                </Button>
            </div>
        </div>
    );
}
