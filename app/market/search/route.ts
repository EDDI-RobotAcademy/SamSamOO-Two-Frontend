import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query"); // 반드시 query

  if (!query) {
    return Response.json({ error: "검색어(query)가 필요합니다." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `http://127.0.0.1:33333/market/search?q=${encodeURIComponent(query)}`
    );

    if (!res.ok) {
      return Response.json(
        { error: "FastAPI 서버 오류", detail: await res.text() },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
