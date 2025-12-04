import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("catalogId");

    const response = await fetch(
      `http://localhost:33333/market-data/products/${id}/reviews`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("리뷰 백엔드 오류:", text);

      return NextResponse.json(
        { error: "Backend error", detail: text },
        { status: 500 }
      );
    }

    const data = await response.json();

    // ★ 리뷰 배열 표준화
    return NextResponse.json({
      reviews: data.reviews ?? data ?? [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected error", detail: err.message },
      { status: 500 }
    );
  }
}
