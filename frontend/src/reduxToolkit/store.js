import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import venvReducer from "./slice";

// Step 1: Create the custom noop storage (already done above)
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

const storage =
    typeof window !== "undefined"
        ? require("redux-persist/lib/storage").default // Use localStorage for client-side
        : createNoopStorage(); // Use noop storage for SSR

// Step 2: Create a configuration object for redux-persist
const persistConfig = {
    key: "root", // root key for the persisted state
    storage, // the type of storage (localStorage in this case or noop for SSR)
};

// Combine your reducers
export const rootReducer = combineReducers({
    venv: venvReducer,
    // user: userReducer, // add more reducers if needed
    whitelist: ["venv"], // only persist the venv slice
});

// Wrap your rootReducer with persistReducer
export const persistedReducer = persistReducer(persistConfig, rootReducer);

// Step 3: Set up the store with the persisted reducer
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

// Step 4: Set up the persistor
export const persistor = persistStore(store);
