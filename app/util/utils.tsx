/**
 * Platform Display Utilities
 * 플랫폼 표시 관련 유틸리티 함수들
 */

/**
 * 플랫폼 소스를 한글 이름으로 변환
 */
export const getPlatformDisplayName = (source: string): string => {
  const platformNames: Record<string, string> = {
    lotteon: "롯데ON",
    elevenst: "11번가",
    coupang: "쿠팡",
    naver: "네이버쇼핑",
    auction: "옥션",
    interpark: "인터파크",
  };
  
  return platformNames[source.toLowerCase()] || source;
};

/**
 * 플랫폼별 뱃지 색상 반환 (Tailwind CSS 클래스)
 */
export const getPlatformBadgeColor = (source: string): string => {
  const colors: Record<string, string> = {
    lotteon: "bg-red-100 text-red-800",
    elevenst: "bg-orange-100 text-orange-800",
    coupang: "bg-blue-100 text-blue-800",
    naver: "bg-emerald-100 text-emerald-800",
    auction: "bg-purple-100 text-purple-800",
    interpark: "bg-pink-100 text-pink-800",
  };
  
  return colors[source.toLowerCase()] || "bg-gray-100 text-gray-800";
};

/**
 * 플랫폼별 다크모드 뱃지 색상 반환 (Tailwind CSS 클래스)
 */
export const getPlatformBadgeColorDark = (source: string): string => {
  const colors: Record<string, string> = {
    lotteon: "dark:bg-red-900 dark:text-red-200",
    elevenst: "dark:bg-orange-900 dark:text-orange-200",
    coupang: "dark:bg-blue-900 dark:text-blue-200",
    naver: "dark:bg-emerald-900 dark:text-emerald-200",
    auction: "dark:bg-purple-900 dark:text-purple-200",
    interpark: "dark:bg-pink-900 dark:text-pink-200",
  };
  
  return colors[source.toLowerCase()] || "dark:bg-gray-900 dark:text-gray-200";
};

/**
 * 플랫폼 아이콘 이모지 반환
 */
export const getPlatformIcon = (source: string): string => {
  const icons: Record<string, string> = {
    lotteon: "🏬",
    elevenst: "🛍️",
    coupang: "📦",
    naver: "🔍",
    auction: "⚡",
    interpark: "🎫",
  };
  
  return icons[source.toLowerCase()] || "🛒";
};

/**
 * 플랫폼 URL 생성
 */
export const getPlatformUrl = (source: string, productId: string): string => {
  const urlTemplates: Record<string, string> = {
    lotteon: `https://www.lotteon.com/p/product/${productId}`,
    elevenst: `https://www.11st.co.kr/products/${productId}`,
    coupang: `https://www.coupang.com/vp/products/${productId}`,
    naver: `https://search.shopping.naver.com/catalog/${productId}`,
  };
  
  return urlTemplates[source.toLowerCase()] || "#";
};

/**
 * 평점을 별 이모지로 변환
 */
export const getRatingStars = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return "★".repeat(fullStars) + 
         (hasHalfStar ? "⯨" : "") + 
         "☆".repeat(emptyStars);
};

/**
 * 날짜를 상대적 시간으로 변환 (예: "3일 전", "2개월 전")
 */
export const getRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHour = Math.floor(diffInMin / 60);
  const diffInDay = Math.floor(diffInHour / 24);
  const diffInMonth = Math.floor(diffInDay / 30);
  const diffInYear = Math.floor(diffInDay / 365);

  if (diffInYear > 0) return `${diffInYear}년 전`;
  if (diffInMonth > 0) return `${diffInMonth}개월 전`;
  if (diffInDay > 0) return `${diffInDay}일 전`;
  if (diffInHour > 0) return `${diffInHour}시간 전`;
  if (diffInMin > 0) return `${diffInMin}분 전`;
  return "방금 전";
};

/**
 * 숫자를 한국어 포맷으로 변환 (예: 1000 -> "1,000")
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("ko-KR").format(num);
};

/**
 * 가격을 원화로 포맷 (예: 10000 -> "10,000원")
 */
export const formatPrice = (price: number): string => {
  return `${formatNumber(price)}원`;
};

