"use client";
import React from "react";
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";

const ReviewSelections = () => {
    // Show the selected Venvironments, Test Cases, and Config Files
    // Allow user to review and confirm their selections
    const dispatch = useDispatch();
    const stepper = useSelector((state) => state.stepper);
    const [open, setOpen] = React.useState(1);

    const handleOpen = (value) => setOpen(open === value ? 0 : value);

    return (
        <>
            <Accordion open={open === 1}>
                <AccordionHeader onClick={() => handleOpen(1)}>
                    Review Virtual Environment selection
                </AccordionHeader>
                <AccordionBody>
                    We&apos;re not always in the position that we want to be at.
                    We&apos;re constantly growing. We&apos;re constantly making
                    mistakes. We&apos;re constantly trying to express ourselves
                    and actualize our dreams.
                </AccordionBody>
            </Accordion>
            <Accordion open={open === 2}>
                <AccordionHeader onClick={() => handleOpen(2)}>
                    Review Test Case selection
                </AccordionHeader>
                <AccordionBody>
                    We&apos;re not always in the position that we want to be at.
                    We&apos;re constantly growing. We&apos;re constantly making
                    mistakes. We&apos;re constantly trying to express ourselves
                    and actualize our dreams.
                </AccordionBody>
            </Accordion>
            <Accordion open={open === 3}>
                <AccordionHeader onClick={() => handleOpen(3)}>
                    Review Config File selection
                </AccordionHeader>
                <AccordionBody>
                    We&apos;re not always in the position that we want to be at.
                    We&apos;re constantly growing. We&apos;re constantly making
                    mistakes. We&apos;re constantly trying to express ourselves
                    and actualize our dreams.
                </AccordionBody>
            </Accordion>
        </>
    );
};

export default ReviewSelections;
