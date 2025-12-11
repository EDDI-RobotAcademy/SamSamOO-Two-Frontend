"use client";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

// ⭐ dynamic import로 변경
let html2canvas: any = null;
if (typeof window !== 'undefined') {
  import('html2canvas').then(module => {
    html2canvas = module.default;
  });
}
const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, "");

export default function MarketPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState("");
  const [statistics, setStatistics] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // 상품 검색
  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch(`/market/search?query=${query}`);
    const data = await res.json();
    setProducts(data.items || []);
    setLoading(false);
  };

  // 리뷰 조회
  const fetchReviews = async (productId: string, productName: string) => {
    const cleanName = stripHtml(productName);
    setSelectedProduct(cleanName);
    setLoadingReviews(true);
    setAnalysis("");
    setStatistics(null);

    try {
      const res = await fetch(`/market/reviews?productId=${productId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const reviewArray = data.reviews || [];

      const normalized = reviewArray.map((r: any) => ({
        nickname: r.nickname ?? "",
        date: r.date ?? "",
        content: r.content ?? "",
        productName: cleanName,
      }));

      setReviews(normalized);
    } catch (error) {
      console.error('리뷰 로딩 에러:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // AI 분석 실행
  const analyzeReviews = async () => {
    if (reviews.length === 0) {
      alert('먼저 리뷰를 불러와주세요.');
      return;
    }

    setLoadingAnalysis(true);

    try {
      const res = await fetch('/market/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviews,
          productName: selectedProduct
        })
      });

      if (!res.ok) throw new Error('분석 실패');

      const data = await res.json();
      setAnalysis(data.analysis);

      // 통계도 함께 가져오기
      const statsRes = await fetch('/market/statistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews })
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStatistics(statsData.statistics);
      }

    } catch (error) {
      console.error('분석 에러:', error);
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // CSV 다운로드
  const downloadCSV = () => {
    if (reviews.length === 0) {
      alert('다운로드할 리뷰가 없습니다.');
      return;
    }

    let csv = '\uFEFF'; // UTF-8 BOM
    csv += '상품명,작성자,날짜,리뷰내용\n';

    reviews.forEach(review => {
      const row = [
        selectedProduct,
        review.nickname,
        review.date,
        `"${review.content.replace(/"/g, '""')}"`
      ].join(',');
      csv += row + '\n';
    });

    if (statistics) {
      csv += '\n통계 정보\n';
      csv += `총 리뷰 수,${statistics.totalReviews}\n`;
      csv += `전체 감성,${statistics.sentiment}\n`;
      csv += '\n주요 키워드\n';
      csv += '키워드,빈도\n';
      statistics.topKeywords.forEach((kw: any) => {
        csv += `${kw.keyword},${kw.count}\n`;
      });
    }

    if (analysis) {
      csv += '\nAI 분석 결과\n';
      csv += `"${analysis.replace(/"/g, '""')}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedProduct}_리뷰분석_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF 다운로드
 const downloadPDF = async () => {
    if (reviews.length === 0) {
      alert('다운로드할 리뷰가 없습니다.');
      return;
    }

    try {
      // PDF용 HTML 생성
      const printContent = document.createElement('div');
      printContent.style.width = '800px';
      printContent.style.padding = '40px';
      printContent.style.backgroundColor = 'white';
      printContent.style.fontFamily = 'Arial, sans-serif';

      // 제목
      printContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; margin-bottom: 10px;">${selectedProduct}</h1>
          <h2 style="font-size: 18px; color: #666; margin-bottom: 5px;">리뷰 분석 보고서</h2>
          <p style="font-size: 12px; color: #999;">생성일: ${new Date().toLocaleDateString('ko-KR')}</p>
        </div>
      `;

      // 통계 정보
      if (statistics) {
        printContent.innerHTML += `
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 5px;">📊 통계 정보</h3>
            <p style="font-size: 14px; margin: 8px 0;"><strong>총 리뷰 수:</strong> ${statistics.totalReviews}개</p>
            <p style="font-size: 14px; margin: 8px 0;"><strong>전체 감성:</strong> ${statistics.sentiment}</p>
            <div style="margin-top: 15px;">
              <p style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">주요 키워드:</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background-color: #4285f4; color: white;">
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">순위</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">키워드</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">빈도</th>
                  </tr>
                </thead>
                <tbody>
                  ${statistics.topKeywords.slice(0, 10).map((kw: any, idx: number) => `
                    <tr style="${idx % 2 === 0 ? 'background-color: #f9f9f9;' : ''}">
                      <td style="border: 1px solid #ddd; padding: 8px;">${idx + 1}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${kw.keyword}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${kw.count}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      // AI 분석 결과
      if (analysis) {
        const formattedAnalysis = analysis
          .replace(/#{1,6}\s/g, '')
          .replace(/\*\*/g, '<strong>')
          .replace(/\n\n/g, '</p><p style="margin: 8px 0;">')
          .replace(/\n/g, '<br/>');

        printContent.innerHTML += `
          <div style="margin-bottom: 30px; page-break-inside: avoid;">
            <h3 style="font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 5px;">🤖 AI 분석 결과</h3>
            <div style="font-size: 12px; line-height: 1.6;">
              <p style="margin: 8px 0;">${formattedAnalysis}</p>
            </div>
          </div>
        `;
      }

      // 리뷰 목록
      printContent.innerHTML += `
        <div style="page-break-before: always;">
          <h3 style="font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 5px;">📝 리뷰 목록</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background-color: #4285f4; color: white;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 40px;">No</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 100px;">작성자</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 100px;">날짜</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">리뷰 내용</th>
              </tr>
            </thead>
            <tbody>
              ${reviews.slice(0, 50).map((review, idx) => `
                <tr style="${idx % 2 === 0 ? 'background-color: #f9f9f9;' : ''}">
                  <td style="border: 1px solid #ddd; padding: 6px;">${idx + 1}</td>
                  <td style="border: 1px solid #ddd; padding: 6px;">${review.nickname}</td>
                  <td style="border: 1px solid #ddd; padding: 6px;">${review.date}</td>
                  <td style="border: 1px solid #ddd; padding: 6px;">${review.content.substring(0, 200)}${review.content.length > 200 ? '...' : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${reviews.length > 50 ? `<p style="text-align: center; margin-top: 10px; font-style: italic; color: #666;">... 외 ${reviews.length - 50}개의 리뷰</p>` : ''}
        </div>
      `;

      // 임시로 body에 추가
      printContent.style.position = 'absolute';
      printContent.style.left = '-9999px';
      document.body.appendChild(printContent);

      // HTML을 캔버스로 변환
      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      // 캔버스를 PDF로 변환
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // 임시 요소 제거
      document.body.removeChild(printContent);

      // PDF 저장
      pdf.save(`${selectedProduct}_리뷰분석_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🛍️ 다나와 상품 분석</h1>

      {/* 검색창 */}
      <div className="flex gap-3 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchProducts()}
          placeholder="상품명 입력 (예: 로지텍)"
          className="border p-3 rounded-lg w-full max-w-md shadow-sm"
        />
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>

      {/* 다운로드 버튼 - 리뷰와 분석이 모두 있을 때만 표시 */}
      {(reviews.length > 0 && analysis) && (
        <div className="mb-6 flex gap-3 justify-end">
          <button
            onClick={downloadCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            📊 CSV 다운로드
          </button>
          <button
            onClick={downloadPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            📄 PDF 다운로드
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 상품 목록 */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4">
            📦 상품 목록 ({products.length})
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {products.map((p) => (
              <div key={p.productId} className="border p-3 rounded-lg shadow-sm bg-white hover:shadow-md transition">
                <img
                  src={p.image && p.image.startsWith("http") ? p.image : "/no-image.png"}
                  alt={stripHtml(p.name)}
                  className="w-full h-32 object-contain mb-2"
                />
                <h3 className="font-semibold text-sm mb-1">{stripHtml(p.name)}</h3>
                <p className="text-blue-600 font-bold text-sm">{p.price}</p>
                <button
                  onClick={() => fetchReviews(p.productId, p.name)}
                  className="mt-2 w-full bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  리뷰 보기
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 중간: 리뷰 목록 */}
        <div className="lg:col-span-1">
          {loadingReviews ? (
            <div className="border p-6 rounded-lg text-center">
              <p>리뷰 로딩 중...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  📝 리뷰 ({reviews.length})
                </h2>
                <button
                  onClick={analyzeReviews}
                  disabled={loadingAnalysis}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {loadingAnalysis ? '분석 중...' : '🤖 AI 분석'}
                </button>
              </div>

              {/* 간단한 통계 */}
              {statistics && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-bold mb-2">📊 간단 통계</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">총 리뷰:</span>
                      <span className="font-bold ml-2">{statistics.totalReviews}개</span>
                    </div>
                    <div>
                      <span className="text-gray-600">감성:</span>
                      <span className={`font-bold ml-2 ${
                        statistics.sentiment === '긍정적' ? 'text-green-600' :
                        statistics.sentiment === '부정적' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {statistics.sentiment}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">주요 키워드:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {statistics.topKeywords.slice(0, 5).map((kw: any) => (
                          <span key={kw.keyword} className="bg-blue-200 px-2 py-1 rounded text-xs">
                            {kw.keyword} ({kw.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {reviews.map((r, idx) => (
                  <div key={idx} className="border p-3 rounded-lg bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-blue-600 text-sm">
                        👤 {r.nickname}
                      </span>
                      <span className="text-xs text-gray-400">{r.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{r.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border p-6 rounded-lg text-center text-gray-500">
              상품의 "리뷰 보기" 버튼을 클릭하세요
            </div>
          )}
        </div>

        {/* 오른쪽: AI 분석 결과 */}
        <div className="lg:col-span-1">
          {analysis ? (
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                🤖 AI 분석 결과
              </h2>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="border p-6 rounded-lg text-center text-gray-500">
              리뷰를 불러온 후 "AI 분석" 버튼을 클릭하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}