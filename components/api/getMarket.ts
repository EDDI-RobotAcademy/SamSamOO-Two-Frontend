export async function getMarket(query: string) {
  const res = await fetch(`/api/market/search?q=${query}`, {
    cache: "no-store",
  });
  return res.json();
}
