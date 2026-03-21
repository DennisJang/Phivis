/**
 * KiipProgress.tsx — KIIP 진행도 (0~5단계)
 */

import { useTranslation } from "react-i18next";

interface KiipProgressProps {
  currentStage: number;
}

const KIIP_LEVELS = [
  { level: 0, titleKey: "visa:kiip_lv0", subtitleKey: "visa:kiip_lv0_sub" },
  { level: 1, titleKey: "visa:kiip_lv1", subtitleKey: "visa:kiip_lv1_sub" },
  { level: 2, titleKey: "visa:kiip_lv2", subtitleKey: "visa:kiip_lv2_sub" },
  { level: 3, titleKey: "visa:kiip_lv3", subtitleKey: "visa:kiip_lv3_sub" },
  { level: 4, titleKey: "visa:kiip_lv4", subtitleKey: "visa:kiip_lv4_sub" },
];

function getStatus(
  level: number,
  current: number
): { labelKey: string; color: string } {
  if (level < current)
    return { labelKey: "visa:kiip_completed", color: "var(--color-action-success)" };
  if (level === current)
    return { labelKey: "visa:kiip_in_progress", color: "var(--color-action-primary)" };
  return { labelKey: "visa:kiip_locked", color: "var(--color-text-secondary)" };
}

export function KiipProgress({ currentStage }: KiipProgressProps) {
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
        {t("visa:kiip_title")}
      </h2>
      <div
        className="space-y-3 rounded-3xl p-5"
        style={{ backgroundColor: "var(--color-surface-primary)" }}
      >
        {KIIP_LEVELS.map((level) => {
          const { labelKey, color } = getStatus(level.level, currentStage);
          return (
            <div key={level.level} className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                }}
              >
                <span
                  className="text-[15px]"
                  style={{ color, fontWeight: 600 }}
                >
                  {level.level}
                </span>
              </div>
              <div className="flex-1">
                <p
                  className="text-[15px] leading-[20px]"
                  style={{
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {t(level.titleKey)}
                </p>
                <p
                  className="mt-0.5 text-[12px] leading-[16px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {t(level.subtitleKey)}
                </p>
              </div>
              <span
                className="rounded-full px-3 py-1 text-[11px] leading-[13px]"
                style={{
                  fontWeight: 600,
                  backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                  color,
                }}
              >
                {t(labelKey)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}