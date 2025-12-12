"use client";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:33333";

export default function DownloadPdfButton({
  source,
  productId,
}: { source: string; productId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/report/product/${source}/${productId}/pdf`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("PDF 생성 실패");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${source}_${productId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="w-full rounded-lg bg-gray-800 text-white py-3"
      disabled={loading}
    >
      {loading ? "PDF 생성 중..." : "PDF 다운로드"}
    </button>
  );
}
