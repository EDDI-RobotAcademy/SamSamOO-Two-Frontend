"use client";
import { useState } from "react";

// ⭐ HTML 태그 제거 함수 추가
const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, "");

export default function MarketPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔎 상품 검색 요청 (Next API 호출)
  const fetchProducts = async () => {
    setLoading(true);

    const res = await fetch(`/market/search?q=${query}`);
    const data = await res.json();

    setProducts(data.items || []);
    setLoading(false);
  };

const fetchReviews = async (catalogId: string, productName: string) => {
  const cleanName = stripHtml(productName);

  const res = await fetch(
    `/market/reviews?catalogId=${catalogId}?query=${encodeURIComponent(cleanName)}`
  );

  if (!res.ok) {
    console.error("리뷰 API 오류:", res.status);
    return;
  }

  const data = await res.json();

  const reviewArray = data.reviews?.contents || [];

  const normalized = reviewArray.map((r: any) => ({
    rating: r.reviewScore ?? 0,
    content: r.reviewContent ?? "",
    productName: cleanName,
  }));

  setReviews(normalized);
};


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">네이버 스토어 상품 검색</h1>

      {/* 검색창 */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="상품명 입력 (예: 노트북)"
          className="border p-2 rounded w-64"
        />

        <button
          onClick={fetchProducts}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          검색
        </button>
      </div>

      {/* 로딩 */}
      {loading && <p>검색 중...</p>}

      {/* 검색 결과 */}
      <div className="grid grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.productId} className="border p-3 rounded shadow">
            <img src={p.image} className="w-full h-40 object-contain" />

            <h2
              className="font-bold mt-2"
              dangerouslySetInnerHTML={{ __html: p.name }}
            />

            <p className="text-gray-600">가격: {p.price}원</p>
            <p className="text-sm text-gray-500">{p.mall}</p>

            <button
              onClick={() => fetchReviews(p.catalogId, p.name)}
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
          <h2 className="text-xl font-bold mb-3">리뷰</h2>

          {reviews.map((r, idx) => (
            <div key={idx} className="border p-3 mb-2 rounded">
              <p>⭐ {r.rating}</p>
              <p>{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
