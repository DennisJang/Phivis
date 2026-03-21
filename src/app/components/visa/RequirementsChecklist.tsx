/**
 * RequirementsChecklist.tsx — 비자 요건 체크리스트
 * toggleChecklistItem으로 낙관적 업데이트 (useDashboardStore)
 */

import { useTranslation } from "react-i18next";
import { CheckCircle, Circle, ChevronRight } from "lucide-react";
import type { ChecklistItem } from "../../../types";

interface RequirementsChecklistProps {
  checklist: ChecklistItem[];
  onToggle: (itemId: number) => void;
}

export function RequirementsChecklist({
  checklist,
  onToggle,
}: RequirementsChecklistProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h2
        className="mb-3 text-[17px] leading-[22px]"
        style={{
          fontWeight: 600,
          color: "var(--color-text-primary)",
        }}
      >
        {t("visa:requirements_title")}
      </h2>
      <div
        className="divide-y rounded-3xl"
        style={{
          backgroundColor: "var(--color-surface-primary)",
          borderColor: "var(--color-border-default)",
        }}
      >
        {checklist.map((req) => (
          <button
            key={req.id}
            onClick={() => onToggle(req.id)}
            className="flex w-full items-center gap-3 p-4 text-left transition-colors active:opacity-70"
          >
            {req.completed ? (
              <CheckCircle
                size={24}
                strokeWidth={2.5}
                className="flex-shrink-0"
                style={{ color: "var(--color-action-success)" }}
              />
            ) : (
              <Circle
                size={24}
                strokeWidth={2}
                className="flex-shrink-0"
                style={{ color: "var(--color-text-secondary)" }}
              />
            )}
            <div className="flex-1">
              <p
                className="text-[15px] leading-[20px]"
                style={{
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {req.title}
              </p>
              <p
                className="mt-0.5 text-[12px] leading-[16px]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {req.subtitle}
              </p>
            </div>
            <ChevronRight
              size={16}
              className="flex-shrink-0"
              style={{ color: "var(--color-text-tertiary)" }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}