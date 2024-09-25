// import { persistor } from "./store";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/reduxToolkit/provider";
// import { PersistGate } from "redux-persist/integration/react";
// import { persistor } from "@/reduxToolkit/store";

// const geistSans = localFont({
//     src: "./fonts/GeistVF.woff",
//     variable: "--font-geist-sans",
//     weight: "100 900",
// });
// const geistMono = localFont({
//     src: "./fonts/GeistMonoVF.woff",
//     variable: "--font-geist-mono",
//     weight: "100 900",
// });
// {/*  className={`${geistSans.variable} ${geistMono.variable} antialiased`} */}

export const metadata = {
    title: "CosNIC : The Cosmos of NIC Testing",
    description: "The Cosmos of NIC Testing",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {/* <PersistGate loading={null} persistor={persistor}> */}
                    {children}
                    {/* </PersistGate> */}
                </Providers>
            </body>
        </html>
    );
}
