import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
// import pool from "@/lib/db"; // ⭐ 주석 처리

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(req: Request) {
  let browser;

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    console.log('🔍 리뷰 크롤링 시작 - productId:', productId);

    if (!productId) {
      return NextResponse.json({ reviews: [] });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    console.log('🌐 페이지 이동 중...');
    await page.goto(
      `https://prod.danawa.com/info/?pcode=${productId}`,
      { waitUntil: 'networkidle2', timeout: 30000 }
    );

    console.log('⏳ 리뷰 섹션 대기 중...');
    await page.waitForSelector('.cmt_item', { timeout: 10000 });
    await page.waitForSelector('.danawa-prodBlog-productOpinion-clazz-content', {
      timeout: 5000
    }).catch(() => console.log('⚠️ 일부 리뷰 내용 로딩 지연'));

    await delay(1000);

    console.log('📊 리뷰 데이터 추출 중...');
    const reviews = await page.evaluate(() => {
      const items: any[] = [];

      document.querySelectorAll('li.cmt_item, li.cmt_reply').forEach(el => {
        const nicknameEl = el.querySelector('.id_name strong');
        const nickname = nicknameEl?.textContent?.trim() || '';

        const dateEl = el.querySelector('.date');
        const date = dateEl?.textContent?.trim() || '';

        const delTextEl = el.querySelector('.txt_del');
        const delText = delTextEl?.textContent?.trim() || '';

        let content = '';

        if (delText) {
          content = delText;
        } else {
          const contentEl = el.querySelector('.danawa-prodBlog-productOpinion-clazz-content');
          if (contentEl) {
            const cloned = contentEl.cloneNode(true) as HTMLElement;
            const label = cloned.querySelector('.head_text_name');
            if (label) label.remove();
            content = cloned.textContent?.trim() || '';
          }
        }

        if (nickname && content) {
          items.push({
            nickname,
            date,
            content,
            isReply: el.classList.contains('cmt_reply')
          });
        }
      });

      return items;
    });

    console.log('✅ 크롤링 완료 - 리뷰 수:', reviews.length);

    return NextResponse.json({ reviews });

  } catch (err) {
    console.error('❌ 크롤링 에러:', err);
    return NextResponse.json({
      reviews: [],
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (browser) {
      console.log('🔒 브라우저 종료');
      await browser.close();
    }
  }
}