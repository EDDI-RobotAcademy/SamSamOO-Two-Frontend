import type { AnalysisStatus } from './types';

export const STATUS_INFO: Record<
  AnalysisStatus,
  { text: string; color: string; icon: string }
> = {
  PENDING:   { text: '대기 중',     color: 'bg-gray-100 text-gray-700',   icon: '⏳' },
  CRAWLING:  { text: '리뷰 수집 중', color: 'bg-blue-100 text-blue-700',   icon: '🔄' },
  COLLECTED: { text: '수집 완료',     color: 'bg-green-100 text-green-700', icon: '✅' },
  ANALYZING: { text: '분석 진행 중',  color: 'bg-purple-100 text-purple-700', icon: '🧠' },
  ANALYZED:  { text: '분석 완료',     color: 'bg-green-100 text-green-700', icon: '🎉' },
  FAILED:    { text: '실패',         color: 'bg-red-100 text-red-700',     icon: '❌' },
};

export const isBusy = (s?: AnalysisStatus) => s === 'CRAWLING' || s === 'ANALYZING';
