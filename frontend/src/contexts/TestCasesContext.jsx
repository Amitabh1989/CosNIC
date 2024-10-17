"use client";
import React, { createContext, useState, useCallback } from "react";

export const TestCasesContext = createContext();

export const TestCasesContextProvider = ({ children }) => {
    const [selectedTestCases, setSelectedTestCases] = useState([]);

    const handleTestCasesSelection = useCallback((id) => {
        setSelectedTestCases((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((testCaseId) => testCaseId !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    }, []);
    return (
        <TestCasesContext.Provider
            value={{ selectedTestCases, handleTestCasesSelection }}
        >
            {children}
        </TestCasesContext.Provider>
    );
};
