import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

// ⭐ delay 헬퍼 함수 추가
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(req: Request) {
  let browser;
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    console.log('🔍 리뷰 크롤링 시작 - productId:', productId);

    if (!productId) {
      console.log('❌ productId 없음');
      return NextResponse.json({ reviews: [] });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    console.log('🌐 페이지 이동 중...');
    await page.goto(
      `https://prod.danawa.com/info/?pcode=${productId}`,
      { waitUntil: 'networkidle2', timeout: 30000 }
    );

    console.log('⏳ 리뷰 섹션 대기 중...');
    await page.waitForSelector('.cmt_item', { timeout: 10000 });

    // ✅ 수정: page.waitForTimeout → delay 함수 사용
    await delay(1000);

    console.log('📊 리뷰 데이터 추출 중...');
    const reviews = await page.evaluate(() => {
      const items: any[] = [];

      document.querySelectorAll('li.cmt_item, li.cmt_reply').forEach(el => {
        // 닉네임
        const nicknameEl = el.querySelector('.id_name strong');
        const nickname = nicknameEl?.textContent?.trim() || '';

        // 날짜
        const dateEl = el.querySelector('.date');
        const date = dateEl?.textContent?.trim() || '';

        // 삭제된 댓글 체크
        const delTextEl = el.querySelector('.txt_del');
        const delText = delTextEl?.textContent?.trim() || '';

        // 일반 댓글 내용
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
    if (reviews.length > 0) {
      console.log('📝 첫 번째 리뷰:', reviews[0]);
    }

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