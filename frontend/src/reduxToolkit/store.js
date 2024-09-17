// const { configureStore } = require("@reduxjs/toolkit");
import { configureStore } from "@reduxjs/toolkit"; // Use import

import venvReducer from "./slice"; // renamed to make it clearer

export const store = configureStore({
    reducer: {
        venv: venvReducer, // provide the reducer to the store
    },
});
