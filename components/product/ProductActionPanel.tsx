'use client';
import Link from 'next/link';
import { isBusy } from '../../lib/status';
import type { Product } from '../../lib/types';

export default function ProductActionPanel({
  product,
  onRefresh,
  onStartCrawl,
  onStartAnalyze,
  onDelete,
  onRecollect,
  pendingFlags,
}: {
  product: Product;
  onRefresh: () => void;
  onStartCrawl: () => void;
  onStartAnalyze: () => void;
  onDelete: () => void;
  onRecollect?: () => void; 
  pendingFlags: { crawl: boolean; analyze: boolean; recollect?: boolean };
}) {
  const busy = isBusy(product.analysis_status);
  const canRecollect = product.analysis_status === 'ANALYZED'; // ✅ 분석 완료여야 활성

  return (
    <div className="sticky top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">작업 관리</h3>
      <div className="space-y-3">
        {onRecollect && (
                <>
                <button
                    className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => onRecollect()}
                    disabled={!canRecollect || pendingFlags.recollect || busy} // ✅ 조건
                    title={canRecollect ? '리뷰를 다시 수집합니다' : '분석 완료 상태에서만 사용할 수 있습니다'}
                >
                    {pendingFlags.recollect ? '재수집 중...' : '리뷰 재수집'}
                </button>

                {!canRecollect && (
                    <p className="text-xs text-gray-500">※ 분석이 완료되면 재수집이 가능해요.</p>
                )}
                </>
            )}
        {product.analysis_status === 'PENDING' && (
          <button onClick={onStartCrawl} disabled={busy || pendingFlags.crawl}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {pendingFlags.crawl ? '시작 중...' : '리뷰 수집 시작'}
          </button>
        )}
        {product.analysis_status === 'COLLECTED' && (
          <button onClick={onStartAnalyze} disabled={busy || pendingFlags.analyze}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {pendingFlags.analyze ? '시작 중...' : '리뷰 분석 실행'}
          </button>
        )}
        <Link
          href={`/product/edit?source=${product.source}&id=${product.source_product_id}`}
          className="block w-full px-4 py-3 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700">
          수정
        </Link>
        <button onClick={onDelete}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">삭제</button>
        <button onClick={onRefresh}
          className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          상태 새로고침
        </button>
      </div>
    </div>
  );
}
