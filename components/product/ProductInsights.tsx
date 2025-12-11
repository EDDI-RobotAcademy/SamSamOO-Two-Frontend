'use client';
import type { InsightResult } from '../../lib/types';

export default function ProductInsights({ result }: { result: InsightResult }) {
  const I = result.insights_json || {};
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">🤖 AI 인사이트</h2>
      {result.summary && <div className="mb-4 p-4 bg-blue-50 rounded-lg"><p className="text-gray-700">{result.summary}</p></div>}

      <div className="space-y-4">
        {Array.isArray(I.quality_insights) && I.quality_insights.length > 0 && (
          <Section title="💚 품질 관련" items={I.quality_insights} color="text-green-600" />
        )}
        {Array.isArray(I.service_insights) && I.service_insights.length > 0 && (
          <Section title="💙 서비스 관련" items={I.service_insights} color="text-blue-600" />
        )}
        {Array.isArray(I.value_insights) && I.value_insights.length > 0 && (
          <Section title="💜 가치 관련" items={I.value_insights} color="text-purple-600" />
        )}
      </div>
    </div>
  );
}

function Section({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div>
      <h3 className={`font-semibold mb-2 ${color}`}>{title}</h3>
      <ul className="space-y-1">
        {items.map((s, i) => (
          <li key={i} className="text-sm text-gray-700 pl-4">• {s}</li>
        ))}
      </ul>
    </div>
  );
}
