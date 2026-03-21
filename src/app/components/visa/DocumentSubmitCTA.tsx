/**
 * DocumentSubmitCTA.tsx — 서류 자동제출 CTA
 * 리브랜딩: "팩스" → "Submit documents"
 * 내부 동작은 동일 (Popbill 팩스), 유저에게는 "서류 제출"로 표현
 */

import { useTranslation } from "react-i18next";
import { Send, Check, Loader2 } from "lucide-react";
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

  return (
    <div
      className="rounded-3xl p-5"
      style={{
        background:
          "linear-gradient(135deg, var(--color-action-success), #30A14E)",
        color: "var(--color-text-on-color)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <Send size={24} strokeWidth={2} />
        </div>
        <div className="flex-1 text-left">
          <h3
            className="text-[17px] leading-[22px]"
            style={{ fontWeight: 600 }}
          >
            {t("visa:doc_submit_title")}
          </h3>
          <p className="mt-1 text-[13px] leading-[18px] opacity-90">
            {t("visa:doc_submit_desc")}
          </p>
          {!isProfileComplete && (
            <p className="mt-2 text-[12px] leading-[16px] opacity-75">
              {t("visa:doc_profile_incomplete", { count: profileReadiness })}
            </p>
          )}
          {faxStatus === "success" && (
            <div className="mt-2 flex items-center gap-2">
              <Check size={16} />
              <span className="text-[12px]" style={{ fontWeight: 600 }}>
                {t("visa:doc_submit_success")}
              </span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!isProfileComplete || faxStatus === "pending"}
        className="mt-4 w-full rounded-2xl py-3.5 active:scale-[0.98] transition-transform disabled:opacity-50"
        style={{
          fontWeight: 600,
          backgroundColor: "var(--color-surface-primary)",
          color: "var(--color-action-success)",
          minHeight: 44,
        }}
      >
        {faxStatus === "pending" ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin" />
            {t("visa:doc_submitting")}
          </span>
        ) : (
          t("visa:doc_submit_btn")
        )}
      </button>
    </div>
  );
}