"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:33333";

export default function Home() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalReviews: 0,
    avgRating: 0,
    recentProducts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 실제로는 백엔드에서 통계 데이터를 가져와야 하지만, 임시로 목 데이터 사용
      const response = await fetch(`${API_BASE_URL}/product/list?limit=100`);
      const products = await response.json();
      
      setStats({
        totalProducts: products.length,
        totalReviews: Math.floor(Math.random() * 500) + 100, // 임시 데이터
        avgRating: Number((Math.random() * 2 + 3).toFixed(1)),  // 3.0 ~ 5.0
        recentProducts: products.filter((p: any) => {
          const date = new Date(p.collected_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date > weekAgo;
        }).length,
      });
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          Welcome to <span className="text-blue-600">SAMSAMOO</span> 👋
          
        </h1>
        <h2>아래 view는 보여지는 것일 뿐 전부 정리할 예정입니다.</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          AI 기반 상품 리뷰 분석 플랫폼
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* 총 상품 수 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">총 상품 수</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : stats.totalProducts}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{stats.recentProducts} 이번 주
                </p>
              </div>
              <div className="text-4xl">🛍️</div>
            </div>
          </div>

          {/* 총 리뷰 수 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">수집된 리뷰</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : stats.totalReviews}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">전체 플랫폼</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </div>

          {/* 평균 평점 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">평균 평점</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : stats.avgRating}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">/ 5.0</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          {/* AI 분석 완료 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">AI 분석 완료</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : Math.floor(stats.totalProducts * 0.8)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {isLoading ? "..." : Math.floor((stats.totalProducts * 0.8 / stats.totalProducts) * 100)}% 완료
                </p>
              </div>
              <div className="text-4xl">🤖</div>
            </div>
          </div>
        </div>

        {/* 주요 기능 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

          {/* 리뷰 크롤링 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              리뷰 크롤링
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              11번가, 롯데온 등 다양한 플랫폼 지원
            </p>
            <div className="flex items-center text-purple-600 dark:text-purple-400">
              <span className="font-medium">자동 수집</span>
              <span className="ml-2">✓</span>
            </div>
          </div>
        </div>

        {/* 그래프 섹션 (임시 데이터) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* 플랫폼별 분포 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              플랫폼별 상품 분포
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">롯데온</span>
                  <span className="font-medium text-gray-900 dark:text-white">45%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-red-500 h-3 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">11번가</span>
                  <span className="font-medium text-gray-900 dark:text-white">35%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-orange-500 h-3 rounded-full" style={{ width: "35%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">G마켓</span>
                  <span className="font-medium text-gray-900 dark:text-white">20%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: "20%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 카테고리별 분포 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              카테고리별 분포
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">식품 (FOOD)</span>
                  <span className="font-medium text-gray-900 dark:text-white">40%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: "40%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">디지털/가전</span>
                  <span className="font-medium text-gray-900 dark:text-white">30%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-purple-500 h-3 rounded-full" style={{ width: "30%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">기타</span>
                  <span className="font-medium text-gray-900 dark:text-white">30%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-indigo-500 h-3 rounded-full" style={{ width: "30%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 액션 버튼 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">지금 바로 시작하세요!</h3>
              <p className="text-blue-100">상품을 등록하고 AI 기반 리뷰 분석을 경험하세요</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/product/register"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                상품 등록하기
              </Link>
              <a
                href={`${API_BASE_URL}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-600 transition"
              >
                API 문서 보기
              </a>
            </div>
          </div>
        </div>
      </div>
        </div>
    );
}
