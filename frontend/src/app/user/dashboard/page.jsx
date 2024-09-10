"use client";
import React from "react";
import VenvStatusComponent from "./VenvStatus";
import Link from "next/link";

const UserDashBoard = () => {
    return (
        <>
            <div>UserDashBoard</div>
            <Link href="/user/dashboard/">
                <div>
                    <VenvStatusComponent />
                </div>
            </Link>
        </>
    );
};

export default UserDashBoard;
