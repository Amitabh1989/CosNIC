import React, { useState, useEffect, use } from "react";

import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    List,
    ListItem,
    Checkbox,
} from "@material-tailwind/react";

// First allow for single test case then allow selection for all test Cases
const SubTestSelectionComp = ({ tcRecord, setOpen }) => {
    const [testCaseRecord, setTestCaseRecord] = useState(tcRecord);
    const [selectedSubtest, setSelectedSubtest] = useState(null);
    // const [open, setOpen] = React.useState(false);
    const [selected, setSelected] = React.useState(1);
    const setSelectedItem = (value) => setSelected(value);
    const [subTests, setSubtests] = useState(testCaseRecord?.subtests || []);

    // const handleOpen = () => setOpen(!open);
    console.log("Test case record is: ", testCaseRecord);

    return (
        <>
            <Dialog open={open} handler={setOpen}>
                <DialogHeader>
                    Select subtests to run, default is all
                </DialogHeader>
                <DialogBody className="overflow-y-scroll">
                    <List>
                        {subTests?.map((subtest, index) => {
                            return (
                                <ListItem className="-m-3">
                                    <Checkbox
                                        id={index}
                                        label={subtest.name}
                                        ripple={false}
                                        defaultChecked
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={() => setOpen(false)}
                        className="mr-1"
                    >
                        <span>Cancel</span>
                    </Button>
                    <Button variant="gradient" color="green" onClick={setOpen}>
                        <span>Confirm</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
};

export default SubTestSelectionComp;
