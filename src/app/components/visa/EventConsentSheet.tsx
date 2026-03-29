/**
 * EventConsentSheet.tsx — PIPA 제15조 이벤트 수집 동의 UI
 *
 * 표시 시점: 첫 VisaIntent 생성 시 (MissionEntry 클릭 직후)
 * 저장: user_profiles.event_consent (boolean)
 * 거부 시: logEvent 비활성화, 앱 기능은 정상 사용
 *
 * 법적 근거:
 *   - PIPA 제15조 제1항: 개인정보 수집 시 동의 필수
 *   - settle_events.user_id = 개인정보 처리
 *   - 동의 거부 시 서비스 이용 제한 불가 (PIPA 제16조 제3항)
 *
 * 디자인: LiabilitySheet 패턴 재사용. Apple HIG 바텀시트.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";

interface EventConsentSheetProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function EventConsentSheet({
  isOpen,
  onAccept,
  onDecline,
}: EventConsentSheetProps) {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50"
        style={{
          backgroundColor: "var(--color-overlay)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        onClick={onDecline}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl px-6 pt-6 pb-8"
        style={{
          backgroundColor: "var(--color-surface-primary)",
          animation: "slideUp 400ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center mb-4">
          <div
            className="w-9 h-1 rounded-full"
            style={{ backgroundColor: "var(--color-border-strong)" }}
          />
        </div>

        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,122,255,0.1)" }}
          >
            <Shield size={20} style={{ color: "var(--color-action-primary)" }} />
          </div>
          <h3
            className="text-[20px] leading-[25px]"
            style={{ fontWeight: 600, color: "var(--color-text-primary)" }}
          >
            {t("common:consent.title", { defaultValue: "Data collection notice" })}
          </h3>
        </div>

        {/* Description */}
        <p
          className="text-[15px] leading-[20px] mb-3"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("common:consent.description", {
            defaultValue:
              "Settle collects usage data (document preparation progress, submission guide views) to improve the service. No personal information (name, registration number) is collected.",
          })}
        </p>

        {/* Detail toggle */}
        <button
          className="flex items-center gap-1 mb-4"
          onClick={() => setShowDetail(!showDetail)}
          style={{ color: "var(--color-action-primary)" }}
        >
          <span className="text-[13px] leading-[18px]" style={{ fontWeight: 500 }}>
            {showDetail ? t("common:btn_close", { defaultValue: "Close" }) : t("common:btn_confirm", { defaultValue: "Details" })}
          </span>
          {showDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showDetail && (
          <div
            className="px-4 py-3 rounded-2xl mb-4"
            style={{ backgroundColor: "var(--color-surface-secondary)" }}
          >
            <p
              className="text-[13px] leading-[18px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("common:consent.detail", {
                defaultValue:
                  "Collected: preparation progress, guide views, completion time. Not collected: name, registration number, contact info.",
              })}
            </p>
          </div>
        )}

        {/* Checkbox */}
        <label className="flex items-start gap-3 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded"
            style={{ accentColor: "var(--color-action-primary)" }}
          />
          <span
            className="text-[15px] leading-[20px]"
            style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
          >
            {t("common:consent.checkbox", {
              defaultValue: "I agree to usage data collection",
            })}
          </span>
        </label>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            className="flex-1 py-3.5 rounded-2xl text-[17px] leading-[22px]"
            style={{
              fontWeight: 600,
              backgroundColor: "var(--color-surface-secondary)",
              color: "var(--color-text-primary)",
            }}
            onClick={onDecline}
          >
            {t("common:consent.decline", { defaultValue: "Decline" })}
          </button>
          <button
            className="flex-1 py-3.5 rounded-2xl text-[17px] leading-[22px]"
            style={{
              fontWeight: 600,
              backgroundColor: checked
                ? "var(--color-action-primary)"
                : "var(--color-surface-secondary)",
              color: checked
                ? "var(--color-text-on-color)"
                : "var(--color-text-tertiary)",
              transition: "all 200ms ease",
            }}
            disabled={!checked}
            onClick={onAccept}
          >
            {t("common:consent.accept", { defaultValue: "Accept" })}
          </button>
        </div>

        {/* Footer note */}
        <p
          className="text-[11px] leading-[13px] text-center mt-3"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {t("common:consent.update", {
            defaultValue: "You can change this anytime in MY > Settings",
          })}
        </p>
      </div>
    </>
  );
}