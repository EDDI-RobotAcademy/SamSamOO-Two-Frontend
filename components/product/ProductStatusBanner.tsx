'use client';
import { STATUS_INFO } from '../../lib/status';
import type { AnalysisStatus } from '../../lib/types';

export default function ProductStatusBanner({
  status,
  onStartCrawl,
  onStartAnalyze,
  busy,
}: {
  status: AnalysisStatus;
  onStartCrawl: () => void;
  onStartAnalyze: () => void;
  busy: boolean;
}) {
  const info = STATUS_INFO[status] ?? STATUS_INFO.PENDING;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-lg p-6">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{info.icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">현재 상태: {info.text}</h3>

          {status === 'PENDING' && (
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">아직 리뷰 수집이 시작되지 않았습니다.</p>
              <button onClick={onStartCrawl} disabled={busy}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {busy ? '시작 중...' : '리뷰 수집 시작'}
              </button>
            </div>
          )}

          {status === 'CRAWLING' && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              <span className="text-sm">리뷰 수집 중...</span>
            </div>
          )}

          {status === 'COLLECTED' && (
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">수집 완료. 분석을 시작할 수 있습니다.</p>
              <button onClick={onStartAnalyze} disabled={busy}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {busy ? '시작 중...' : '리뷰 분석 실행'}
              </button>
            </div>
          )}

          {status === 'ANALYZING' && (
            <div className="flex items-center gap-2 text-purple-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600" />
              <span className="text-sm">분석 진행 중...</span>
            </div>
          )}

          {status === 'ANALYZED' && (
            <p className="text-sm text-blue-700 dark:text-blue-300">분석 결과가 준비되었습니다.</p>
          )}

          {status === 'FAILED' && (
            <div>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">작업 중 오류가 발생했습니다.</p>
              <button onClick={onStartCrawl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">다시 시도</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
