/**
 * DocumentSubmitCTA.tsx — Phase 2-B (Premium Gating)
 *
 * Phase 2-B 변경사항:
 * - isPremium prop 추가
 * - Free 유저: 잠금 UI — 블러 처리 + "Premium으로 잠금 해제" CTA
 * - Premium 유저: 기존 동작 100% 유지
 *
 * 비즈니스 로직 동결 (#26):
 * - onSubmit, faxStatus, isProfileComplete 처리 100% 유지
 *
 * Dennis 규칙:
 * #3  submitFax() 인자 없음
 * #26 비즈니스 로직 건드리지 않음
 * #32 컬러 하드코딩 금지
 * #34 i18n 전 페이지 적용
 */

import { useTranslation } from "react-i18next";
import { Send, Check, Loader2, ChevronRight, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import type { SubmitStatus } from "../../../types";

interface DocumentSubmitCTAProps {
  isProfileComplete: boolean;
  profileReadiness: number;
  faxStatus: SubmitStatus;
  onSubmit: () => void;
  isPremium?: boolean;
}

export function DocumentSubmitCTA({
  isProfileComplete,
  profileReadiness,
  faxStatus,
  onSubmit,
  isPremium = false,
}: DocumentSubmitCTAProps) {
  const { t } = useTranslation();

  const isPending = faxStatus === "pending";
  const isSuccess = faxStatus === "success";

  // ★ Free 유저: 잠금 카드
  if (!isPremium) {
    return (
      <Link
        to="/paywall"
        className="block w-full rounded-3xl p-5 text-left active:scale-[0.98] transition-transform relative overflow-hidden"
        style={{
          backgroundColor: "var(--color-surface-primary)",
          border: "1px solid var(--color-border-default)",
          minHeight: 80,
        }}
      >
        <div className="flex items-center gap-3">
          {/* Icon — 반투명 */}
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-action-success) 10%, transparent)" }}
          >
            <Lock size={22} strokeWidth={2} style={{ color: "var(--color-action-success)" }} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="text-[17px] leading-[22px]"
                style={{ fontWeight: 600, color: "var(--color-text-primary)" }}
              >
                {t("visa:doc_submit_title")}
              </h3>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] leading-[13px]"
                style={{
                  fontWeight: 600,
                  backgroundColor: "color-mix(in srgb, var(--color-action-primary) 12%, transparent)",
                  color: "var(--color-action-primary)",
                }}
              >
                <Lock size={9} strokeWidth={2.5} />
                Premium
              </span>
            </div>
            <p
              className="mt-1 text-[13px] leading-[18px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("visa:doc_submit_desc")}
            </p>
          </div>

          <ChevronRight size={20} className="flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }} />
        </div>
      </Link>
    );
  }

  // ★ Premium 유저: 기존 동작 100% 유지
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
          <h3
            className="text-[20px] leading-[25px]"
            style={{ fontWeight: 600 }}
          >
            {t("visa:doc_submit_title")}
          </h3>
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