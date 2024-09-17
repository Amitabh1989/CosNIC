"use client"; // Next.js-specific directive
import { Provider } from "react-redux"; // Use import instead of require
import { store } from "./store"; // Import store from store.js

export const Providers = ({ children }) => {
    return <Provider store={store}>{children}</Provider>;
};
