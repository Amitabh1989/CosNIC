"use client";
import React from "react";
import UserLoginForm from "../../../components/login/UserLogin";
// import Link from "next/link";

const UserLogin = () => {
    return (
        <>
            <div className="w-full h-full overflow-hidden">
                User Login
                <UserLoginForm />
            </div>
            ;
        </>
    );
};

export default UserLogin;
