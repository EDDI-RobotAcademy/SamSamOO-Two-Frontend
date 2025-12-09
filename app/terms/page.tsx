"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function TermsPage() {
  const [serviceChecked, setServiceChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);

  const [serviceScrolled, setServiceScrolled] = useState(false);
  const [privacyScrolled, setPrivacyScrolled] = useState(false);

  const isAllChecked = serviceChecked && privacyChecked;

  // 스크롤 완료 감지
  const handleScroll = (
    e: React.UIEvent<HTMLDivElement>,
    type: "service" | "privacy"
  ) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isBottom = scrollTop + clientHeight >= scrollHeight - 5;

    if (isBottom) {
      if (type === "service") setServiceScrolled(true);
      if (type === "privacy") setPrivacyScrolled(true);
    }
  };

  // 다음 버튼 클릭
  const handleNext = async () => {
    if (!isAllChecked) return;

    // 1. 약관 동의 API 호출
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/authentication/agree-terms`, {
      method: "POST",
      credentials: "include",
    });

    // 2. 사용자 정보 조회
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/authentication/me`, {
      credentials: "include",
    });
    const user = await res.json();

    // 3. 환영 토스트
    toast.success(`🎉 ${user.nickname}님 환영합니다!`, { duration: 3000 });

    // 4. 메인 페이지 이동
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 border rounded bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center">약관 동의</h1>

      {/* 이용약관 */}
      <section className="mb-4">
        <h2 className="font-semibold mb-2">이용약관 (필수)</h2>
        <div
          onScroll={(e) => handleScroll(e, "service")}
          className="h-40 border p-3 overflow-y-scroll text-sm"
        >
          여기에 이용약관 내용을 작성하세요.
          <br />
          (맨 아래까지 스크롤해야 체크 가능합니다)
          <div style={{ height: 400 }} />
        </div>

        <label className="flex items-center mt-2">
          <input
            type="checkbox"
            disabled={!serviceScrolled}
            checked={serviceChecked}
            onChange={(e) => setServiceChecked(e.target.checked)}
            className="mr-2"
          />
          이용약관에 동의합니다.
        </label>
      </section>

      {/* 개인정보 처리방침 */}
      <section className="mb-4">
        <h2 className="font-semibold mb-2">개인정보 처리방침 (필수)</h2>
        <div
          onScroll={(e) => handleScroll(e, "privacy")}
          className="h-40 border p-3 overflow-y-scroll text-sm"
        >
          여기에 개인정보 처리방침 내용을 작성하세요.
          <br />
          (맨 아래까지 스크롤해야 체크 가능합니다)
          <div style={{ height: 400 }} />
        </div>

        <label className="flex items-center mt-2">
          <input
            type="checkbox"
            disabled={!privacyScrolled}
            checked={privacyChecked}
            onChange={(e) => setPrivacyChecked(e.target.checked)}
            className="mr-2"
          />
          개인정보 처리방침에 동의합니다.
        </label>
      </section>

      {/* 경고 문구 */}
      {!isAllChecked && (
        <p className="text-red-500 text-sm mb-4">
          ※ 필수 약관에 모두 동의해야 가입을 완료할 수 있습니다.
        </p>
      )}

      {/* 다음 버튼 */}
      <button
        disabled={!isAllChecked}
        onClick={handleNext}
        className={`w-full py-3 rounded text-white font-semibold ${
          isAllChecked
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        다음으로
      </button>
    </div>
  );
}
