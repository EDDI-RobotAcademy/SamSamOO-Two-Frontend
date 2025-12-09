"use client";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';

const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, "");

export default function MarketPage() {  // ⭐ 이 부분 확인!
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState("");
  const [statistics, setStatistics] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // 상품 검색
  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch(`/market/search?query=${query}`);
    const data = await res.json();
    setProducts(data.items || []);
    setLoading(false);
  };

  // 리뷰 조회
  const fetchReviews = async (productId: string, productName: string) => {
    const cleanName = stripHtml(productName);
    setSelectedProduct(cleanName);
    setLoadingReviews(true);
    setAnalysis("");
    setStatistics(null);

    try {
      const res = await fetch(`/market/reviews?productId=${productId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const reviewArray = data.reviews || [];

      const normalized = reviewArray.map((r: any) => ({
        nickname: r.nickname ?? "",
        date: r.date ?? "",
        content: r.content ?? "",
        productName: cleanName,
      }));

      setReviews(normalized);
    } catch (error) {
      console.error('리뷰 로딩 에러:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // AI 분석 실행
  const analyzeReviews = async () => {
    if (reviews.length === 0) {
      alert('먼저 리뷰를 불러와주세요.');
      return;
    }

    setLoadingAnalysis(true);

    try {
      const res = await fetch('/market/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviews,
          productName: selectedProduct
        })
      });

      if (!res.ok) throw new Error('분석 실패');

      const data = await res.json();
      setAnalysis(data.analysis);

      // 통계도 함께 가져오기
      const statsRes = await fetch('/market/statistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews })
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStatistics(statsData.statistics);
      }

    } catch (error) {
      console.error('분석 에러:', error);
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🛍️ 다나와 상품 분석</h1>

      {/* 검색창 */}
      <div className="flex gap-3 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchProducts()}
          placeholder="상품명 입력 (예: 로지텍)"
          className="border p-3 rounded-lg w-full max-w-md shadow-sm"
        />
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 상품 목록 */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4">
            📦 상품 목록 ({products.length})
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {products.map((p) => (
              <div key={p.productId} className="border p-3 rounded-lg shadow-sm bg-white hover:shadow-md transition">
                <img
                  src={p.image && p.image.startsWith("http") ? p.image : "/no-image.png"}
                  alt={stripHtml(p.name)}
                  className="w-full h-32 object-contain mb-2"
                />
                <h3 className="font-semibold text-sm mb-1">{stripHtml(p.name)}</h3>
                <p className="text-blue-600 font-bold text-sm">{p.price}</p>
                <button
                  onClick={() => fetchReviews(p.productId, p.name)}
                  className="mt-2 w-full bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  리뷰 보기
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 중간: 리뷰 목록 */}
        <div className="lg:col-span-1">
          {loadingReviews ? (
            <div className="border p-6 rounded-lg text-center">
              <p>리뷰 로딩 중...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  📝 리뷰 ({reviews.length})
                </h2>
                <button
                  onClick={analyzeReviews}
                  disabled={loadingAnalysis}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {loadingAnalysis ? '분석 중...' : '🤖 AI 분석'}
                </button>
              </div>

              {/* 간단한 통계 */}
              {statistics && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-bold mb-2">📊 간단 통계</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">총 리뷰:</span>
                      <span className="font-bold ml-2">{statistics.totalReviews}개</span>
                    </div>
                    <div>
                      <span className="text-gray-600">감성:</span>
                      <span className={`font-bold ml-2 ${
                        statistics.sentiment === '긍정적' ? 'text-green-600' :
                        statistics.sentiment === '부정적' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {statistics.sentiment}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">주요 키워드:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {statistics.topKeywords.slice(0, 5).map((kw: any) => (
                          <span key={kw.keyword} className="bg-blue-200 px-2 py-1 rounded text-xs">
                            {kw.keyword} ({kw.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {reviews.map((r, idx) => (
                  <div key={idx} className="border p-3 rounded-lg bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-blue-600 text-sm">
                        👤 {r.nickname}
                      </span>
                      <span className="text-xs text-gray-400">{r.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{r.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border p-6 rounded-lg text-center text-gray-500">
              상품의 "리뷰 보기" 버튼을 클릭하세요
            </div>
          )}
        </div>

        {/* 오른쪽: AI 분석 결과 */}
        <div className="lg:col-span-1">
          {analysis ? (
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                🤖 AI 분석 결과
              </h2>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="border p-6 rounded-lg text-center text-gray-500">
              리뷰를 불러온 후 "AI 분석" 버튼을 클릭하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}  // ⭐ 여기가 정상적으로 닫혀있는지 확인!