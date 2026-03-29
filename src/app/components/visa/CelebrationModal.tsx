/**
 * CelebrationModal.tsx — Layer 5 UI + Layer 4 Notification
 *
 * 원리: TurboTax 완료 축하 + Oura Celebration Moment
 * "성취감이 다음 민원에도 Settle을 쓰는 이유"
 *
 * 트리거: readiness_score가 이전 < 100 → 현재 === 100 일 때 한 번만
 */

import { useTranslation } from "react-i18next";
import { CheckCircle2, X } from "lucide-react";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewGuide: () => void;
}

export function CelebrationModal({ isOpen, onClose, onViewGuide }: CelebrationModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: "var(--color-overlay)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 text-center"
        style={{
          backgroundColor: "var(--color-surface-primary)",
          animation: "slideUp 400ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-all active:scale-[0.95]"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <X size={20} />
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(52,199,89,0.12)" }}
          >
            <CheckCircle2
              size={36}
              style={{ color: "var(--color-action-success)" }}
            />
          </div>
        </div>

        {/* Title */}
        <h2
          className="text-[22px] leading-[28px] mb-2"
          style={{ fontWeight: 700, color: "var(--color-text-primary)" }}
        >
          {t("visa:celebration.title", {
            defaultValue: "Documents ready! 🎉",
          })}
        </h2>

        {/* Subtitle */}
        <p
          className="text-[15px] leading-[20px] mb-6"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("visa:celebration.subtitle", {
            defaultValue: "Next step: Check the submission guide",
          })}
        </p>

        {/* CTA */}
        <button
          onClick={() => {
            onViewGuide();
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl text-[15px] leading-[20px] transition-all active:scale-[0.98] mb-3"
          style={{
            fontWeight: 600,
            backgroundColor: "var(--color-action-success)",
            color: "var(--color-text-on-color)",
            minHeight: 48,
          }}
        >
          {t("visa:celebration.viewGuide", {
            defaultValue: "View submission guide",
          })}
        </button>

        {/* Dismiss */}
        <button
          onClick={onClose}
          className="w-full py-2.5 text-[14px] leading-[20px] transition-all active:scale-[0.98]"
          style={{
            fontWeight: 500,
            color: "var(--color-text-secondary)",
          }}
        >
          {t("common:close", { defaultValue: "Close" })}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}