// import { configureStore } from "@reduxjs/toolkit";
// import { persistStore, persistReducer } from "redux-persist";
// import { combineReducers } from "redux";
// // import venvReducer, { testCasesReducer } from "./slice";
// import thunk from "redux-thunk";
// import venvReducer from "./slice";
// import testCasesReducer from "./testCasesSlice";
// // import { createIndexedDBStorage } from "redux-persist-indexeddb-storage"; // For IndexedDB
// import storage from "redux-persist-indexeddb-storage";

// // Step 1: Set up IndexedDB storage for redux-persist
// const persistConfig = {
//     key: "root",
//     // storage: createIndexedDBStorage("CosNICReduxDB"), // Use IndexedDB instead of localStorage
//     storage: storage("CosNICReduxDB"), // Use IndexedDB instead of localStorage
//     whitelist: ["venv", "testCases"], // Only persist venv slice for now, extend as needed
// };

// // Combine your reducers
// export const rootReducer = combineReducers({
//     venv: venvReducer,
//     testCases: testCasesReducer,
// });

// // Wrap your rootReducer with persistReducer
// export const persistedReducer = persistReducer(persistConfig, rootReducer);

// // Step 3: Set up the store with the persisted reducer
// export const store = configureStore({
//     reducer: persistedReducer,
//     middleware: (getDefaultMiddleware) =>
//         getDefaultMiddleware({
//             serializableCheck: false,
//         }).concat(thunk), // Add thunk middleware,
//     devTools: process.env.NODE_ENV !== "production", // Enable Redux DevTools in development
// });

// // Step 4: Set up the persistor
// export const persistor = persistStore(store);

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import thunk from "redux-thunk";
import venvReducer from "./venvSlice";
import testCasesReducer from "./testCasesSlice";
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

// Configure persist config
const persistConfig = {
    key: "root",
    storage: storageToUse, // Use the appropriate storage
    whitelist: ["venv", "testCases"], // Only persist these reducers
};

// Combine reducers
const rootReducer = combineReducers({
    venv: venvReducer,
    testCases: testCasesReducer, // Add your testCases reducer here
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
        }).concat(thunk, loggerMiddleware), // Add logger here
    devTools: process.env.NODE_ENV !== "production", // Enable Redux DevTools
});

// Conditionally set up persistor only for CSR
// export const persistor =
//     typeof window !== "undefined" ? persistStore(store) : null;
export const persistor = persistStore(store);

// Debugging - log the store state after initialization
console.log("Store state after initialization:", store.getState());
