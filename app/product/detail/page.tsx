'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isBusy } from '../../../lib/status';
import type { AnalysisResult, InsightResult, Product, Review } from '../../../lib/types';
import {
  fetchProduct,
  fetchReviews,
  fetchLatestAnalysis,
  startCrawl,
  startAnalyze,
  deleteProduct,
  recollectReviews,
} from '../../../lib/api';

import ProductHeader from '@/components/product/ProductHeader';
import ProductStatusBanner from '@/components/product/ProductStatusBanner';
import ProductActionPanel from '@/components/product/ProductActionPanel';
import ProductReviews from '@/components/product/ProductReviews';
import ProductAnalysis from '@/components/product/ProductAnalysis';
import ProductInsights from '@/components/product/ProductInsights';

export default function ProductDetailPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const source = sp.get('source') || '';
  const id = sp.get('id') || '';

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [insight, setInsight] = useState<InsightResult | null>(null);

  const [pending, setPending] = useState({ crawl: false, analyze: false, recollect: false });

  // 제품 정보
  const loadProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const p = await fetchProduct(source, id);
      setProduct(p);
    } catch (e: any) {
      setError(e?.message || '상품 조회 중 오류');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  // 리뷰
  const loadReviews = async () => {
    if (!source || !id) return;
    try {
      setReviewsLoading(true);
      setReviewsError(null);
      setReviews(await fetchReviews(source, id));
    } catch (e: any) {
      setReviewsError(e?.message || '리뷰 조회 실패');
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // 분석 결과
  const loadAnalysis = async () => {
    if (!product || product.analysis_status !== 'ANALYZED') {
      setAnalysis(null);
      setInsight(null);
      return;
    }
    const res = await fetchLatestAnalysis(source, id);
    setAnalysis(res.analysis_result || null);
    setInsight(res.insight_result || null);
  };

  // 액션
  const onStartCrawl = async () => {
    if (!product) return;
    try {
      setPending((p) => ({ ...p, crawl: true }));
      const { task_id } = await startCrawl(product.source, product.source_product_id);
      alert(`리뷰 수집 시작 (Task: ${task_id})`);
      await loadProduct();
    } catch (e: any) {
      alert(e?.message || '리뷰 수집 시작 실패');
    } finally {
      setPending((p) => ({ ...p, crawl: false }));
    }
  };

  const onStartAnalyze = async () => {
    if (!product) return;
    try {
      setPending((p) => ({ ...p, analyze: true }));
      const { task_id } = await startAnalyze(product.source, product.source_product_id);
      alert(`분석 시작 (Task: ${task_id})`);
      await loadProduct();
    } catch (e: any) {
      alert(e?.message || '분석 시작 실패');
    } finally {
      setPending((p) => ({ ...p, analyze: false }));
    }
  };

  const onDelete = async () => {
    if (!product) return;
    if (!confirm('정말 이 상품을 삭제하시겠습니까?')) return;
    try {
      await deleteProduct(product.source, product.source_product_id);
      alert('삭제되었습니다.');
      router.push('/product/list');
    } catch (e: any) {
      alert(e?.message || '삭제 중 오류');
    }
  };

  // ? 재수집 핸들러 (폴링 포함)
  const onRecollect = async () => {
    if (!product) return;

    if (!confirm('기존 리뷰와 분석 결과가 모두 삭제됩니다. 재수집하시겠습니까?')) {
      return;
    }

    try {
      setPending((p) => ({ ...p, recollect: true }));

      const res = await recollectReviews(product.source, product.source_product_id);

      alert(res?.message || `재수집 시작${res?.task_id ? ` (Task: ${res.task_id})` : ''}`);

      // 즉시 상품 정보 새로고침
      await loadProduct();

      // 폴링 시작 (5초마다 상태 확인)
      const pollInterval = setInterval(async () => {
        const updatedProduct = await fetchProduct(product.source, product.source_product_id);
        setProduct(updatedProduct);

        console.log(`[POLLING] 상태: ${updatedProduct.analysis_status}`);

        // 완료되면 폴링 중단
        if (
          updatedProduct.analysis_status === 'ANALYZED' ||
          updatedProduct.analysis_status === 'FAILED'
        ) {
          clearInterval(pollInterval);
          console.log('[POLLING] 완료 - 폴링 중단');

          // 리뷰와 분석 결과 새로고침
          await loadReviews();
          await loadAnalysis();

          setPending((p) => ({ ...p, recollect: false }));

          if (updatedProduct.analysis_status === 'ANALYZED') {
            alert('재수집 및 분석이 완료되었습니다! ??');
          } else {
            alert('재수집 중 오류가 발생했습니다. ?');
          }
        }
      }, 5000);

      // 5분 후 자동 중단
      setTimeout(() => {
        clearInterval(pollInterval);
        setPending((p) => ({ ...p, recollect: false }));
        console.log('[POLLING] 타임아웃 - 폴링 중단');
      }, 300000);
    } catch (e: any) {
      alert(e?.message || '재수집 요청 실패');
      setPending((p) => ({ ...p, recollect: false }));
    }
  };

  // 초기 로딩
  useEffect(() => {
    if (source && id) loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, id]);

  // 제품 상태 바뀌면 리뷰/분석 갱신
  useEffect(() => {
    if (!product) return;
    loadReviews();
    loadAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.analysis_status]);

  // 바쁜 상태에서 버튼 비활성화
  const busy = useMemo(() => isBusy(product?.analysis_status), [product?.analysis_status]);

  // ? PDF 가능 조건(부모에서 엄격 판단): 분석 완료 + 분석/인사이트 로드됨
  const canDownloadPdf =
    product?.analysis_status === 'ANALYZED' && !!analysis && !!insight;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
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
            <p>{error || '상품을 찾을 수 없습니다.'}</p>
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
            <ProductHeader product={product} />

            <ProductStatusBanner
              status={product.analysis_status}
              onStartCrawl={onStartCrawl}
              onStartAnalyze={onStartAnalyze}
              busy={busy || pending.crawl || pending.analyze || pending.recollect}
            />

            {analysis && product.analysis_status === 'ANALYZED' && (
              <ProductAnalysis result={analysis} />
            )}
            {insight && product.analysis_status === 'ANALYZED' && (
              <ProductInsights result={insight} />
            )}

            <ProductReviews
              reviews={reviews}
              loading={reviewsLoading}
              error={reviewsError}
              onRefresh={loadReviews}
            />
          </div>

          <div className="lg:col-span-1">
            <ProductActionPanel
              product={product}
              onRefresh={loadProduct}
              onStartCrawl={onStartCrawl}
              onStartAnalyze={onStartAnalyze}
              onDelete={onDelete}
              onRecollect={onRecollect}
              pendingFlags={pending}
              canDownloadPdf={canDownloadPdf}  // ? 여기서 제어
            />
          </div>
        </div>
      </div>
    </div>
  );
}
