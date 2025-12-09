import { NextResponse } from "next/server";
// import pool from "@/lib/db"; // ⭐ 주석 처리

// 키워드 사전 정의
const KEYWORDS = {
  quality: {
    positive: ['좋', '훌륭', '완벽', '최고', '만족', '추천', '괜찮', '우수', '뛰어나', '성능', '품질'],
    negative: ['문제', '고장', '불만', '실망', '별로', '안좋', '최악', '아쉽', '불편', '단점']
  },

  attributes: {
    performance: ['성능', '속도', '반응', '센서', '정확', '빠르'],
    design: ['디자인', '외관', '모양', '예쁘', '세련', '깔끔'],
    durability: ['내구성', '고장', '오래', '튼튼', '견고', '수명'],
    price: ['가격', '비싸', '저렴', '가성비', '비용'],
    weight: ['무게', '가벼', '무거', '무게감'],
    usability: ['편하', '불편', '사용', '조작', '그립', '손']
  },

  sentiment: {
    veryPositive: ['최고', '완벽', '훌륭', '강력추천'],
    positive: ['좋', '만족', '추천', '괜찮'],
    neutral: ['보통', '그냥', '평범'],
    negative: ['별로', '실망', '아쉽'],
    veryNegative: ['최악', '환불', '후회', '불만']
  }
};

function analyzeKeywords(reviews: any[]) {
  const allText = reviews.map(r => r.content).join(' ');
  const results: any = {};

  Object.keys(KEYWORDS.attributes).forEach(category => {
    const keywords = (KEYWORDS.attributes as any)[category];
    let count = 0;
    keywords.forEach((keyword: string) => {
      const regex = new RegExp(keyword, 'g');
      const matches = allText.match(regex);
      count += matches ? matches.length : 0;
    });
    results[category] = count;
  });

  return results;
}

function analyzeSentiment(reviews: any[]) {
  let positiveScore = 0;
  let negativeScore = 0;

  reviews.forEach(review => {
    const content = review.content;

    KEYWORDS.quality.positive.forEach(keyword => {
      if (content.includes(keyword)) {
        positiveScore += 1;
      }
    });

    KEYWORDS.quality.negative.forEach(keyword => {
      if (content.includes(keyword)) {
        negativeScore += 1;
      }
    });
  });

  return {
    positive: positiveScore,
    negative: negativeScore,
    ratio: positiveScore / (positiveScore + negativeScore || 1)
  };
}

function extractIssues(reviews: any[]) {
  const issues: any[] = [];
  const commonIssues = [
    { keyword: '더블클릭', category: '품질', severity: 'high' },
    { keyword: '고장', category: '내구성', severity: 'high' },
    { keyword: '비싸', category: '가격', severity: 'medium' },
    { keyword: '무거', category: '무게', severity: 'low' },
    { keyword: '불편', category: '사용성', severity: 'medium' }
  ];

  commonIssues.forEach(issue => {
    const mentionCount = reviews.filter(r =>
      r.content.includes(issue.keyword)
    ).length;

    if (mentionCount > 0) {
      issues.push({
        ...issue,
        count: mentionCount,
        percentage: ((mentionCount / reviews.length) * 100).toFixed(1)
      });
    }
  });

  return issues.sort((a, b) => b.count - a.count);
}

function calculateQualityScore(sentiment: any, keywords: any, issues: any[]) {
  let score = 5.0;
  score += sentiment.ratio * 3;
  if (keywords.performance > 5) score += 0.5;
  const highIssues = issues.filter(i => i.severity === 'high');
  score -= highIssues.length * 1.0;
  return Math.max(0, Math.min(10, score)).toFixed(1);
}

function getAttributeName(attr: string): string {
  const names: any = {
    performance: '성능',
    design: '디자인',
    durability: '내구성',
    price: '가격',
    weight: '무게',
    usability: '사용성'
  };
  return names[attr] || attr;
}

function generateMarketingMessages(keywords: any, strengths: string[]): string {
  const messages: string[] = [];

  if (keywords.performance > 5) {
    messages.push('1. "프로가 선택한 성능, 이제 당신의 무기로"');
  }
  if (keywords.weight > 3) {
    messages.push(`${messages.length + 1}. "가벼움이 만드는 차이, 경험해보세요"`);
  }
  if (keywords.design > 2) {
    messages.push(`${messages.length + 1}. "성능과 디자인, 두 마리 토끼를 잡다"`);
  }

  if (messages.length === 0) {
    messages.push('1. "검증된 품질, 신뢰할 수 있는 선택"');
  }

  return messages.join('\n');
}

function generateReport(data: any) {
  const { productName, reviews, keywords, sentiment, issues, qualityScore } = data;

  const topAttributes = Object.entries(keywords)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 3);

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (keywords.performance > 5) strengths.push('우수한 성능과 센서 정확도');
  if (keywords.weight > 3) strengths.push('가벼운 무게로 편안한 사용감');
  if (keywords.design > 2) strengths.push('세련된 디자인');

  issues.forEach(issue => {
    if (issue.severity === 'high') {
      weaknesses.push(`${issue.category} 문제 (${issue.percentage}% 언급)`);
    }
  });

  const sentimentText = sentiment.ratio > 0.6 ? '긍정적' :
                        sentiment.ratio > 0.4 ? '중립적' : '부정적';

  return `# ${productName} 리뷰 분석 보고서

## 📊 1. 제품 품질 평가

### 전반적인 품질 점수: **${qualityScore}/10**

**감성 분석 결과**: ${sentimentText} (긍정 ${sentiment.positive}회 / 부정 ${sentiment.negative}회)

### ✅ 주요 장점
${strengths.length > 0 ? strengths.map((s, i) => `${i + 1}. ${s}`).join('\n') : '- 리뷰에서 명확한 장점을 찾기 어렵습니다.'}

### ⚠️ 주요 단점
${weaknesses.length > 0 ? weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n') : '- 특별한 단점이 언급되지 않았습니다.'}

### 🔍 품질 관련 핵심 이슈
${issues.length > 0 ?
  `가장 많이 언급된 문제는 "${issues[0].keyword}"로, ${issues[0].percentage}%의 리뷰에서 언급되었습니다.` :
  '특별한 품질 이슈가 발견되지 않았습니다.'}

---

## 🎯 2. 마케팅 개선방안

### 강조해야 할 마케팅 포인트
${topAttributes.map((attr: any, i) =>
  `${i + 1}. **${getAttributeName(attr[0])}** - 사용자들이 가장 많이 언급 (${attr[1]}회)`
).join('\n')}

### 개선이 필요한 영역
${issues.length > 0 ?
  issues.slice(0, 3).map((issue, i) =>
    `${i + 1}. ${issue.category}: ${issue.keyword} 문제 해결 강조`
  ).join('\n') :
  '- 현재 큰 개선 사항은 없으나, 지속적인 품질 관리 필요'}

### 추천 마케팅 메시지
${generateMarketingMessages(keywords, strengths)}

### 타겟 고객층
- 1차: ${sentiment.ratio > 0.5 ? '프로게이머 및 하드코어 게이머' : '일반 사용자'}
- 2차: ${keywords.performance > 5 ? '고성능을 중시하는 사용자' : '가성비를 중시하는 사용자'}

---

## 🔧 3. 제품 개선 제안

### 즉시 개선 필요 사항
${issues.filter(i => i.severity === 'high').map((issue, i) =>
  `${i + 1}. **${issue.category} 개선**: ${issue.keyword} 문제 (${issue.count}건 언급)`
).join('\n') || '- 긴급한 개선 사항 없음'}

### 중장기 개선 방향
1. 품질 일관성 유지 및 내구성 강화
2. 사용자 피드백 기반 소프트웨어 업데이트
3. A/S 정책 개선 및 고객 지원 강화

### 고객 만족도 향상 방안
1. 주요 이슈에 대한 투명한 커뮤니케이션
2. 보증 기간 연장 또는 교환 정책 개선
3. 사용자 커뮤니티 활성화

---

**분석 기준**: 총 ${reviews.length}개 리뷰 분석 완료
**분석 일시**: ${new Date().toLocaleString('ko-KR')}
`;
}

export async function POST(req: Request) {
  try {
    const { reviews, productName } = await req.json();

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({
        error: "리뷰 데이터가 없습니다."
      }, { status: 400 });
    }

    console.log('📊 자체 분석 시작...');

    const keywords = analyzeKeywords(reviews);
    const sentiment = analyzeSentiment(reviews);
    const issues = extractIssues(reviews);
    const qualityScore = calculateQualityScore(sentiment, keywords, issues);

    const analysis = generateReport({
      productName,
      reviews,
      keywords,
      sentiment,
      issues,
      qualityScore
    });

    console.log('✅ 분석 완료');

    return NextResponse.json({
      analysis,
      data: {
        keywords,
        sentiment,
        issues,
        qualityScore
      }
    });

  } catch (err) {
    console.error('❌ 분석 에러:', err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}