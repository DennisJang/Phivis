/**
 * KpointSimulator.tsx — 🆕 E-7-4 K-point 시뮬레이터
 *
 * 700점 만점 기준, 5개 카테고리별 점수 시각화.
 * 합격 컷오프(200점) 대비 현재 위치 표시.
 *
 * 설계 원칙:
 * - 결정론적 계산만 (AI 추론 금지)
 * - 면책: "모의계산이며 실제 선발 결과와 다를 수 있음"
 * - visaTracker 데이터가 없으면 빈 상태 + CTA
 */

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type { VisaTracker } from "../../../types";

interface KpointSimulatorProps {
  visaTracker: VisaTracker | null;
}

// K-point 카테고리 (700점 만점 배분)
const CATEGORIES = [
  { key: "age", maxScore: 200, labelKey: "visa:kpoint_age" },
  { key: "income", maxScore: 80, labelKey: "visa:kpoint_income" },
  { key: "korean", maxScore: 200, labelKey: "visa:kpoint_korean" },
  { key: "social", maxScore: 120, labelKey: "visa:kpoint_social" },
  { key: "volunteer", maxScore: 100, labelKey: "visa:kpoint_volunteer" },
] as const;

const CUTOFF_SCORE = 200; // E-7-4 합격 컷오프

export function KpointSimulator({ visaTracker }: KpointSimulatorProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!visaTracker) {
    // 빈 상태 — CTA 필수 (DESIGN_SYSTEM.md 섹션 8)
    return (
      <div
        className="rounded-3xl p-8 text-center"
        style={{ backgroundColor: "var(--color-surface-primary)" }}
      >
        <p
          className="text-[15px] leading-[20px] mb-4"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("visa:kpoint_empty")}
        </p>
        <button
          onClick={() => navigate("/profile")}
          className="rounded-2xl px-5 py-2.5 text-[15px] active:scale-[0.98] transition-transform"
          style={{
            fontWeight: 600,
            backgroundColor: "var(--color-action-primary)",
            color: "var(--color-text-on-color)",
            minHeight: 44,
          }}
        >
          {t("visa:kpoint_empty_cta")}
        </button>
      </div>
    );
  }

  // 카테고리별 점수 매핑
  const scores: Record<string, number> = {
    age: visaTracker.age_score ?? 0,
    income: visaTracker.income_score ?? 0,
    korean: visaTracker.korean_score ?? 0,
    social: visaTracker.social_score ?? 0,
    volunteer: visaTracker.volunteer_score ?? 0,
  };

  const totalKpoint = Object.values(scores).reduce((a, b) => a + b, 0);
  const isAboveCutoff = totalKpoint >= CUTOFF_SCORE;

  return (
    <div
      className="rounded-3xl p-5"
      style={{ backgroundColor: "var(--color-surface-primary)" }}
    >
      {/* Header */}
      <div className="mb-4">
        <h2
          className="text-[17px] leading-[22px]"
          style={{
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          {t("visa:kpoint_title")}
        </h2>
        <p
          className="text-[13px] leading-[18px] mt-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("visa:kpoint_subtitle")}
        </p>
      </div>

      {/* Total Score */}
      <div className="flex items-baseline gap-2 mb-4">
        <span
          className="text-[34px] leading-[41px]"
          style={{
            fontWeight: 600,
            color: isAboveCutoff
              ? "var(--color-action-success)"
              : "var(--color-action-warning)",
          }}
        >
          {totalKpoint}
        </span>
        <span
          className="text-[15px] leading-[20px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          / 700
        </span>
        <span
          className="ml-2 rounded-full px-2.5 py-0.5 text-[11px] leading-[13px]"
          style={{
            fontWeight: 600,
            backgroundColor: isAboveCutoff
              ? "color-mix(in srgb, var(--color-action-success) 12%, transparent)"
              : "color-mix(in srgb, var(--color-action-warning) 12%, transparent)",
            color: isAboveCutoff
              ? "var(--color-action-success)"
              : "var(--color-action-warning)",
          }}
        >
          {isAboveCutoff
            ? t("visa:kpoint_above")
            : t("visa:kpoint_below", { gap: CUTOFF_SCORE - totalKpoint })}
        </span>
      </div>

      {/* Category Bars */}
      <div className="space-y-3">
        {CATEGORIES.map((cat) => {
          const catScore = scores[cat.key] ?? 0;
          const pct = cat.maxScore > 0 ? (catScore / cat.maxScore) * 100 : 0;
          return (
            <div key={cat.key}>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-[13px] leading-[18px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {t(cat.labelKey)}
                </span>
                <span
                  className="text-[13px] leading-[18px]"
                  style={{
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {catScore}
                  <span style={{ color: "var(--color-text-tertiary)" }}>
                    {" "}
                    / {cat.maxScore}
                  </span>
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full"
                style={{
                  backgroundColor: "var(--color-surface-secondary)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    backgroundColor: "var(--color-action-primary)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p
        className="mt-4 text-[11px] leading-[13px]"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {t("visa:kpoint_disclaimer")}
      </p>
    </div>
  );
}