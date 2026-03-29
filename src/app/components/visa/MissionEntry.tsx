/**
 * MissionEntry.tsx — Layer 5 UI: Mission-Based Entry
 *
 * 원리: TurboTax Conditional Logic + Boundless Assessment
 * "목적 없는 스크롤 = 이탈" → 유저의 의도를 먼저 묻는다
 *
 * 3가지 진입:
 *   1. "Extend my stay"  → civil_type = 'extension'
 *   2. "Change my status" → civil_type = 'status_change'
 *   3. "Check my score"  → K-point 시뮬레이터로 스크롤
 *
 * 활성 intent가 있으면 → 현재 진행 상태 카드 표시
 */

import { useTranslation } from "react-i18next";
import { CalendarClock, ArrowRightLeft, BarChart3, ChevronRight } from "lucide-react";
import type { VisaIntent } from "../../../stores/useVisaIntentStore";

interface MissionEntryProps {
  onSelect: (civilType: string) => void;
  onScoreClick: () => void;
  currentIntent: VisaIntent | null;
}

export function MissionEntry({ onSelect, onScoreClick, currentIntent }: MissionEntryProps) {
  const { t } = useTranslation();

  // 활성 intent가 있으면 → 진행 상태 카드
  if (currentIntent) {
    const score = currentIntent.readiness_score ?? 0;
    const docsReady = currentIntent.documents_ready ?? 0;
    const docsRequired = currentIntent.documents_required ?? 0;
    const barColor = score === 100
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
        <div className="flex items-center justify-between mb-3">
          <div>
            <p
              className="text-[11px] leading-[13px] mb-1"
              style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}
            >
              {t("visa:mission.current", {
                visaType: currentIntent.visa_type,
                civilType: currentIntent.civil_type === "extension"
                  ? t("visa:mission.extend")
                  : currentIntent.civil_type === "status_change"
                    ? t("visa:mission.change")
                    : currentIntent.civil_type,
                score,
                defaultValue: `In progress: ${currentIntent.visa_type} (${score}%)`,
              })}
            </p>
            <p
              className="text-[22px] leading-[28px]"
              style={{ fontWeight: 700, color: barColor }}
            >
              {score}%
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-[13px] leading-[18px]"
              style={{ fontWeight: 600, color: "var(--color-text-primary)" }}
            >
              {docsReady}/{docsRequired}
            </p>
            <p
              className="text-[11px] leading-[13px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("visa:readiness.progress", {
                uploaded: docsReady,
                total: docsRequired,
                defaultValue: `${docsReady}/${docsRequired} documents ready`,
              })}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--color-surface-secondary)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${score}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
    );
  }

  // 활성 intent 없으면 → 3버튼 진입
  const missions = [
    {
      key: "extension",
      icon: CalendarClock,
      label: t("visa:mission.extend", { defaultValue: "Extend my stay" }),
    },
    {
      key: "status_change",
      icon: ArrowRightLeft,
      label: t("visa:mission.change", { defaultValue: "Change my status" }),
    },
    {
      key: "score",
      icon: BarChart3,
      label: t("visa:mission.score", { defaultValue: "Check my score" }),
    },
  ];

  return (
    <div
      className="rounded-3xl p-4"
      style={{
        backgroundColor: "var(--color-surface-primary)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <p
        className="text-[15px] leading-[20px] mb-3"
        style={{ fontWeight: 600, color: "var(--color-text-primary)" }}
      >
        {t("visa:mission.title", { defaultValue: "What do you need?" })}
      </p>

      <div className="space-y-2">
        {missions.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.key}
              onClick={() =>
                m.key === "score" ? onScoreClick() : onSelect(m.key)
              }
              className="w-full flex items-center gap-3 px-4 rounded-2xl transition-all active:scale-[0.98]"
              style={{
                height: 52,
                backgroundColor: "var(--color-surface-secondary)",
              }}
            >
              <Icon
                size={20}
                style={{ color: "var(--color-action-primary)" }}
              />
              <span
                className="flex-1 text-left text-[15px] leading-[20px]"
                style={{
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                }}
              >
                {m.label}
              </span>
              <ChevronRight
                size={16}
                style={{ color: "var(--color-text-tertiary)" }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}