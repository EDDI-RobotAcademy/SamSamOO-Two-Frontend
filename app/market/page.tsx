"use client";
import { useState } from "react";

// HTML 태그 제거
const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, "");

export default function MarketPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔎 상품 검색
  const fetchProducts = async () => {
    setLoading(true);
    // ✅ 수정: 백틱(`) 대신 일반 따옴표 사용
    const res = await fetch(`/market/search?query=${query}`);
    const data = await res.json();
    setProducts(data.items || []);
    setLoading(false);
  };

  // ⭐ 리뷰 조회
  const fetchReviews = async (productId: string, productName: string) => {
    const cleanName = stripHtml(productName);

    try {
      console.log('📞 API 호출 시작 - productId:', productId);

      // ✅ 수정: 백틱(`) 사용
      const res = await fetch(`/market/reviews?productId=${productId}`);

      console.log('📡 응답 상태:', res.status);

      if (!res.ok) {
        // ✅ 수정: 백틱(`) 사용
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('📦 받은 데이터:', data);

      const reviewArray = data.reviews || [];

      const normalized = reviewArray.map((r: any) => ({
        nickname: r.nickname ?? "",
        date: r.date ?? "",
        content: r.content ?? "",
        productName: cleanName,
      }));

      console.log('✨ 정규화된 리뷰:', normalized);
      setReviews(normalized);

    } catch (error) {
      console.error('❌ 리뷰 로딩 에러:', error);
      setReviews([]);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">다나와 상품 검색</h1>

      {/* 검색창 */}
      <div className="flex gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="상품명 입력 (예: 로지텍)"
          className="border p-2 rounded w-72"
        />
        <button
          onClick={fetchProducts}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          검색
        </button>
      </div>

      {loading && <p>검색 중...</p>}

      {/* 검색 결과 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.productId} className="border p-3 rounded shadow">
            <img
              src={p.image && p.image.startsWith("http") ? p.image : "/no-image.png"}
              alt={stripHtml(p.name)}
              className="w-full h-40 object-contain"
            />
            <h2 className="font-bold mt-2">{stripHtml(p.name)}</h2>
            <p className="text-gray-600">가격: {p.price}</p>

            <button
              onClick={() => fetchReviews(p.productId, p.name)}
              className="mt-2 w-full bg-green-600 text-white py-1 rounded"
            >
              리뷰 보기
            </button>
          </div>
        ))}
      </div>

      {/* 리뷰 출력 */}
      {reviews.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-3">
            📝 리뷰 ({reviews.length}개)
          </h2>
          <div className="max-w-4xl">
            {reviews.map((r, idx) => (
              <div key={idx} className="border p-4 mb-3 rounded-lg shadow-sm bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-blue-600">👤 {r.nickname}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{r.date}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{r.content}</p>
                {r.productName && (
                  <p className="text-xs text-gray-400 mt-2">
                    제품: {r.productName}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}