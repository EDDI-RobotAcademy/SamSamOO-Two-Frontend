import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { reviews } = await req.json();

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({
        error: "리뷰 데이터가 없습니다."
      }, { status: 400 });
    }

    const allText = reviews.map((r: any) => r.content).join(' ');

    // 감성 키워드
    const positiveKeywords = ['좋', '최고', '만족', '추천', '훌륭', '완벽', '괜찮', '우수'];
    const negativeKeywords = ['문제', '고장', '불만', '실망', '별로', '안좋', '최악', '아쉽'];

    let positiveCount = 0;
    let negativeCount = 0;

    positiveKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'g');
      const matches = allText.match(regex);
      if (matches) positiveCount += matches.length;
    });

    negativeKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'g');
      const matches = allText.match(regex);
      if (matches) negativeCount += matches.length;
    });

    // 주요 키워드 추출
    const keywords = [
      { word: '가격', category: '가격' },
      { word: '성능', category: '성능' },
      { word: '디자인', category: '디자인' },
      { word: '품질', category: '품질' },
      { word: '무게', category: '무게' },
      { word: '클릭', category: '사용성' },
      { word: '센서', category: '성능' },
      { word: '내구성', category: '내구성' },
      { word: '고장', category: '품질' },
      { word: '게임', category: '용도' }
    ];

    const keywordFrequency = keywords.map(k => {
      const regex = new RegExp(k.word, 'g');
      const matches = allText.match(regex);
      return {
        keyword: k.word,
        category: k.category,
        count: matches ? matches.length : 0
      };
    }).filter(k => k.count > 0)
      .sort((a, b) => b.count - a.count);

    // 리뷰 길이 분석
    const reviewLengths = reviews.map((r: any) => r.content.length);
    const avgLength = Math.round(
      reviewLengths.reduce((sum: number, len: number) => sum + len, 0) / reviews.length
    );

    const statistics = {
      totalReviews: reviews.length,
      positiveCount,
      negativeCount,
      positiveRatio: ((positiveCount / (positiveCount + negativeCount)) * 100).toFixed(1),
      sentiment: positiveCount > negativeCount ? '긍정적' :
                 negativeCount > positiveCount ? '부정적' : '중립적',
      topKeywords: keywordFrequency.slice(0, 10),
      averageLength: avgLength,
      shortReviews: reviewLengths.filter(l => l < 20).length,
      longReviews: reviewLengths.filter(l => l > 100).length
    };

    return NextResponse.json({ statistics });

  } catch (err) {
    console.error('❌ 통계 분석 에러:', err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}