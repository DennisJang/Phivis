/**
 * LawyerMatchCTA.tsx — 행정사 매칭 CTA
 * 면책: "매칭만 수행, 직접 대리 X"
 */

import { useTranslation } from "react-i18next";
import { MessageSquare, ChevronRight } from "lucide-react";

export function LawyerMatchCTA() {
  const { t } = useTranslation();

  return (
    <button
      className="w-full rounded-3xl p-5 text-left active:scale-[0.98] transition-transform"
      style={{
        background:
          "linear-gradient(135deg, var(--color-action-primary), var(--color-action-primary-hover))",
        color: "var(--color-text-on-color)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <MessageSquare size={24} strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h3
            className="text-[17px] leading-[22px]"
            style={{ fontWeight: 600 }}
          >
            {t("visa:lawyer_title")}
          </h3>
          <p className="mt-1 text-[13px] leading-[18px] opacity-90">
            {t("visa:lawyer_desc")}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] leading-[13px]"
              style={{
                fontWeight: 600,
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
            >
              {t("visa:lawyer_free")}
            </span>
          </div>
          {/* 면책 */}
          <p className="mt-2 text-[11px] leading-[13px] opacity-60">
            {t("visa:lawyer_disclaimer")}
          </p>
        </div>
        <ChevronRight size={20} className="mt-1 flex-shrink-0" />
      </div>
    </button>
  );
}