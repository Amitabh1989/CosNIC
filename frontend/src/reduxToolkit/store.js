import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import { thunk } from "redux-thunk";
import logger from "redux-logger"; // Import logger middleware
import venvReducer from "./venvSlice";
import testCasesReducer from "./testCasesSlice";
import testCasesCartReducer from "./selectedTestCaseCartSlice";
import stepperReducer from "./stepperSlice";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

// Define a noop storage for SSR (this part is fine)
const createNoopStorage = () => {
    return {
        getItem() {
            return Promise.resolve(null);
        },
        setItem() {
            return Promise.resolve();
        },
        removeItem() {
            return Promise.resolve();
        },
    };
};

// Use localStorage or noopStorage depending on whether window is available
const storageToUse =
    typeof window !== "undefined"
        ? storage // Use localStorage for client-side
        : createNoopStorage(); // Use noop storage for SSR

// // Configure persist config
// const persistConfig = {
//     key: "root",
//     storage: storageToUse, // Use the appropriate storage
//     whitelist: ["venv", "testCases"], // Only persist these reducers
// };

// Configure persist config
const persistConfig = {
    key: "root",
    storage: storageToUse, // Use the appropriate storage
    whitelist: ["venv", "testCasesCart", "stepper"], // Only persist these reducers
};

// Combine reducers
const rootReducer = combineReducers({
    venv: venvReducer,
    testCases: testCasesReducer, // Add your testCases reducer here
    testCasesCart: testCasesCartReducer, // Add your testCases reducer here
    stepper: stepperReducer,
});

// Conditionally wrap rootReducer with persistReducer for CSR
const persistedReducer =
    typeof window !== "undefined"
        ? persistReducer(persistConfig, rootReducer)
        : rootReducer; // Use rootReducer without persistence for SSR

// Configure store with thunk middleware
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Disable serializable check for redux-persist
        }).concat(thunk, logger), // Add loggerMiddleware here
    devTools: process.env.NODE_ENV !== "production", // Enable Redux DevTools
});

export const persistor = persistStore(store);

// Debugging - log the store state after initialization
console.log("Store state after initialization:", store.getState());
