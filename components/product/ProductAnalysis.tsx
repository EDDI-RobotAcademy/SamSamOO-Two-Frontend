'use client';
import type { AnalysisResult } from '../../lib/types';

export default function ProductAnalysis({ result }: { result: AnalysisResult }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">📊 분석 결과</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">감정 분석</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-1">긍정</p>
            <p className="text-2xl font-bold text-green-600">{result.sentiment_json?.positive || 0}%</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-1">중립</p>
            <p className="text-2xl font-bold text-gray-600">{result.sentiment_json?.neutral || 0}%</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-1">부정</p>
            <p className="text-2xl font-bold text-red-600">{result.sentiment_json?.negative || 0}%</p>
          </div>
        </div>
      </div>

      {Array.isArray(result.keywords_json) && result.keywords_json.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">주요 키워드</h3>
          <div className="flex flex-wrap gap-2">
            {result.keywords_json.slice(0, 10).map((k, i) => (
              <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{k}</span>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(result.issues_json) && result.issues_json.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">주요 이슈</h3>
          <ul className="space-y-2">
            {result.issues_json.slice(0, 5).map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">⚠️</span>
                <span className="text-sm text-gray-700">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
