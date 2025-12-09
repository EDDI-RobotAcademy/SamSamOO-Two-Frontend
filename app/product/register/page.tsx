"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    source: "lotteon",
    source_product_id: "",
    title: "",
    source_url: "",
    price: "",
    category: "FOOD",
  });

  // 입력값 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:33333/product/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "상품 등록에 실패했습니다.");
      }

      setSuccess("상품이 성공적으로 등록되었습니다!");
      
      // 3초 후 목록 페이지로 이동
      setTimeout(() => {
        router.push("/product/list");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // URL에서 상품 ID 자동 추출 (롯데온 예시)
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, source_url: url }));

    // 롯데온 URL에서 상품 ID 추출
    if (url.includes("lotteon.com")) {
      const match = url.match(/\/product\/(LO\d+)/);
      if (match) {
        setFormData((prev) => ({
          ...prev,
          source: "lotteon",
          source_product_id: match[1],
        }));
      }
    }
    // 11번가 URL에서 상품 ID 추출
    else if (url.includes("11st.co.kr")) {
      const match = url.match(/\/products\/(\d+)/);
      if (match) {
        setFormData((prev) => ({
          ...prev,
          source: "elevenst",
          source_product_id: match[1],
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            상품 등록
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            새로운 상품 정보를 입력하여 등록하세요
          </p>
        </div>

        {/* 알림 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">오류 발생</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <p className="font-medium">✅ {success}</p>
            <p className="text-sm">잠시 후 목록 페이지로 이동합니다...</p>
          </div>
        )}

        {/* 폼 */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 space-y-6"
        >
          {/* 플랫폼 선택 */}
          <div>
            <label
              htmlFor="source"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              플랫폼 <span className="text-red-500">*</span>
            </label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="lotteon">롯데온 (Lotteon)</option>
              <option value="elevenst">11번가 (11st)</option>
            </select>
          </div>

          {/* 상품 URL */}
          <div>
            <label
              htmlFor="source_url"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              상품 URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="source_url"
              name="source_url"
              value={formData.source_url}
              onChange={handleUrlChange}
              placeholder="https://www.lotteon.com/p/product/LO2482562708"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              💡 URL을 입력하면 상품 ID가 자동으로 추출됩니다
            </p>
          </div>

          {/* 상품 ID */}
          <div>
            <label
              htmlFor="source_product_id"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              상품 ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="source_product_id"
              name="source_product_id"
              value={formData.source_product_id}
              onChange={handleChange}
              placeholder="LO2482562708 또는 3440820771"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* 상품명 */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              상품명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="메디셀온 TN 솔루션 고농축 문제성발톱 앰플"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* 가격 */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              가격 (원) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="20000"
              min="0"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="FOOD">식품 (FOOD)</option>
              <option value="DIGITAL">디지털/가전 (DIGITAL)</option>
              <option value="CLOTHING">의류/패션 (CLOTHING)</option>
              <option value="ETC">기타 (ETC)</option>
            </select>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "등록 중..." : "상품 등록"}
            </button>
          </div>
        </form>

        {/* 도움말 */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
            💡 사용 팁
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• 상품 URL을 입력하면 플랫폼과 상품 ID가 자동으로 입력됩니다</li>
            <li>• 모든 필수 항목(*)을 입력해야 등록할 수 있습니다</li>
            <li>• 등록 후 자동으로 상품 목록 페이지로 이동합니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}