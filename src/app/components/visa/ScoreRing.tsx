/**
 * ScoreRing.tsx — Phase 1 (순수 점수 링 렌더링)
 *
 * 역할: K-point 점수를 원형 링으로 시각화하는 프레젠테이션 컴포넌트.
 * KpointSimulator 내부에서 호출됨 (Block A 통합 카드).
 *
 * Phase 0-A → Phase 1 변경사항:
 * - 100점 만점 → 700점 만점 체계 (K-point 통합)
 * - 링 크기: 192×192 → 120×120pt (와이어프레임 기준)
 * - stroke: 12 → 8pt
 * - Stats Row (Age/KIIP/Stay 3열) 제거 → KpointSimulator의 5카테고리 바로 대체
 * - 컷오프 라인 + "Pass: 700" 추가
 * - props 간소화: score, maxScore, loading만
 *
 * Dennis 규칙:
 * #26 비즈니스 로직 건드리지 않음
 * #32 컬러 하드코딩 금지
 * #34 i18n 전 페이지 적용
 */

import { useTranslation } from "react-i18next";

interface ScoreRingProps {
  score: number;
  maxScore: number;
  loading: boolean;
}

export function ScoreRing({ score, maxScore, loading }: ScoreRingProps) {
  const { t } = useTranslation();

  // --- Ring geometry (120×120pt visible, viewBox 중앙 정렬) ---
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2; // 56
  const cx = size / 2; // 60
  const cy = size / 2; // 60
  const circumference = 2 * Math.PI * radius;
  const progress = maxScore > 0 ? (score / maxScore) * circumference : 0;

  return (
    <div className="flex flex-col items-center">
      {/* Ring — 120×120pt */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--color-surface-secondary)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--color-action-primary)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            className="transition-all duration-1000"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-[34px] leading-[41px]"
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
            /{maxScore}
          </span>
        </div>
      </div>

      {/* Label */}
      <p
        className="mt-3 text-[15px] leading-[20px]"
        style={{
          fontWeight: 500,
          color: "var(--color-text-secondary)",
        }}
      >
        {t("visa:kpoint_score_label")}
      </p>

      {/* Cutoff line — 점선 + "Pass: 700" */}
      <div className="mt-3 flex w-full items-center gap-2">
        <div
          className="flex-1 border-t border-dashed"
          style={{ borderColor: "var(--color-action-warning)" }}
        />
        <span
          className="text-[12px] leading-[16px] whitespace-nowrap"
          style={{
            fontWeight: 600,
            color: "var(--color-action-warning)",
          }}
        >
          {t("visa:kpoint_pass_cutoff", { score: maxScore })}
        </span>
      </div>

      {/* Disclaimer */}
      <p
        className="mt-2 text-[11px] leading-[13px] text-center"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {t("common:disclaimer_visa_score")}
      </p>
    </div>
  );
}