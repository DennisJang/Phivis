/**
 * KpointSimulator.tsx — Phase 1 (Block A 오케스트레이터)
 *
 * 역할: Visa 탭 Block A 전체 — "E-7-4 Eligibility Diagnosis" 섹션.
 *   - 섹션 헤더 ("E-7-4 ELIGIBILITY DIAGNOSIS")
 *   - ScoreRing (700점 링)
 *   - 5개 카테고리 프로그레스 바
 *
 * Phase 0-A → Phase 1 변경사항:
 * - ScoreRing을 내부에서 호출 (visa.tsx에서 직접 호출 제거)
 * - 섹션 헤더 추가 (와이어프레임 Block A-1 상단)
 * - 카테고리 maxScore 와이어프레임 반영 (Age 200, Income 200, Korean 100, Social 100, Volunteer 100)
 * - 만점(100%) 바 = 초록, 그 외 = 파랑
 * - 각 행에 아이콘 추가 (Lucide 스타일)
 * - K-point 총점 표시는 ScoreRing에 위임
 *
 * 비즈니스 로직 동결 (#26):
 * - visaTracker 데이터 읽기만 함
 * - 점수 계산은 결정론적 합산만 (AI 추론 금지)
 *
 * Dennis 규칙:
 * #26 디자인 작업 시 비즈니스 로직 건드리지 않음
 * #32 컬러 하드코딩 금지
 * #34 i18n 전 페이지 적용
 */

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import {
  Calendar,
  DollarSign,
  BookOpen,
  Users,
  Heart,
} from "lucide-react";
import type { VisaTracker } from "../../../types";
import { ScoreRing } from "./ScoreRing";

interface KpointSimulatorProps {
  visaTracker: VisaTracker | null;
  loading?: boolean;
}

// K-point 카테고리 (700점 만점 배분 — 와이어프레임 기준)
const CATEGORIES = [
  { key: "age", maxScore: 200, labelKey: "visa:kpoint_age", icon: Calendar },
  { key: "income", maxScore: 200, labelKey: "visa:kpoint_income", icon: DollarSign },
  { key: "korean", maxScore: 100, labelKey: "visa:kpoint_korean", icon: BookOpen },
  { key: "social", maxScore: 100, labelKey: "visa:kpoint_social", icon: Users },
  { key: "volunteer", maxScore: 100, labelKey: "visa:kpoint_volunteer", icon: Heart },
] as const;

const MAX_TOTAL = 700;

export function KpointSimulator({
  visaTracker,
  loading = false,
}: KpointSimulatorProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // --- Empty state (DESIGN_SYSTEM.md 섹션 8 — CTA 필수) ---
  if (!visaTracker) {
    return (
      <section>
        {/* Section header */}
        <SectionHeader />

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
      </section>
    );
  }

  // --- Score mapping ---
  const scores: Record<string, number> = {
    age: visaTracker.age_score ?? 0,
    income: visaTracker.income_score ?? 0,
    korean: visaTracker.korean_score ?? 0,
    social: visaTracker.social_score ?? 0,
    volunteer: visaTracker.volunteer_score ?? 0,
  };
  const totalKpoint = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <section>
      {/* Section header — 카드 바깥 */}
      <SectionHeader />

      {/* Main card */}
      <div
        className="rounded-3xl p-6"
        style={{ backgroundColor: "var(--color-surface-primary)" }}
      >
        {/* Score Ring */}
        <ScoreRing
          score={totalKpoint}
          maxScore={MAX_TOTAL}
          loading={loading}
        />

        {/* Divider */}
        <div
          className="my-5"
          style={{ borderTop: "1px solid var(--color-border-default)" }}
        />

        {/* Category Progress Bars */}
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const catScore = scores[cat.key] ?? 0;
            const pct =
              cat.maxScore > 0 ? (catScore / cat.maxScore) * 100 : 0;
            const isMax = pct >= 100;
            const Icon = cat.icon;

            return (
              <div key={cat.key}>
                {/* Label row */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon
                      size={16}
                      style={{ color: "var(--color-text-secondary)" }}
                      strokeWidth={1.5}
                    />
                    <span
                      className="text-[15px] leading-[20px]"
                      style={{
                        fontWeight: 500,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {t(cat.labelKey)}
                    </span>
                  </div>
                  <span
                    className="text-[15px] leading-[20px]"
                    style={{ fontWeight: 600 }}
                  >
                    <span style={{ color: "var(--color-text-primary)" }}>
                      {catScore}
                    </span>
                    <span style={{ color: "var(--color-text-tertiary)" }}>
                      /{cat.maxScore}
                    </span>
                  </span>
                </div>

                {/* Progress bar */}
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
                      backgroundColor: isMax
                        ? "var(--color-action-success)"
                        : "var(--color-action-primary)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p
          className="mt-5 text-[11px] leading-[13px]"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {t("visa:kpoint_disclaimer")}
        </p>
      </div>
    </section>
  );
}

// --- Section Header (카드 바깥) ---
function SectionHeader() {
  const { t } = useTranslation();
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: "var(--color-action-primary)" }}
        />
        <h2
          className="text-[13px] leading-[18px] tracking-wide uppercase"
          style={{
            fontWeight: 600,
            color: "var(--color-action-primary)",
          }}
        >
          {t("visa:kpoint_section_title")}
        </h2>
      </div>
      <p
        className="mt-1 text-[13px] leading-[18px]"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {t("visa:kpoint_section_subtitle")}
      </p>
    </div>
  );
}