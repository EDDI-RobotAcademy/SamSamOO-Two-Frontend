"use client";

import Image from "next/image";
import Link from "next/link";
import {useAuth} from "../contexts/AuthContext";

export default function Home() {
    const {isLoggedIn} = useAuth();
    const handleGoogleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_GOOGLE_LOGIN_PATH}`;
    };
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
            <Image
                src="/samsam.svg"
                alt="Next.js Logo"
                width={120}
                height={40}
                className="dark:invert mb-8"
                priority
            />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to SAMSAMOO 👋
        </h1>

        {!isLoggedIn && ( //로그인 여부에 따라 버튼 숨기기
            <button
                onClick={handleGoogleLogin}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Go to Login
            </button>
            )}
        </div>
    );
}
