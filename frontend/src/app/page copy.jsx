import Image from "next/image";
import Link from "next/link";
import { ThemeProvider } from "@material-tailwind/react";
import { TestCasesProvider } from "@/contexts/TestCasesContext";
import "../styles/globals.css";
import Head from "next/head";

export default function Home() {
    return (
        <ThemeProvider>
            <TestCasesProvider>
                <Head>
                    <link
                        rel="preconnect"
                        href="https://fonts.googleapis.com"
                    />
                    <link
                        rel="preconnect"
                        href="https://fonts.gstatic.com"
                        crossOrigin="true"
                    />
                    {/* <link
                        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Nunito:wght@400;600&family=Quicksand:wght@400;500&display=swap"
                        rel="stylesheet"
                    /> */}
                    <link rel="stylesheet" href="globals.css"></link>
                </Head>
                <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
                    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                        <h1 className="text-3xl font-bold">CosNIC</h1>
                        {/* // <Link href="https://www.flaticon.com/free-icons/cosmic" title="cosmic icons"></Link> */}
                        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                            <li>Save and see your changes instantly.</li>
                            <li className="mb-2 mt-2">
                                <Link href="/user/profile">User Profile</Link>
                            </li>
                            <li className="mb-2 mt-2">
                                <Link href="/user/dashboard">
                                    User Dashboard
                                </Link>
                            </li>
                            <li className="mb-2 mt-2">
                                <Link href="/testcases">Test Cases</Link>
                            </li>
                        </ol>
                    </main>
                    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
                        <a
                            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image
                                aria-hidden
                                src="https://nextjs.org/icons/file.svg"
                                alt="File icon"
                                width={16}
                                height={16}
                            />
                            Learn
                        </a>
                    </footer>
                </div>
            </TestCasesProvider>
        </ThemeProvider>
    );
}
