/**
 * ReadinessBar.tsx — Layer 5 UI: Real-time Readiness Score
 *
 * 원리: TurboTax 환급 예상액 실시간 변동 → 동기 부여
 * "숫자가 바뀌면 계속 한다"
 *
 * 색상 로직:
 *   100% = var(--color-action-success) #34C759
 *   나머지 = var(--color-action-primary) #007AFF
 */

import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

interface ReadinessBarProps {
  score: number;
  totalDocs: number;
  uploadedDocs: number;
  onViewGuide?: () => void;
}

export function ReadinessBar({ score, totalDocs, uploadedDocs, onViewGuide }: ReadinessBarProps) {
  const { t } = useTranslation();
  const isComplete = score === 100;
  const barColor = isComplete
    ? "var(--color-action-success)"
    : "var(--color-action-primary)";

  return (
    <div
      className="rounded-3xl p-4"
      style={{
        backgroundColor: "var(--color-surface-primary)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[13px] leading-[18px]"
          style={{ fontWeight: 500, color: "var(--color-text-secondary)" }}
        >
          {t("visa:readiness.title", { defaultValue: "Document readiness" })}
        </span>
        <span
          className="text-[13px] leading-[18px]"
          style={{ fontWeight: 600, color: "var(--color-text-primary)" }}
        >
          {t("visa:readiness.progress", {
            uploaded: uploadedDocs,
            total: totalDocs,
            defaultValue: `${uploadedDocs}/${totalDocs} documents ready`,
          })}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full overflow-hidden mb-2"
        style={{ backgroundColor: "var(--color-surface-secondary)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: barColor }}
        />
      </div>

      {/* 100% complete state */}
      {isComplete && (
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={18}
              style={{ color: "var(--color-action-success)" }}
            />
            <span
              className="text-[14px] leading-[20px]"
              style={{
                fontWeight: 600,
                color: "var(--color-action-success)",
              }}
            >
              {t("visa:readiness.complete", {
                defaultValue: "All documents ready!",
              })}
            </span>
          </div>
          {onViewGuide && (
            <button
              onClick={onViewGuide}
              className="text-[13px] leading-[18px] px-3 py-1.5 rounded-xl transition-all active:scale-[0.98]"
              style={{
                fontWeight: 600,
                backgroundColor: "var(--color-action-success)",
                color: "var(--color-text-on-color)",
              }}
            >
              {t("visa:readiness.nextStep", {
                defaultValue: "Next: Check submission guide",
              })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}