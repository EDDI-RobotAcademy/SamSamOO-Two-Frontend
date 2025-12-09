"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { isLoggedIn, user, logout, login } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const handleLogin = () => {
        window.location.href =
          `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_GOOGLE_LOGIN_PATH}`;
    };

    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between">
            <div className="text-lg font-bold">
                <Link href="/">상품 분석 시스템</Link>
            </div>

            <div className="flex items-center space-x-4">
                <Link href="/" className="hover:text-gray-300">Home</Link>
                <Link href="/market">DANAWA</Link>
                <Link href="/product/list" className="hover:text-gray-300">상품 관리</Link>
                <Link href="/product/register" className="hover:text-gray-300">상품 등록</Link>
                
                {isLoggedIn ? (
                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <div className="text-xs text-gray-300">{user?.email}</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                    >
                        Logout
                    </button>
                ) : (
                    <button
                        onClick={handleLogin}
                        className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                    >
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
}