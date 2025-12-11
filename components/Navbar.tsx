"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // 모든 탭에 로그아웃 신호
      localStorage.setItem("logout", String(Date.now()));
      window.dispatchEvent(new Event("logout"));
      router.replace("/");
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="text-lg font-bold">
        <Link href="/">상품 분석 시스템</Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* 항상 노출 */}
        <Link href="/" className="hover:text-gray-300">Home</Link>
        {/* 로그인된 경우에만 노출 */}
        {isLoggedIn && (
          <>
            <Link href="/market" className="hover:text-gray-300">상품 검색</Link>
            <Link href="/product/register" className="hover:text-gray-300">상품 등록</Link>
            <Link href="/product/list" className="hover:text-gray-300">상품 관리</Link>
          </>
        )}

        {isLoggedIn ? (
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-300">{user?.email}</div>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login" className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
