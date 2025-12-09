import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { productId, productName, price, imageUrl } = await req.json();

    const connection = await pool.getConnection();

    // UPSERT (있으면 업데이트, 없으면 삽입)
    await connection.execute(
      `INSERT INTO products (product_id, product_name, price, image_url)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       product_name = VALUES(product_name),
       price = VALUES(price),
       image_url = VALUES(image_url),
       updated_at = CURRENT_TIMESTAMP`,
      [productId, productName, price, imageUrl]
    );

    connection.release();

    return NextResponse.json({ message: "상품 저장 완료", productId });

  } catch (error) {
    console.error('❌ 상품 저장 에러:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 상품 조회
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    const connection = await pool.getConnection();

    if (productId) {
      const [rows] = await connection.execute(
        'SELECT * FROM products WHERE product_id = ?',
        [productId]
      );
      connection.release();
      return NextResponse.json({ product: rows[0] });
    }

    const [rows] = await connection.execute(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT 50'
    );
    connection.release();

    return NextResponse.json({ products: rows });

  } catch (error) {
    console.error('❌ 상품 조회 에러:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}