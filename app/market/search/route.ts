export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    const response = await fetch(
      `http://localhost:33333/market-data/search?query=${encodeURIComponent(q ?? "")}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Backend Error Response:", text);
      return Response.json(
        { error: "Backend error", detail: text },
        { status: 500 }
      );
    }

    const data = await response.json();
    return Response.json(data);

  } catch (err: any) {
    return Response.json(
      { error: "Unexpected error", detail: err.message },
      { status: 500 }
    );
  }
}
