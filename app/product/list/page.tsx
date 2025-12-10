"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPlatformDisplayName, getPlatformBadgeColor } from '../../util/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:33333";

interface Product {
  source: string;
  source_product_id: string;
  title: string;
  source_url: string;
  price: number;
  category: string;
  status: string;
  collected_at: string;
}

export default function ProductListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 상품 목록 불러오기
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/list?limit=50`);
      if (!response.ok) throw new Error("상품 목록을 불러오는데 실패했습니다.");
      
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 상품 삭제
  const handleDelete = async (source: string, productId: string) => {
    if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/product/delete?source=${source}&source_product_id=${productId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("삭제에 실패했습니다.");

      alert("상품이 삭제되었습니다.");
      fetchProducts(); // 목록 새로고침
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              상품 목록
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              총 {products.length}개의 상품
            </p>
          </div>
          <Link
            href="/product/register"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + 상품 등록
          </Link>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 상품 목록 */}
        {products.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              등록된 상품이 없습니다
            </p>
            <Link
              href="/product/register"
              className="text-blue-600 hover:underline"
            >
              첫 상품 등록하기 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={`${product.source}-${product.source_product_id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6"
              >
                {/* 플랫폼 배지 */}
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPlatformBadgeColor(
                      product.source
                    )}`}
                  >
                    {getPlatformDisplayName(product.source)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {product.category}
                  </span>
                </div>

                {/* 상품 정보 */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {product.price?.toLocaleString()}원
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  ID: {product.source_product_id}
                </p>

                {/* 버튼 그룹 */}
                <div className="flex gap-2">
                  <a
                    href={product.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition"
                  >
                    원본 보기
                  </a>
                  <button
                    onClick={() =>
                      router.push(
                        `/product/detail?source=${product.source}&id=${product.source_product_id}`
                      )
                    }
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700 text-sm transition"
                  >
                    상세보기
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(product.source, product.source_product_id)
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}