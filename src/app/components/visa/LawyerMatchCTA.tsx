/**
 * LawyerMatchCTA.tsx — Phase 1 (행정사/컨설턴트 매칭 CTA)
 *
 * Phase 0-A → Phase 1 변경사항:
 * - 타이틀: "Immigration lawyer matching" → "Find a Consultant" (와이어프레임)
 * - 아이콘: MessageSquare → Users (와이어프레임)
 * - "DIY vs Professional" 부제 추가
 * - "Free consultation" 배지 제거 (와이어프레임에 없음)
 * - 면책은 이 컴포넌트가 아닌 visa.tsx에서 카드 바깥에 표시
 *
 * 비즈니스 로직: 없음 (CTA 버튼만)
 *
 * Dennis 규칙:
 * #32 컬러 하드코딩 금지
 * #34 i18n 전 페이지 적용
 */

import { useTranslation } from "react-i18next";
import { Users, ChevronRight } from "lucide-react";

export function LawyerMatchCTA() {
  const { t } = useTranslation();

  return (
    <button
      className="w-full rounded-3xl p-5 text-left active:scale-[0.98] transition-transform"
      style={{
        background:
          "linear-gradient(135deg, var(--color-action-primary), var(--color-action-primary-hover))",
        color: "var(--color-text-on-color)",
        minHeight: 80,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <Users size={24} strokeWidth={2} />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-[20px] leading-[25px]"
            style={{ fontWeight: 600 }}
          >
            {t("visa:lawyer_title")}
          </h3>
          <p className="mt-1 text-[13px] leading-[18px] opacity-90">
            {t("visa:lawyer_desc")}
          </p>
          <p className="mt-0.5 text-[12px] leading-[16px] opacity-70">
            {t("visa:lawyer_subtitle")}
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight size={24} className="flex-shrink-0 opacity-80" />
      </div>
    </button>
  );
}