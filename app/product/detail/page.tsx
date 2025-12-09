"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPlatformDisplayName, getPlatformBadgeColor } from '../../util/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:33333";

interface Product {
  source: string;
  source_product_id: string;
  title: string;
  url: string;
  price: number;
  category: string;
  status: string;
  analysis_status: string;
  seller: string | null;
  rating: number | null;
  review_count: number;
  collected_at: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const id = searchParams.get("id");

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (source && id) {
      fetchProductDetail();
    }
  }, [source, id]);

  const fetchProductDetail = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/product/read?source=${source}&source_product_id=${id}`
      );

      if (!response.ok) {
        throw new Error("상품을 찾을 수 없습니다.");
      }

      const data = await response.json();
      setProduct(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/product/delete?source=${source}&source_product_id=${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("삭제에 실패했습니다.");

      alert("상품이 삭제되었습니다.");
      router.push("/product/list");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startCrawling = async () => {
    if (!product) return;

    try {
      const response = await fetch(`${API_BASE_URL}/review/crawl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: product.source,
          product_id: product.source_product_id,
        }),
      });

      if (!response.ok) throw new Error("크롤링 시작에 실패했습니다.");

      const data = await response.json();
      alert(`크롤링 완료! ${data.review_count || 0}개의 리뷰를 수집했습니다.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error || "상품을 찾을 수 없습니다."}
          </div>
          <Link
            href="/product/list"
            className="text-blue-600 hover:underline"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href="/product/list"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>

        {/* 상품 상세 정보 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          {/* 플랫폼 배지 */}
          <div className="flex justify-between items-start mb-6">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getPlatformBadgeColor(
                product.source
              )}`}
            >
              {getPlatformDisplayName(product.source)}
            </span>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {product.category}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {product.status}
              </span>
            </div>
          </div>

          {/* 상품명 */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {product.title}
          </h1>

          {/* 가격 */}
          <div className="mb-6">
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {product.price?.toLocaleString()}원
            </p>
          </div>

          {/* 상품 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">상품 ID</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.source_product_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">등록일</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(product.collected_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">리뷰 수</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.review_count || 0}개
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">평균 평점</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.rating ? `${product.rating} / 5.0` : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                분석 상태
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.analysis_status}
              </p>
            </div>
            {product.seller && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  판매자
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {product.seller}
                </p>
              </div>
            )}
          </div>

          {/* 버튼 그룹 */}
          <div className="flex flex-wrap gap-4">
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 transition"
            >
              원본 페이지 보기
            </a>
            <button
              onClick={startCrawling}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              리뷰 크롤링 시작
            </button>
            <Link
              href={`/product/edit?source=${product.source}&id=${product.source_product_id}`}
              className="flex-1 px-6 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition"
            >
              수정
            </Link>
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              삭제
            </button>
          </div>
        </div>

        {/* 리뷰 섹션 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            리뷰 분석
          </h2>
          {product.review_count > 0 ? (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                총 {product.review_count}개의 리뷰가 수집되었습니다.
              </p>
              <Link
                href={`/review/list?source=${product.source}&product_id=${product.source_product_id}`}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block"
              >
                리뷰 목록 보기
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                아직 수집된 리뷰가 없습니다.
              </p>
              <button
                onClick={startCrawling}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                리뷰 크롤링 시작하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}