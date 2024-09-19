// // const { configureStore } = require("@reduxjs/toolkit");
// import { configureStore } from "@reduxjs/toolkit"; // Use import

// import venvReducer from "./slice"; // renamed to make it clearer

// export const store = configureStore({
//     reducer: {
//         venv: venvReducer, // provide the reducer to the store
//     },
// });

// import userReducer from "./userSlice";

// import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import venvReducer from "./slice";
import { combineReducers } from "redux";

// Create a configuration object for redux-persist
const persistConfig = {
    key: "root", // root key for the persisted state
    storage, // the type of storage (localStorage in this case)
};

// Combine your reducers
export const rootReducer = combineReducers({
    venv: venvReducer,
    // user: userReducer,
});

// Wrap your rootReducer with persistReducer
export const persistedReducer = persistReducer(persistConfig, rootReducer);

// const store = configureStore({
//     reducer: persistedReducer,
//     middleware: (getDefaultMiddleware) =>
//         getDefaultMiddleware({
//             serializableCheck: {
//                 ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
//             },
//         }),
// });

export const store = configureStore({
    reducer: persistedReducer,
    // middleware: getDefaultMiddleware({
    //     serializableCheck: false,
    // }),
});

export const persistor = persistStore(store); // Create a persistor
