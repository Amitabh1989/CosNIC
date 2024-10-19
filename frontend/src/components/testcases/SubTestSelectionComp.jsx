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
    Typography,
    select,
} from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import {
    saveSubTestSelection,
    // finalizeTestCasesCart,
} from "@/reduxToolkit/selectedTestCaseCartSlice";
import { add } from "lodash";

// First allow for single test case then allow selection for all test Cases
const SubTestSelectionComp = ({ tcRecord, setOpen }) => {
    const dispatch = useDispatch();
    const testCasesCart = useSelector(
        (state) => state.testCasesCart.selectedTestCases
    );
    console.log("TC record in subselection is : ", tcRecord);
    const [testCaseRecord, setTestCaseRecord] = useState(
        testCasesCart.find((testCase) => testCase.id === tcRecord)
    ); // Initialize from tcRecord
    const [subTests, setSubtests] = useState(testCaseRecord?.subtests || []);

    const [loaded, setLoaded] = useState(false);

    const handleSubtestSelection = (index) => {
        console.log(`Subtest Index is: ${index}`);
        console.log(`Subtest is: ${subTests}`);
        const updatedSubtests = subTests.map((subtest, i) => {
            if (i === index) {
                return {
                    ...subtest,
                    selected:
                        subtest.selected === undefined
                            ? true
                            : !subtest.selected,
                };
            }

            return subtest;
        });
        console.log(
            `Updated subtests are: ${JSON.stringify(updatedSubtests[0])}`
        );
        setSubtests(updatedSubtests);
        setTestCaseRecord({ ...testCaseRecord, subtests: updatedSubtests });
        dispatch(
            saveSubTestSelection({
                testCaseId: testCaseRecord.id,
                subTestSelection: updatedSubtests,
            })
        );
    };

    useEffect(() => {
        if (!loaded) {
            console.log("useEfect of modal subtest is on");
            const updatedSubtests = subTests.map((subtest) => {
                if (subtest.selected === undefined) {
                    return { ...subtest, selected: true };
                }
                return subtest;
            });
            setSubtests(updatedSubtests);
        } else {
            return () => {
                setLoaded(true);
            };
        }
    }, []);

    console.log("Test case record in subtest selection is : ", testCaseRecord);

    return (
        <>
            <Dialog open={open} handler={setOpen}>
                <DialogHeader>
                    <Typography variant="h4">
                        Select subtests to run, default is all
                    </Typography>
                </DialogHeader>
                <DialogBody className="overflow-y-scroll">
                    <List>
                        {subTests.map((subtest, index) => {
                            return (
                                <ListItem className="-m-3" key={index}>
                                    <Checkbox
                                        id={index}
                                        label={subtest.name}
                                        ripple={true}
                                        checked={subtest.selected}
                                        onChange={() =>
                                            handleSubtestSelection(index)
                                        }
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
                        onClick={setOpen}
                        className="mr-1"
                    >
                        <span>Cancel</span>
                    </Button>
                    <Button
                        variant="gradient"
                        color="green"
                        onClick={() => {
                            dispatch(
                                saveSubTestSelection({
                                    testCaseId: testCaseRecord.id,
                                    subTestSelection: subTests,
                                })
                            );
                            setOpen();
                        }}
                    >
                        <span>Confirm</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
};

export default SubTestSelectionComp;
