export async function getReviews(productId: string) {
  const res = await fetch(`/api/market/reviews?id=${productId}`, {
    cache: "no-store",
  });
  return res.json();
}
