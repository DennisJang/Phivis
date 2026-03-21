/**
 * LiabilitySheet.tsx — 서류 제출 면책 모달
 * Dennis 규칙 #6: prop은 isOpen (open 아님)
 * slideUp 애니메이션: theme.css의 .animate-slide-up 사용
 */

import { useTranslation } from "react-i18next";
import { Send, Loader2, AlertTriangle } from "lucide-react";
import type { SubmitStatus } from "../../../types";

interface LiabilitySheetProps {
  isOpen: boolean; // "open" 아님! (규칙 #6)
  onClose: () => void;
  onConfirm: () => void;
  liabilityAccepted: boolean;
  onLiabilityChange: (accepted: boolean) => void;
  faxStatus: SubmitStatus;
  faxError: string | null;
  faxNumber: string;
  applicantName: string | null;
  visaType: string | null;
}

export function LiabilitySheet({
  isOpen,
  onClose,
  onConfirm,
  liabilityAccepted,
  onLiabilityChange,
  faxStatus,
  faxError,
  faxNumber,
  applicantName,
  visaType,
}: LiabilitySheetProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{
        backgroundColor: "var(--color-overlay)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        className="w-full max-w-lg animate-slide-up space-y-5 rounded-t-3xl p-6"
        style={{ backgroundColor: "var(--color-surface-primary)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3
            className="text-[17px] leading-[22px]"
            style={{
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {t("visa:liability_title")}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--color-surface-secondary)" }}
            aria-label={t("common:btn_close")}
          >
            <span
              className="text-[13px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              ✕
            </span>
          </button>
        </div>

        {/* Summary */}
        <div
          className="space-y-2 rounded-2xl p-4"
          style={{ backgroundColor: "var(--color-surface-secondary)" }}
        >
          {[
            { label: t("visa:liability_type"), value: t("visa:liability_type_val") },
            { label: t("visa:liability_fax"), value: faxNumber },
            { label: t("visa:liability_name"), value: applicantName ?? "—" },
            { label: t("visa:liability_visa"), value: visaType ?? "—" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between text-[13px] leading-[18px]"
            >
              <span style={{ color: "var(--color-text-secondary)" }}>
                {row.label}
              </span>
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Liability Checkbox */}
        <label
          className="flex cursor-pointer items-start gap-3 rounded-2xl p-4"
          style={{ backgroundColor: "var(--color-action-warning)", opacity: 0.15 }}
        >
          {/* Fix: use a wrapper with proper bg */}
        </label>
        <label
          className="flex cursor-pointer items-start gap-3 rounded-2xl p-4"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-action-warning) 15%, var(--color-surface-primary))" }}
        >
          <input
            type="checkbox"
            checked={liabilityAccepted}
            onChange={(e) => onLiabilityChange(e.target.checked)}
            className="mt-0.5 h-5 w-5 flex-shrink-0 rounded"
            style={{ accentColor: "var(--color-action-primary)" }}
          />
          <div>
            <p
              className="text-[13px] leading-[18px]"
              style={{
                fontWeight: 600,
                color: "var(--color-action-warning)",
              }}
            >
              {t("visa:liability_checkbox")}
            </p>
            <p
              className="mt-1 text-[12px] leading-[16px]"
              style={{ color: "var(--color-action-warning)" }}
            >
              {t("visa:liability_checkbox_en")}
            </p>
          </div>
        </label>

        {/* Error */}
        {faxError && (
          <div
            className="flex items-start gap-2 rounded-2xl p-3"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-action-error) 10%, transparent)",
            }}
          >
            <AlertTriangle
              size={16}
              className="mt-0.5 flex-shrink-0"
              style={{ color: "var(--color-action-error)" }}
            />
            <p
              className="text-[13px] leading-[18px]"
              style={{ color: "var(--color-action-error)" }}
            >
              {faxError}
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={onConfirm}
          disabled={!liabilityAccepted || faxStatus === "pending"}
          className="flex w-full items-center justify-center gap-3 rounded-2xl py-3.5 active:scale-[0.98] transition-transform disabled:opacity-40"
          style={{
            fontWeight: 600,
            backgroundColor: "var(--color-action-success)",
            color: "var(--color-text-on-color)",
            minHeight: 44,
          }}
        >
          {faxStatus === "pending" ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {t("visa:liability_submitting")}
            </>
          ) : (
            <>
              <Send size={20} />
              {t("visa:liability_submit")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}