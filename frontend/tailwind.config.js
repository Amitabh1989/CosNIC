// /** @type {import('tailwindcss').Config} */
// /* styles/globals.css */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
    content: ["./pages/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Roboto", "sans-serif"],
                poppins: ["Poppins", "sans-serif"],
                nunito: ["Nunito", "sans-serif"],
                quicksand: ["Quicksand", "sans-serif"],
            },
        },
    },
    plugins: [],
});

// module.exports = {
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         background: "var(--background)",
//         foreground: "var(--foreground)",
//       },
//     },
//   },
//   plugins: [],
// };
