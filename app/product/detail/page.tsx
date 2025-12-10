"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPlatformDisplayName, getPlatformBadgeColor } from "../../util/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:33333";

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

type CrawlState = "idle" | "collecting" | "completed" | "analyzing" | "done" | "failed";

interface CollectionStatusResponse {
  product_id: string;
  status: CrawlState;
  progress: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  total_reviews: number | null;
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

  const [crawlState, setCrawlState] = useState<CrawlState>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<string>("");

  // ⭐️ 새로 추가: 리뷰 및 분석 결과
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [insightResult, setInsightResult] = useState<InsightResult | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 폴링 시작
  const startPolling = (productId: string) => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    const timer = setInterval(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/review/collect/status/${productId}`
        );
        
        if (!response.ok) throw new Error("상태 조회 실패");

        const statusData = (await response.json()) as CollectionStatusResponse;

        setCrawlState(statusData.status);
        setProgress(statusData.progress);
        setStatusMsg(statusData.error_message || "");

        if (statusData.status === "completed" || statusData.status === "done" || statusData.status === "failed") {
          clearInterval(timer);
          pollTimerRef.current = null;

          if (statusData.status === "completed") {
            await fetchProductDetail();
            await fetchReviewsAndAnalysis(); // ⭐️ 리뷰 및 분석 결과 로드
            
            window.alert(
              `크롤링 완료! 수집 리뷰: ${statusData.total_reviews ?? 0}건`
            );

            const shouldAnalyze = window.confirm(
              "리뷰 수집이 완료되었습니다. 분석을 시작하시겠습니까?"
            );
            
            if (shouldAnalyze) {
              await runAnalysis();
            }
          } else if (statusData.status === "done") {
            await fetchProductDetail();
            await fetchReviewsAndAnalysis(); // ⭐️ 리뷰 및 분석 결과 로드
            window.alert("리뷰 분석까지 모두 완료되었습니다!");
          } else {
            window.alert(`크롤링 실패: ${statusData.error_message || "알 수 없는 오류"}`);
          }
        }
      } catch (err) {
        console.error("폴링 중 오류:", err);
      }
    }, 2000);

    pollTimerRef.current = timer;
  };

  // 크롤링 시작
  const startCrawling = async () => {
    if (!product) return;
    if (crawlState === "collecting" || crawlState === "analyzing") return;

    try {
      setCrawlState("collecting");
      setProgress(0);
      setStatusMsg("수집을 시작합니다...");

      const response = await fetch(`${API_BASE_URL}/review/collect/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: product.source,
          product_id: product.source_product_id,
        }),
      });

      if (!response.ok) throw new Error("크롤링 시작에 실패했습니다.");
      
      const data = await response.json();
      console.log("크롤링 시작:", data);

      startPolling(product.source_product_id);
      
    } catch (err: any) {
      setCrawlState("failed");
      setStatusMsg(err.message || "크롤링 시작 중 오류가 발생했습니다.");

      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }
  };

  // 분석 실행
  const runAnalysis = async () => {
    if (!product) return;
    
    try {
      setCrawlState("analyzing");
      
      const response = await fetch(
        `${API_BASE_URL}/analysis/${product.source}/${product.source_product_id}/run`,
        { method: "POST" }
      );

      if (!response.ok) throw new Error("분석 시작에 실패했습니다.");
      
      const data = await response.json();

      if (data.status === "success") {
        setCrawlState("done");
        await fetchProductDetail();
        await fetchReviewsAndAnalysis(); // ⭐️ 분석 결과 로드
        window.alert("리뷰 분석이 완료되었습니다!");
      } else {
        throw new Error(data.message || "분석 실패");
      }
    } catch (err: any) {
      setCrawlState("failed");
      console.error("Analysis error:", err);
      window.alert(err.message || "분석 중 오류가 발생했습니다.");
    }
  };

  // ⭐️ 리뷰 및 분석 결과 가져오기
  const fetchReviewsAndAnalysis = async () => {
    if (!source || !id) return;

    try {
      // 1. 리뷰 가져오기
      const reviewsRes = await fetch(
        `${API_BASE_URL}/review/list?source=${source}&source_product_id=${id}&limit=10`
      );
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
      }

      // 2. 분석 결과 가져오기
      const analysisRes = await fetch(
        `${API_BASE_URL}/analysis/${source}/${id}/latest`
      );
      if (analysisRes.ok) {
        const analysisData = await analysisRes.json();
        setAnalysisResult(analysisData.analysis_result || null);
        setInsightResult(analysisData.insight_result || null);
      }
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    }
  };

  // 현재 상태 확인
  const checkCurrentStatus = async (productId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/review/collect/status/${productId}`
      );

      if (response.status === 404) {
        setCrawlState("idle");
        return;
      }
      
      if (!response.ok) return;
      
      const statusData = (await response.json()) as CollectionStatusResponse;
      
      setCrawlState(statusData.status);
      setProgress(statusData.progress);
      setStatusMsg(statusData.error_message || "");

      if (statusData.status === "collecting" || statusData.status === "analyzing") {
        startPolling(productId);
      }
    } catch (err: any) {
      console.error("❌ 네트워크 에러:", err.message);
    }
  };

  const fetchProductDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/product/read?source=${source}&source_product_id=${id}`
      );
      if (!response.ok) throw new Error("상품을 찾을 수 없습니다.");
      const data = (await response.json()) as Product;
      setProduct(data);
    } catch (err: any) {
      setError(err.message || "상품 조회 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 삭제
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

  // 상태에 따른 버튼 텍스트
  const getCrawlButtonText = () => {
    switch (crawlState) {
      case "collecting":
        return `수집 중... ${progress}%`;
      case "analyzing":
        return "분석 중...";
      case "completed":
        return "수집 완료";
      case "done":
        return "모두 완료";
      case "failed":
        return "재시도";
      default:
        return "리뷰 크롤링 시작";
    }
  };

  // 초기 로드
  useEffect(() => {
    if (source && id) {
      fetchProductDetail();
      checkCurrentStatus(id);
      fetchReviewsAndAnalysis(); // ⭐️ 기존 데이터 로드
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, id]);

  // beforeunload 경고
  useEffect(() => {
    const beforeUnloadGuard = (e: BeforeUnloadEvent) => {
      if (crawlState === "collecting" || crawlState === "analyzing") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    if (crawlState === "collecting" || crawlState === "analyzing") {
      window.addEventListener("beforeunload", beforeUnloadGuard);
    } else {
      window.removeEventListener("beforeunload", beforeUnloadGuard);
    }
    return () => window.removeEventListener("beforeunload", beforeUnloadGuard);
  }, [crawlState]);

  // 로딩 화면
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

  // 에러 화면
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* 헤더 */}
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

        {/* 메인 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 왼쪽: 상품 상세 (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 상품 기본 정보 카드 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getPlatformBadgeColor(product.source)}`}>
                  {getPlatformDisplayName(product.source)}
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  {product.category}
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                  {product.status}
                </span>
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
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">리뷰 수</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {product.review_count?.toLocaleString() || 0}개
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">평균 평점</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {product.rating ? `⭐ ${product.rating.toFixed(1)} / 5.0` : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <a
                  href={product.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  🔗 원본 페이지에서 보기
                </a>
              </div>
            </div>

            {/* 크롤링 진행 상태 */}
            {(crawlState === "collecting" || crawlState === "analyzing") && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="animate-spin h-6 w-6 border-3 border-purple-600 border-t-transparent rounded-full"></div>
                  <h3 className="text-lg font-semibold">
                    {crawlState === "collecting" ? "리뷰 수집 중" : "리뷰 분석 중"}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>진행률</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  {statusMsg && <p className="text-sm text-gray-600">{statusMsg}</p>}
                </div>
              </div>
            )}

            {/* ⭐️ 분석 결과 */}
            {analysisResult && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">📊 분석 결과</h2>
                
                {/* 감정 분포 */}
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

                {/* 주요 키워드 */}
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

                {/* 주요 이슈 */}
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

            {/* ⭐️ AI 인사이트 */}
            {insightResult && (
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
                            <li key={idx} className="text-sm text-gray-700 pl-4">• {insight}</li>
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
                            <li key={idx} className="text-sm text-gray-700 pl-4">• {insight}</li>
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
                            <li key={idx} className="text-sm text-gray-700 pl-4">• {insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ⭐️ 리뷰 목록 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">💬 수집된 리뷰</h2>

              {reviews.length > 0 ? (
                <div>
                  <p className="mb-4 text-gray-600">총 {reviews.length}개의 리뷰</p>
                  
                  <div className="space-y-4">
                    {displayedReviews.map((review, index) => (
                      <div key={`review-${index}`} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{review.reviewer}</span>
                            <span className="text-yellow-500">{"⭐".repeat(review.rating)}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.review_at).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-3">{review.content}</p>
                      </div>
                    ))}
                  </div>

                  {reviews.length > 5 && (
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                    >
                      {showAllReviews ? "접기" : `더보기 (${reviews.length - 5}개 더 있음)`}
                    </button>
                  )}
                </div>  
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-500 mb-6">아직 수집된 리뷰가 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 액션 패널 (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">작업 관리</h3>
              
              <div className="space-y-3">
                <button
                  onClick={startCrawling}
                  disabled={crawlState === "collecting" || crawlState === "analyzing"}
                  className={`w-full px-4 py-3 rounded-lg text-white font-medium ${
                    crawlState === "collecting" || crawlState === "analyzing"
                      ? "bg-purple-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {getCrawlButtonText()}
                </button>

                {product.review_count > 0 && crawlState === "completed" && (
                  <button
                    onClick={runAnalysis}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    리뷰 분석 실행
                  </button>
                )}

                <div className="border-t my-4"></div>

                <Link
                  href={`/product/edit?source=${product.source}&id=${product.source_product_id}`}
                  className="block w-full px-4 py-3 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700"
                >
                  수정
                </Link>

                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}