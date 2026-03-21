/**
 * ScoreRing.tsx — 비자 점수 링
 * 데이터: visaTracker.total_score, age_score, kiip_stage
 * 면책: "참고용이며 법적 효력 없음" (인라인)
 */

import { useTranslation } from "react-i18next";

interface ScoreRingProps {
  score: number;
  targetScore: number;
  loading: boolean;
  visaType: string | null;
  ageScore: number;
  kiipStage: number;
  stayYears: number;
}

export function ScoreRing({
  score,
  targetScore,
  loading,
  visaType,
  ageScore,
  kiipStage,
  stayYears,
}: ScoreRingProps) {
  const { t } = useTranslation();
  const circumference = 2 * Math.PI * 88; // r=88
  const progress = (score / targetScore) * circumference;

  return (
    <div
      className="rounded-3xl p-8"
      style={{ backgroundColor: "var(--color-surface-primary)" }}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Ring */}
        <div className="relative h-48 w-48">
          <svg className="h-full w-full -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="var(--color-surface-secondary)"
              strokeWidth="12"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="var(--color-action-primary)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-[48px] leading-[48px]"
              style={{
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {loading ? "—" : score}
            </span>
            <span
              className="text-[13px] leading-[18px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              / {targetScore}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1 text-center">
          <h2
            className="text-[22px] leading-[28px]"
            style={{
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {t("visa:score_title")}
          </h2>
          <p
            className="text-[13px] leading-[18px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {visaType
              ? t("visa:score_subtitle_type", { type: visaType })
              : t("visa:score_subtitle_default")}
          </p>
        </div>

        {/* Stats Row */}
        <div
          className="grid w-full grid-cols-3 gap-4 pt-4"
          style={{ borderTop: "1px solid var(--color-border-default)" }}
        >
          <div className="text-center">
            <p
              className="text-[22px] leading-[28px]"
              style={{
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {ageScore}
            </p>
            <p
              className="mt-1 text-[12px] leading-[16px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("visa:stat_age")}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-[22px] leading-[28px]"
              style={{
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              Lv.{kiipStage}
            </p>
            <p
              className="mt-1 text-[12px] leading-[16px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("visa:stat_kiip")}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-[22px] leading-[28px]"
              style={{
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {stayYears.toFixed(1)}Y
            </p>
            <p
              className="mt-1 text-[12px] leading-[16px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("visa:stat_stay")}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p
          className="text-[11px] leading-[13px] text-center"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {t("common:disclaimer_visa_score")}
        </p>
      </div>
    </div>
  );
}