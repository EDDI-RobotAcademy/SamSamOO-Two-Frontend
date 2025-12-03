"use client";

import { useState } from "react";
import { getMarketData } from "@/components/api/getMarketData";

export default function MarketPage() {
  const [query, setQuery] = useState("갤럭시");
  const [data, setData] = useState<any | null>(null);

  const fetchData = async () => {
    const result = await getMarketData(query);
    setData(result);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">📊 마켓 데이터 검색</h1>

      <div className="mt-3 flex gap-2">
        <input
          className="border px-2 py-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          검색
        </button>
      </div>

      {data && (
        <div className="mt-4 space-y-2">
          {data.items.map((item: any, idx: number) => (
            <div key={idx} className="border p-3 rounded bg-gray-50">
              <div dangerouslySetInnerHTML={{ __html: item.name }} />
              <p>{item.price.toLocaleString()}원</p>
              <p>{item.currency}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
