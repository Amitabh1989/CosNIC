"use client"
import React, { useState, useEffect, useMemo } from "react";
import { getTestCasesListAPI } from "@/api/testCase_apis";

const TestCaseComponent = () => {
    const [expanded, setExpanded] = useState(false);
    const [selectedTestCase, setSelectedTestCase] = useState([]);

    const fetchTestCasesList = async () => { 
        try {
            const response = await
        } catch (error) {
            console.log("Error in fetching test cases list", error);
        }
    }



    return <div>TestCaseComponent</div>;
};

export default TestCaseComponent;
