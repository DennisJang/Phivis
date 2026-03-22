/**
 * DocumentSubmitCTA.tsx — Phase 1 (서류 자동제출 CTA)
 *
 * Phase 0-A → Phase 1 변경사항:
 * - Premium 잠금 배지 추가 (와이어프레임: 우상단 "Premium")
 * - ChevronRight 화살표 추가
 * - 내부 submit 버튼 제거 → 카드 전체가 클릭 영역
 * - 레이아웃: 아이콘(좌) + 텍스트(중) + 화살표(우)
 *
 * 비즈니스 로직 동결 (#26):
 * - onSubmit, faxStatus, isProfileComplete 처리 100% 유지
 *
 * Dennis 규칙:
 * #3  submitFax() 인자 없음 (이 컴포넌트에서 호출 안 함, visa.tsx에서 관리)
 * #26 비즈니스 로직 건드리지 않음
 * #32 컬러 하드코딩 금지
 * #34 i18n 전 페이지 적용
 */

import { useTranslation } from "react-i18next";
import { Send, Check, Loader2, ChevronRight, Lock } from "lucide-react";
import type { SubmitStatus } from "../../../types";

interface DocumentSubmitCTAProps {
  isProfileComplete: boolean;
  profileReadiness: number;
  faxStatus: SubmitStatus;
  onSubmit: () => void;
}

export function DocumentSubmitCTA({
  isProfileComplete,
  profileReadiness,
  faxStatus,
  onSubmit,
}: DocumentSubmitCTAProps) {
  const { t } = useTranslation();

  const isPending = faxStatus === "pending";
  const isSuccess = faxStatus === "success";

  return (
    <button
      onClick={onSubmit}
      disabled={!isProfileComplete || isPending}
      className="w-full rounded-3xl p-5 text-left active:scale-[0.98] transition-transform disabled:opacity-60"
      style={{
        background:
          "linear-gradient(135deg, var(--color-action-success), #30A14E)",
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
          {isPending ? (
            <Loader2 size={24} strokeWidth={2} className="animate-spin" />
          ) : isSuccess ? (
            <Check size={24} strokeWidth={2} />
          ) : (
            <Send size={24} strokeWidth={2} />
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className="text-[20px] leading-[25px]"
              style={{ fontWeight: 600 }}
            >
              {t("visa:doc_submit_title")}
            </h3>
            {/* Premium badge */}
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] leading-[13px]"
              style={{
                fontWeight: 600,
                backgroundColor: "rgba(255,255,255,0.25)",
              }}
            >
              <Lock size={10} strokeWidth={2.5} />
              {t("visa:doc_premium_badge")}
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-[18px] opacity-90">
            {isPending
              ? t("visa:doc_submitting")
              : isSuccess
                ? t("visa:doc_submit_success")
                : t("visa:doc_submit_desc")}
          </p>
          {!isProfileComplete && !isPending && !isSuccess && (
            <p className="mt-1 text-[12px] leading-[16px] opacity-70">
              {t("visa:doc_profile_incomplete", { count: profileReadiness })}
            </p>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight size={24} className="flex-shrink-0 opacity-80" />
      </div>
    </button>
  );
}