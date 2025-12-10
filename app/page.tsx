"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:33333";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [stats, setStats] = useState<{
    totalProducts: number;
    platformDistribution: Record<string, { count: number; percentage: number }>;
    categoryDistribution: Record<string, { count: number; percentage: number }>;
  }>({
    totalProducts: 0,
    platformDistribution: {},
    categoryDistribution: {},
  });
  const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000); // 7초 타임아웃

    try {
      const res = await fetch(`${API_BASE_URL}/authentication/status`, {
        credentials: "include",
        signal: ctrl.signal,
      });

      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = await res.json();
      if (data?.logged_in) {
        setIsLoggedIn(true);
        await fetchDashboardData();
      } else {
        setIsLoggedIn(false);
      }
    } catch (e: any) {
      if (e?.name === "AbortError") {
        // logout시 무시
        return;
      }

      if (e?.message?.includes("Failed to fetch")) {
        // 로그아웃 상태거나 서버가 응답 안하는 경우 — 정상상황으로 간주
        console.debug("[Auth] No session or server unreachable. Treat as logged-out.");
        setIsLoggedIn(false);
        return;
      }

      // 그 외 진짜 오류만 표시
      console.error("인증 상태 확인 실패:", e);
      setIsLoggedIn(false);
    } finally {
      clearTimeout(t);
      setIsCheckingAuth(false);
      setIsLoading(false);
    }
  };


  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}${process.env.NEXT_PUBLIC_GOOGLE_LOGIN_PATH}`;
  };

  // 로그아웃 이벤트 감지
  useEffect(() => {
    const handleLogoutEvent = () => {
      // 로그아웃 시 상태 초기화 및 비로그인 화면으로 전환
      setIsLoggedIn(false);
      setIsCheckingAuth(false);
      setIsLoading(false);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'logout') {
        handleLogoutEvent();
      }
    };

    window.addEventListener('logout', handleLogoutEvent);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('logout', handleLogoutEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 로그아웃 이벤트 감지 (다른 컴포넌트에서 로그아웃 시)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'logout') {
        checkAuthStatus();
      }
    };

    // 커스텀 이벤트 리스너 (같은 탭에서의 로그아웃 감지)
    const handleLogoutEvent = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleLogoutEvent);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 백엔드 대시보드 API 호출
      const response = await fetch(`${API_BASE_URL}/dashboard/statistics`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("통계 데이터 로드 실패");
      }
      
      const data = await response.json();
      
      // API 응답 구조에 맞게 state 업데이트
      setStats({
        totalProducts: data.total_products || 0,
        platformDistribution: data.platform_distribution || {},
        categoryDistribution: data.category_distribution || {},
      });
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      // 에러 시 빈 데이터로 초기화
      setStats({
        totalProducts: 0,
        platformDistribution: {},
        categoryDistribution: {},
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 비로그인 상태 화면
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <Image
            src="/samsam.svg"
            alt="SamSamOO Logo"
            width={120}
            height={40}
            className="dark:invert mb-6"
            priority
          />
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3 text-center">
            Welcome to <span className="text-blue-600">SAMSAMOO</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 text-center">
            AI 기반 상품 리뷰 분석 플랫폼
          </p>

          {/* 서비스 소개 카드 */}
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <div className="text-5xl mb-4">🛍️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                상품 관리
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                등록된 상품을 한눈에 확인하고 효율적으로 관리하세요
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                리뷰 수집
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                11번가, 롯데온, 다나와 등 다양한 플랫폼의 리뷰를 수집할 수 있습니다
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                AI 분석
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                수집된 리뷰를 AI가 분석하여 인사이트를 제공합니다
              </p>
            </div>
          </div>

          {/* 로그인 유도 섹션 */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl p-10 text-white max-w-2xl w-full text-center">
            <h2 className="text-3xl font-bold mb-4">
              지금 로그인하고 시작하세요!
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              로그인하시면 상품 분석과 리뷰 수집 등<br />
              모든 기능을 바로 이용하실 수 있습니다
            </p>
            <button
              onClick={handleLogin}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
            >
              구글로 로그인하기
            </button>
          </div>

          {/* 추가 안내 */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              📊 상품 데이터 분석부터 리뷰 크롤링까지, 모든 것을 한 곳에서
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 로그인 상태 화면 (대시보드)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4">
        <Image
          src="/samsam.svg"
          alt="SamSamOO Logo"
          width={120}
          height={40}
          className="dark:invert mb-6"
          priority
        />
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
          Welcome to <span className="text-blue-600">SAMSAMOO</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          AI 기반 상품 리뷰 분석 플랫폼
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* 주요 기능 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* 상품 관리 */}
          <Link
            href="/product/list"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              상품 관리
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              등록된 상품을 확인하고 관리하세요
            </p>
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              <span className="font-medium">바로가기</span>
              <span className="ml-2">→</span>
            </div>
          </Link>

          {/* 상품 등록 */}
          <Link
            href="/product/register"
            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1 text-white"
          >
            <div className="text-5xl mb-4">➕</div>
            <h3 className="text-2xl font-bold mb-3">
              상품 등록
            </h3>
            <p className="text-blue-100 mb-4">
              새로운 상품을 등록하고 리뷰를 수집하세요
            </p>
            <div className="flex items-center">
              <span className="font-medium">시작하기</span>
              <span className="ml-2">→</span>
            </div>
          </Link>
        </div>

        {/* 그래프 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 플랫폼별 분포 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              플랫폼별 상품 분포
            </h3>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center text-gray-500">로딩 중...</div>
              ) : Object.keys(stats.platformDistribution).length === 0 ? (
                <div className="text-center text-gray-500">등록된 상품이 없습니다</div>
              ) : (
                Object.entries(stats.platformDistribution).map(([platform, data]) => {
                  const platformNames: Record<string, string> = {
                    elevenst: "11번가",
                    lotteon: "롯데온",
                    danawa: "다나와",
                  };
                  
                  const platformColors: Record<string, string> = {
                    elevenst: "bg-orange-500",
                    lotteon: "bg-red-500",
                    danawa: "bg-blue-500",
                  };
                  
                  return (
                    <div key={platform}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          {platformNames[platform] || platform}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {data.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className={`${platformColors[platform] || "bg-gray-500"} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${data.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 카테고리별 분포 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              카테고리별 분포
            </h3>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center text-gray-500">로딩 중...</div>
              ) : Object.keys(stats.categoryDistribution).length === 0 ? (
                <div className="text-center text-gray-500">등록된 상품이 없습니다</div>
              ) : (
                Object.entries(stats.categoryDistribution).map(([category, data]) => {
                  const categoryNames: Record<string, string> = {
                    FOOD: "식품",
                    DIGITAL: "디지털/가전",
                    CLOTHING: "의류",
                    ETC: "기타",
                  };
                  
                  const categoryColors: Record<string, string> = {
                    FOOD: "bg-blue-500",
                    DIGITAL: "bg-purple-500",
                    CLOTHING: "bg-pink-500",
                    ETC: "bg-indigo-500",
                  };
                  
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          {categoryNames[category] || category}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {data.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className={`${categoryColors[category] || "bg-gray-500"} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${data.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
