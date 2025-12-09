export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const response = await fetch(
    `http://localhost:33333/market-data/products/${id}/reviews`,
    { cache: "no-store" }
  );

  const data = await response.json();
  return Response.json(data);
}
