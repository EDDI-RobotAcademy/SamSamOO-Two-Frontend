export interface Product {
  source: string;
  source_product_id: string;
  title: string;
  source_url: string;
  price: number;
  category: string;
  status: string;
  analysis_status: AnalysisStatus;
  seller: string | null;
  rating: number | null;
  review_count: number;
  collected_at: string;
}

export type AnalysisStatus =
  | 'PENDING' | 'CRAWLING' | 'COLLECTED' | 'ANALYZING' | 'ANALYZED' | 'FAILED';

export interface Review {
  review_id: number;
  reviewer: string;
  rating: number;
  content: string;
  review_at: string;
}

export interface AnalysisResult {
  job_id: string;
  total_reviews: number;
  sentiment_json: { neutral: number; negative: number; positive: number };
  aspects_json: any;
  keywords_json: string[];
  issues_json: string[];
  trend_json: any;
  created_at: string;
}

export interface InsightResult {
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
