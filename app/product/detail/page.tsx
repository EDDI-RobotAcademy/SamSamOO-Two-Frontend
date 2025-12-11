"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPlatformDisplayName, getPlatformBadgeColor } from "../../util/utils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:33333";

interface Product {
  source: string;
  source_product_id: string;
  title: string;
  source_url: string;
  price: number;
  category: string;
  status: string;
  analysis_status: string;
  seller: string | null;
  rating: number | null;
  review_count: number;
  collected_at: string;
}

interface Review {
  review_id: number;
  reviewer: string;
  rating: number;
  content: string;
  review_at: string;
}

interface AnalysisResult {
  job_id: string;
  total_reviews: number;
  sentiment_json: {
    neutral: number;
    negative: number;
    positive: number;
  };
  aspects_json: any;
  keywords_json: string[];
  issues_json: string[];
  trend_json: any;
  created_at: string;
}

interface InsightResult {
  job_id: string;
  summary: string;
  insights_json: {
    quality_insights: string[];
    service_insights: string[];
    value_insights: string[];
  };
  metadata_json: any;
  evidence_ids: number[];
  created_at: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const id = searchParams.get("id");

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [insightResult, setInsightResult] = useState<InsightResult | null>(null);

  const [isStartingCrawl, setIsStartingCrawl] = useState(false);
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);

  const fetchProductDetail = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const response = await fetch(
        `${API_BASE_URL}/product/read?source=${source}&source_product_id=${id}`
      );
      
      if (!response.ok) {
        throw new Error("상품을 찾을 수 없습니다.");
      }
      
      const data = await response.json();
      setProduct(data);
    } catch (err: any) {
      console.error("상품 조회 오류:", err);
      setError(err.message || "상품 조회 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!source || !id) {
      console.warn("리뷰 조회: source 또는 id가 없습니다.");
      return;
    }

    try {
      setIsLoadingReviews(true);
      setReviewsError(null);
      
      const url = `${API_BASE_URL}/review/list?source=${source}&source_product_id=${id}&limit=100`;
      console.log("리뷰 조회 URL:", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`리뷰 조회 실패 (${response.status})`);
      }
      
      const data = await response.json();
      console.log("리뷰 API 응답:", data);
      
      let reviewList: Review[] = [];
      
      if (Array.isArray(data)) {
        reviewList = data;
      } else if (data.reviews && Array.isArray(data.reviews)) {
        reviewList = data.reviews;
      } else if (data.data && Array.isArray(data.data)) {
        reviewList = data.data;
      }
      
      console.log(`총 ${reviewList.length}개의 리뷰 로드됨`);
      setReviews(reviewList);
      
    } catch (err: any) {
      console.error("리뷰 조회 오류:", err);
      setReviewsError(err.message || "리뷰를 불러올 수 없습니다.");
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const fetchAnalysis = async () => {
    if (!source || !id) return;

    if (product && product.analysis_status !== 'ANALYZED') {
      console.info("분석 결과가 아직 생성되지 않았습니다.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/analysis/${source}/${id}/latest`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data.analysis_result || null);
        setInsightResult(data.insight_result || null);
      } else {
        console.info("분석 결과가 아직 생성되지 않았습니다.");
      }
    } catch (err) {
      console.info("분석 결과 조회 불가 (정상)");
      setAnalysisResult(null);
      setInsightResult(null);
    }
  };

  const handleStartCrawl = async () => {
    if (!source || !id) return;
    
    try {
      setIsStartingCrawl(true);
      
      const response = await fetch(
        `${API_BASE_URL}/review/collect/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform: source,
            product_id: id,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error("리뷰 수집 시작 실패");
      }
      
      const data = await response.json();
      alert(`리뷰 수집이 시작되었습니다. (Task ID: ${data.task_id})`);
      
      await fetchProductDetail();
      
    } catch (err: any) {
      console.error("리뷰 수집 시작 오류:", err);
      alert(err.message || "리뷰 수집 시작 중 오류가 발생했습니다.");
    } finally {
      setIsStartingCrawl(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!source || !id) return;
    
    try {
      setIsStartingAnalysis(true);
      
      const response = await fetch(
        `${API_BASE_URL}/review/analyze/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform: source,
            product_id: id,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error("분석 시작 실패");
      }
      
      const data = await response.json();
      alert(`분석이 시작되었습니다. (Task ID: ${data.task_id})`);
      
      await fetchProductDetail();
      
    } catch (err: any) {
      console.error("분석 시작 오류:", err);
      alert(err.message || "분석 시작 중 오류가 발생했습니다.");
    } finally {
      setIsStartingAnalysis(false);
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
      alert(err.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (source && id) {
      fetchProductDetail();
    }
  }, [source, id]);

  useEffect(() => {
    if (product) {
      fetchReviews();
      fetchAnalysis();
    }
  }, [product?.analysis_status]);

  const getAnalysisStatusInfo = () => {
    if (!product) return null;

    const statusMap: Record<string, { text: string; color: string; icon: string }> = {
      PENDING: {
        text: "대기 중",
        color: "bg-gray-100 text-gray-700",
        icon: "⏳",
      },
      CRAWLING: {
        text: "리뷰 수집 중",
        color: "bg-blue-100 text-blue-700",
        icon: "🔄",
      },
      COLLECTED: {
        text: "수집 완료",
        color: "bg-green-100 text-green-700",
        icon: "✅",
      },
      ANALYZING: {
        text: "분석 진행 중",
        color: "bg-purple-100 text-purple-700",
        icon: "🧠",
      },
      ANALYZED: {
        text: "분석 완료",
        color: "bg-green-100 text-green-700",
        icon: "🎉",
      },
      FAILED: {
        text: "실패",
        color: "bg-red-100 text-red-700",
        icon: "❌",
      },
    };

    return statusMap[product.analysis_status] || statusMap.PENDING;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg mb-4">
            <p className="font-semibold mb-2">오류가 발생했습니다</p>
            <p>{error || "상품을 찾을 수 없습니다."}</p>
          </div>
          <Link
            href="/product/list"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5);
  const statusInfo = getAnalysisStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/product/list"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            목록으로 돌아가기
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getPlatformBadgeColor(
                    product.source
                  )}`}
                >
                  {getPlatformDisplayName(product.source)}
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  {product.category}
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                  {product.status}
                </span>
                {statusInfo && (
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                    {statusInfo.icon} {statusInfo.text}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {product.title}
              </h1>

              <div className="mb-6">
                <p className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400">
                  {product.price?.toLocaleString()}
                  <span className="text-2xl ml-1">원</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">상품 ID</p>
                  <p className="font-mono text-sm font-medium text-gray-900 dark:text-white break-all">
                    {product.source_product_id}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">등록일</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(product.collected_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-lg p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{statusInfo?.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    현재 상태: {statusInfo?.text}
                  </h3>
                  
                  {product.analysis_status === 'PENDING' && (
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        아직 리뷰 수집이 시작되지 않았습니다. 아래 버튼을 눌러 리뷰 수집을 시작하세요.
                      </p>
                      <button
                        onClick={handleStartCrawl}
                        disabled={isStartingCrawl}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isStartingCrawl ? "시작 중..." : "리뷰 수집 시작"}
                      </button>
                    </div>
                  )}

                  {product.analysis_status === 'CRAWLING' && (
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        리뷰를 수집하고 있습니다. 잠시만 기다려주세요.
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-600">진행 중...</span>
                      </div>
                    </div>
                  )}

                  {product.analysis_status === 'COLLECTED' && (
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        리뷰 수집이 완료되었습니다. 분석을 시작할 수 있습니다.
                      </p>
                      <button
                        onClick={handleStartAnalysis}
                        disabled={isStartingAnalysis}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isStartingAnalysis ? "시작 중..." : "리뷰 분석 실행"}
                      </button>
                    </div>
                  )}

                  {product.analysis_status === 'ANALYZING' && (
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        리뷰를 분석하고 있습니다. 잠시만 기다려주세요.
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        <span className="text-sm text-purple-600">분석 진행 중...</span>
                      </div>
                    </div>
                  )}

                  {product.analysis_status === 'ANALYZED' && (
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      모든 작업이 완료되었습니다. 아래에서 분석 결과를 확인하세요.
                    </p>
                  )}

                  {product.analysis_status === 'FAILED' && (
                    <div>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                        작업 중 오류가 발생했습니다. 다시 시도해주세요.
                      </p>
                      <button
                        onClick={handleStartCrawl}
                        disabled={isStartingCrawl}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isStartingCrawl ? "시작 중..." : "다시 시도"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {analysisResult && product.analysis_status === 'ANALYZED' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">📊 분석 결과</h2>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">감정 분석</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">긍정</p>
                      <p className="text-2xl font-bold text-green-600">
                        {analysisResult.sentiment_json?.positive || 0}%
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">중립</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {analysisResult.sentiment_json?.neutral || 0}%
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">부정</p>
                      <p className="text-2xl font-bold text-red-600">
                        {analysisResult.sentiment_json?.negative || 0}%
                      </p>
                    </div>
                  </div>
                </div>

                {analysisResult.keywords_json && analysisResult.keywords_json.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">주요 키워드</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywords_json.slice(0, 10).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.issues_json && analysisResult.issues_json.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">주요 이슈</h3>
                    <ul className="space-y-2">
                      {analysisResult.issues_json.slice(0, 5).map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">⚠️</span>
                          <span className="text-sm text-gray-700">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {insightResult && product.analysis_status === 'ANALYZED' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🤖 AI 인사이트</h2>

                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-700">{insightResult.summary}</p>
                </div>

                {insightResult.insights_json && (
                  <div className="space-y-4">
                    {Array.isArray(insightResult.insights_json.quality_insights) &&
                      insightResult.insights_json.quality_insights.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-green-600 mb-2">💚 품질 관련</h3>
                          <ul className="space-y-1">
                            {insightResult.insights_json.quality_insights.map((insight, idx) => (
                              <li key={idx} className="text-sm text-gray-700 pl-4">
                                • {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {Array.isArray(insightResult.insights_json.service_insights) &&
                      insightResult.insights_json.service_insights.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-blue-600 mb-2">💙 서비스 관련</h3>
                          <ul className="space-y-1">
                            {insightResult.insights_json.service_insights.map((insight, idx) => (
                              <li key={idx} className="text-sm text-gray-700 pl-4">
                                • {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {Array.isArray(insightResult.insights_json.value_insights) &&
                      insightResult.insights_json.value_insights.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-purple-600 mb-2">💜 가치 관련</h3>
                          <ul className="space-y-1">
                            {insightResult.insights_json.value_insights.map((insight, idx) => (
                              <li key={idx} className="text-sm text-gray-700 pl-4">
                                • {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">💬 수집된 리뷰</h2>
                {!isLoadingReviews && reviews.length > 0 && (
                  <button
                    onClick={fetchReviews}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    새로고침
                  </button>
                )}
              </div>

              {isLoadingReviews && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">리뷰를 불러오는 중...</p>
                </div>
              )}

              {!isLoadingReviews && reviewsError && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4">
                  <p className="font-semibold mb-1">리뷰를 불러올 수 없습니다</p>
                  <p className="text-sm">{reviewsError}</p>
                  <button
                    onClick={fetchReviews}
                    className="mt-2 text-sm text-yellow-800 hover:text-yellow-900 underline"
                  >
                    다시 시도
                  </button>
                </div>
              )}

              {!isLoadingReviews && !reviewsError && reviews.length > 0 && (
                <div>
                  <p className="mb-4 text-gray-600">총 {reviews.length}개의 리뷰</p>

                  <div className="space-y-4">
                    {displayedReviews.map((review) => (
                      <div key={review.review_id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {review.reviewer || "익명"}
                            </span>
                            <span className="text-yellow-500">
                              {"⭐".repeat(Math.max(1, Math.min(5, review.rating || 0)))}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {review.review_at
                              ? new Date(review.review_at).toLocaleDateString("ko-KR")
                              : "날짜 없음"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {review.content || "(내용 없음)"}
                        </p>
                      </div>
                    ))}
                  </div>

                  {reviews.length > 5 && (
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition"
                    >
                      {showAllReviews ? "접기" : `더보기 (${reviews.length - 5}개 더 있음)`}
                    </button>
                  )}
                </div>
              )}

              {!isLoadingReviews && !reviewsError && reviews.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-500 mb-2">아직 수집된 리뷰가 없습니다.</p>
                  <p className="text-sm text-gray-400">
                    리뷰 수집이 완료될 때까지 기다려주세요.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">작업 관리</h3>

              <div className="space-y-3">
                {product.analysis_status === 'PENDING' && (
                  <button
                    onClick={handleStartCrawl}
                    disabled={isStartingCrawl}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStartingCrawl ? "시작 중..." : "리뷰 수집 시작"}
                  </button>
                )}

                {product.analysis_status === 'COLLECTED' && (
                  <button
                    onClick={handleStartAnalysis}
                    disabled={isStartingAnalysis}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStartingAnalysis ? "시작 중..." : "리뷰 분석 실행"}
                  </button>
                )}

                <Link
                  href={`/product/edit?source=${product.source}&id=${product.source_product_id}`}
                  className="block w-full px-4 py-3 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700 transition"
                >
                  수정
                </Link>

                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  삭제
                </button>

                <button
                  onClick={fetchProductDetail}
                  className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  상태 새로고침
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}