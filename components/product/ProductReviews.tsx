'use client';
import type { Review } from '@/lib/types';

export default function ProductReviews({
  reviews, loading, error, onRefresh,
}: {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">💬 수집된 리뷰</h2>
        {!loading && reviews.length > 0 && (
          <button onClick={onRefresh} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            새로고침
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">리뷰를 불러오는 중...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <p className="font-semibold mb-1">리뷰를 불러올 수 없습니다</p>
          <p className="text-sm">{error}</p>
          <button onClick={onRefresh} className="mt-2 text-sm text-yellow-800 hover:text-yellow-900 underline">
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 mb-2">아직 수집된 리뷰가 없습니다.</p>
          <p className="text-sm text-gray-400">리뷰 수집이 완료될 때까지 기다려주세요.</p>
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-4">
          <p className="mb-4 text-gray-600">총 {reviews.length}개의 리뷰</p>
          {reviews.slice(0, 30).map((r) => (
            <div key={r.review_id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{r.reviewer || '익명'}</span>
                  <span className="text-yellow-500">{'⭐'.repeat(Math.max(1, Math.min(5, r.rating || 0)))}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {r.review_at ? new Date(r.review_at).toLocaleDateString('ko-KR') : '날짜 없음'}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{r.content || '(내용 없음)'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
