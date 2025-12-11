import type { AnalysisResult, InsightResult, Product, Review } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:33333';

export async function fetchProduct(source: string, id: string): Promise<Product> {
  const r = await fetch(`${API_BASE_URL}/product/read?source=${source}&source_product_id=${id}`);
  if (!r.ok) throw new Error('상품 조회 실패');
  return r.json();
}

export async function fetchReviews(source: string, id: string): Promise<Review[]> {
  const r = await fetch(`${API_BASE_URL}/review/list?source=${source}&source_product_id=${id}&limit=100`);
  if (!r.ok) return [];
  const data = await r.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.reviews)) return data.reviews;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function fetchLatestAnalysis(source: string, id: string): Promise<{
  analysis_result: AnalysisResult | null;
  insight_result:   InsightResult  | null;
}> {
  const r = await fetch(`${API_BASE_URL}/analysis/${source}/${id}/latest`);
  if (!r.ok) return { analysis_result: null, insight_result: null };
  return r.json();
}

export async function startCrawl(source: string, id: string) {
  const r = await fetch(`${API_BASE_URL}/review/collect/start`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: source, product_id: id }),
  });
  if (!r.ok) throw new Error('리뷰 수집 시작 실패');
  return r.json();
}

export async function startAnalyze(source: string, id: string) {
  const r = await fetch(`${API_BASE_URL}/review/analyze/start`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: source, product_id: id }),
  });
  if (!r.ok) throw new Error('분석 시작 실패');
  return r.json();
}

export async function deleteProduct(source: string, id: string) {
  const r = await fetch(`${API_BASE_URL}/product/delete?source=${source}&source_product_id=${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('삭제 실패');
}


export async function recollectReviews(source: string, id: string) {
  const res = await fetch(
    `${API_BASE_URL}/review/recollect?source=${source}&source_product_id=${id}`,
    {
      method: 'POST',
      credentials: 'include',
    }
  );
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || '재수집 요청 실패');
  }
  
  return res.json();
}

// lib/api.ts
export async function reanalyzeProduct(source: string, id: string) {
  const res = await fetch(
    `${API_BASE_URL}/review/recollect?source=${source}&source_product_id=${id}`,
    {
      method: 'POST',
      credentials: 'include',
    }
  );
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || '재수집 시작 실패');
  }
  return res.json();
}