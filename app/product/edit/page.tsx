"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getPlatformDisplayName, getPlatformBadgeColor } from '../../util/utils';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:33333";

type FormState = {
  title: string;
  source_url: string;
  price: number | string;
  category: string;
};

export default function ProductEditPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const source = sp.get("source");
  const id = sp.get("id");

  const [form, setForm] = useState<FormState>({
    title: "",
    source_url: "",
    price: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // 디테일 페이지와 동일한 배지 컬러
  const platformBadge = useMemo(() => {
    switch (source) {
      case "lotteon":
        return "bg-red-100 text-red-800";
      case "elevenst":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, [source]);

  useEffect(() => {
    if (!source || !id) {
      setError("필수 파라미터(source, id)가 없습니다.");
      setLoading(false);
      return;
    }
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/product/read?source=${source}&source_product_id=${id}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`상품 조회 실패 (${res.status}) ${t}`);
      }
      const data = await res.json();
      setForm({
        title: data.title ?? "",
        source_url: data.source_url ?? "",
        price: data.price ?? "",
        category: data.category ?? "",
      });
    } catch (e: any) {
      setError(e?.message ?? "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !id) return;

    try {
      const body = {
        source,
        source_product_id: id,
        title: form.title,
        source_url: form.source_url,
        price: Number(form.price),
        category: form.category,
      };

      const res = await fetch(`${API_BASE_URL}/product/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`업데이트 실패 (${res.status}) ${t}`);
      }

      alert("수정이 완료되었습니다!");
      router.push(`/product/detail?source=${source}&id=${id}`);
    } catch (e: any) {
      setError(e?.message ?? "업데이트 실패");
    }
  };

  const goBack = () => {
    // 디테일 페이지가 확실하면 그쪽으로, 아니면 history 뒤로가기
    if (source && id) router.push(`/product/detail?source=${source}&id=${id}`);
    else router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          로딩 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 text-gray-900 dark:text-white">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/product/list"
            className="text-blue-600 hover:underline inline-block mb-4"
          >
            ← 목록으로 돌아가기
          </Link>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 상단 뒤로가기 */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={goBack}
            className="text-blue-600 hover:underline"
          >
            ← 돌아가기
          </button>
        </div>

        {/* 카드 헤더 (플랫폼 배지 + 제목) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${platformBadge}`}
            >
              {String(source || "").toUpperCase()}
            </span>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                ID: {id}
              </span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            상품 수정
          </h1>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  상품명
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white text-black dark:bg-gray-900 dark:text-white dark:border-gray-700"
                  placeholder="상품명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  상품 URL
                </label>
                <input
                  name="source_url"
                  value={form.source_url}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white text-black dark:bg-gray-900 dark:text-white dark:border-gray-700"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                    가격
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded bg-white text-black dark:bg-gray-900 dark:text-white dark:border-gray-700"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                    카테고리
                  </label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded bg-white text-black dark:bg-gray-900 dark:text-white dark:border-gray-700"
                    placeholder="예: CLOTHING"
                  />
                </div>
              </div>
            </div>

            {/* 버튼 그룹 (디테일 페이지와 톤 맞춤) */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (form.source_url) {
                    window.open(form.source_url, "_blank", "noopener,noreferrer");
                  } else {
                    alert("상품 URL이 없습니다.");
                  }
                }}
                className="flex-1 px-6 py-3 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 transition"
              >
                원본 페이지 보기
              </button>

              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                수정 저장
              </button>

              <button
                type="button"
                onClick={goBack}
                className="px-6 py-3 bg-zinc-500 text-white rounded-lg hover:bg-zinc-600 transition"
              >
                취소
              </button>
            </div>
          </form>
        </div>

        {/* 하단에도 뒤로가기 링크 옵션 */}
        <div className="text-right">
          <button onClick={goBack} className="text-blue-600 hover:underline">
            ← 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}