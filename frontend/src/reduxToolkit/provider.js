"use client"; // Next.js-specific directive
import { Provider } from "react-redux"; // Use import instead of require
// import { store } from "./store"; // Import store from store.js
import { store } from "./store";

import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@/reduxToolkit/store";

{
    /* <PersistGate loading={null} persistor={persistor}> */
}

export const Providers = ({ children }) => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
};
