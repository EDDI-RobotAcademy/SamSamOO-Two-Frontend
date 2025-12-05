// components/api/getMarketData.ts

export async function getMarketData(query: string) {
  const res = await fetch(`/api/market/fetch?query=${query}`, {
    method: "GET",
    next: { revalidate: 0 }, // 캐싱 방지 (원하면 제거)
  });

  return res.json();
}

