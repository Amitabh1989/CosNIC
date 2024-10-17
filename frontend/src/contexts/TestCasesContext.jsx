"use client";
import React, { createContext, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    addToTestCasesCart,
    removeFromTestCaseCart,
} from "../reduxToolkit/selectedTestCaseCartSlice"; // Import your Redux action

export const TestCasesContext = createContext();

export const TestCasesContextProvider = ({ children }) => {
    const dispatch = useDispatch();
    const selectedTestCases = useSelector(
        (state) => state.testCasesCart.selectedTestCases
    );

    const handleTestCasesSelection = useCallback(
        (testCase) => {
            const isSelected = selectedTestCases.some(
                (selectedTestCase) => selectedTestCase.id === testCase.id
            );
            if (isSelected) {
                dispatch(removeFromTestCaseCart(testCase)); // Dispatch Redux action instead of local state management
                return;
            } else {
                dispatch(addToTestCasesCart(testCase)); // Dispatch Redux action instead of local state management
            }
        },
        [dispatch, selectedTestCases]
    );
    return (
        <TestCasesContext.Provider
            value={{ selectedTestCases, handleTestCasesSelection }}
        >
            {children}
        </TestCasesContext.Provider>
    );
};
