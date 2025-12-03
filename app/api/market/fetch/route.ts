export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") ?? "";

  const backendUrl = `http://localhost:33333/market-data/fetch?query=${encodeURIComponent(
    query
  )}`;

  const response = await fetch(backendUrl);
  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
