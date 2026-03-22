/**
 * WageCalculator.tsx — Phase 1 (급여 계산기)
 *
 * Phase 0-A → Phase 1 변경사항:
 * - 서브텍스트 "Estimate your monthly pay" 추가
 * - 인풋: 3개 독립 행 (시급/시간/일수) + 우측 라벨 인라인
 * - Night shift: 숫자 인풋 → on/off 토글 스위치 (on = 2시간 기본)
 * - OT 인풋 제거 (와이어프레임에 없음, 계산은 0으로 유지)
 * - 히어로 금액 표시: ₩2,460,000 /month (34pt)
 * - Breakdown: 카드 바깥 심플 행
 * - 전문가 CTA: 가로 2개 pill 버튼
 *
 * 비즈니스 로직 100% 동결 (#26):
 * - calculateWage 함수 변경 없음
 * - MINIMUM_WAGE_2026 = 10,320
 * - 3중 면책 구조 유지 (#35)
 *
 * BUSINESS_MODEL.md 설계 제약 5원칙:
 * 1. "Wage Calculator"로 명명
 * 2. 앱이 판단하지 않음 — 두 숫자 나란히 표시
 * 3. 수집 최소화
 * 4. Free 티어에 포함
 * 5. 면책은 유저 언어로
 */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calculator, Phone, Scale } from "lucide-react";

const MINIMUM_WAGE_2026 = 10_320;
const DEFAULT_NIGHT_HOURS = 2; // 토글 on 시 기본 야간시간

// ──────────────────────────────────────
// calculateWage — 로직 동결 (Phase 0-A 원본)
// ──────────────────────────────────────
interface WageBreakdown {
  basePay: number;
  nightPay: number;
  overtimePay: number;
  weeklyHolidayPay: number;
  totalPay: number;
  minimumMonthlyPay: number;
}

function calculateWage(
  hourlyRate: number,
  hoursPerDay: number,
  daysPerWeek: number,
  nightHours: number,
  overtimeHoursWeek: number
): WageBreakdown {
  const weeksPerMonth = 4.345;
  const basePay = Math.round(
    hourlyRate * hoursPerDay * daysPerWeek * weeksPerMonth
  );
  const nightPay = Math.round(
    hourlyRate * 0.5 * nightHours * daysPerWeek * weeksPerMonth
  );
  const overtimePay = Math.round(
    hourlyRate * 1.5 * overtimeHoursWeek * weeksPerMonth
  );
  const weeklyHours = hoursPerDay * daysPerWeek;
  const weeklyHolidayPay =
    weeklyHours >= 15
      ? Math.round(hourlyRate * hoursPerDay * weeksPerMonth)
      : 0;
  const totalPay = basePay + nightPay + overtimePay + weeklyHolidayPay;
  const minimumMonthlyPay = Math.round(
    MINIMUM_WAGE_2026 * hoursPerDay * daysPerWeek * weeksPerMonth +
      (weeklyHours >= 15
        ? MINIMUM_WAGE_2026 * hoursPerDay * weeksPerMonth
        : 0)
  );
  return {
    basePay,
    nightPay,
    overtimePay,
    weeklyHolidayPay,
    totalPay,
    minimumMonthlyPay,
  };
}

// ──────────────────────────────────────
// Component
// ──────────────────────────────────────
export function WageCalculator() {
  const { t } = useTranslation();

  const [hourlyRate, setHourlyRate] = useState<string>(
    String(MINIMUM_WAGE_2026)
  );
  const [hoursPerDay, setHoursPerDay] = useState<string>("8");
  const [daysPerWeek, setDaysPerWeek] = useState<string>("5");
  const [nightShiftOn, setNightShiftOn] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const nightHours = nightShiftOn ? DEFAULT_NIGHT_HOURS : 0;

  const result = useMemo(() => {
    const rate = Number(hourlyRate) || 0;
    if (rate <= 0) return null;
    return calculateWage(
      rate,
      Number(hoursPerDay) || 8,
      Number(daysPerWeek) || 5,
      nightHours,
      0 // OT hours — 와이어프레임에서 인풋 제거, 0 고정
    );
  }, [hourlyRate, hoursPerDay, daysPerWeek, nightHours]);

  const handleCalculate = () => {
    if (Number(hourlyRate) > 0) setShowResult(true);
  };

  return (
    <div
      className="rounded-3xl p-5"
      style={{ backgroundColor: "var(--color-surface-primary)" }}
    >
      {/* Header */}
      <div className="mb-1">
        <div className="flex items-center gap-2">
          <Calculator
            size={18}
            strokeWidth={1.5}
            style={{ color: "var(--color-action-primary)" }}
          />
          <h3
            className="text-[17px] leading-[22px]"
            style={{
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {t("visa:wage_title")}
          </h3>
        </div>
        <p
          className="mt-1 text-[13px] leading-[18px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("visa:wage_subtitle")}
        </p>
      </div>

      {/* Input Fields — 3개 독립 행 */}
      <div className="mt-4 space-y-3">
        {/* 시급 */}
        <InputRow
          value={hourlyRate}
          onChange={(v) => {
            setHourlyRate(v);
            setShowResult(false);
          }}
          prefix="₩"
          label={t("visa:wage_hourly_label")}
          placeholder={String(MINIMUM_WAGE_2026)}
        />

        {/* 일 근무시간 */}
        <InputRow
          value={hoursPerDay}
          onChange={(v) => {
            setHoursPerDay(v);
            setShowResult(false);
          }}
          label={t("visa:wage_hours_label")}
        />

        {/* 주 근무일 */}
        <InputRow
          value={daysPerWeek}
          onChange={(v) => {
            setDaysPerWeek(v);
            setShowResult(false);
          }}
          label={t("visa:wage_days_label")}
        />
      </div>

      {/* Night shift toggle */}
      <div className="mt-4 flex items-center justify-between">
        <span
          className="text-[15px] leading-[20px]"
          style={{ color: "var(--color-text-primary)" }}
        >
          {t("visa:wage_night_toggle")}
        </span>
        <button
          onClick={() => {
            setNightShiftOn(!nightShiftOn);
            setShowResult(false);
          }}
          className="relative h-[31px] w-[51px] rounded-full transition-colors duration-200"
          style={{
            backgroundColor: nightShiftOn
              ? "var(--color-action-success)"
              : "var(--color-text-tertiary)",
          }}
          role="switch"
          aria-checked={nightShiftOn}
          aria-label={t("visa:wage_night_toggle")}
        >
          <div
            className="absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-transform duration-200"
            style={{
              transform: nightShiftOn
                ? "translateX(22px)"
                : "translateX(2px)",
            }}
          />
        </button>
      </div>

      {/* Calculate button */}
      <button
        onClick={handleCalculate}
        disabled={!hourlyRate || Number(hourlyRate) <= 0}
        className="mt-5 w-full rounded-2xl py-3.5 text-[17px] active:scale-[0.98] transition-transform disabled:opacity-50"
        style={{
          fontWeight: 600,
          backgroundColor: "var(--color-action-primary)",
          color: "var(--color-text-on-color)",
          minHeight: 48,
        }}
      >
        {t("visa:wage_calculate")}
      </button>

      {/* ===== Result ===== */}
      {showResult && result && (
        <div className="mt-6">
          {/* Layer 1: 결과 상단 라벨 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[16px]">📊</span>
            <span
              className="text-[13px] leading-[18px]"
              style={{
                fontWeight: 600,
                color: "var(--color-action-primary)",
              }}
            >
              {t("visa:wage_result_label")}
            </span>
          </div>

          {/* Hero amount */}
          <div className="flex items-baseline gap-1 mb-4">
            <span
              className="text-[34px] leading-[41px]"
              style={{
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              ₩{result.totalPay.toLocaleString()}
            </span>
            <span
              className="text-[15px] leading-[20px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              /{t("visa:wage_per_month")}
            </span>
          </div>

          {/* Your estimate vs Minimum wage — 나란히 비교 카드 */}
          <div
            className="grid grid-cols-2 rounded-2xl overflow-hidden"
            style={{ backgroundColor: "var(--color-surface-secondary)" }}
          >
            <div
              className="p-4"
              style={{
                borderRight: "1px solid var(--color-border-default)",
              }}
            >
              <p
                className="text-[12px] leading-[16px] mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("visa:wage_your_estimate")}
              </p>
              <p
                className="text-[17px] leading-[22px]"
                style={{
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                ₩{result.totalPay.toLocaleString()}
              </p>
            </div>
            <div className="p-4">
              <p
                className="text-[12px] leading-[16px] mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("visa:wage_minimum_ref")}
              </p>
              <p
                className="text-[17px] leading-[22px]"
                style={{
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                ₩{result.minimumMonthlyPay.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Breakdown — 심플 행 */}
          <div className="mt-4 space-y-2.5">
            {[
              { label: t("visa:wage_base"), value: result.basePay },
              { label: t("visa:wage_night"), value: result.nightPay },
              { label: t("visa:wage_ot"), value: result.overtimePay },
              {
                label: t("visa:wage_holiday"),
                value: result.weeklyHolidayPay,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between"
              >
                <span
                  className="text-[13px] leading-[18px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {row.label}
                </span>
                <span
                  className="text-[13px] leading-[18px]"
                  style={{
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                  }}
                >
                  ₩{row.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Layer 2: 법적 효력 없음 면책 */}
          <div
            className="mt-5 pt-4"
            style={{
              borderTop: "1px solid var(--color-border-default)",
            }}
          >
            <p
              className="text-[12px] leading-[16px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {t("visa:wage_disclaimer")}
            </p>
          </div>

          {/* Layer 3: 전문가 연결 CTA */}
          <div className="mt-4">
            <p
              className="text-[15px] leading-[20px] mb-3"
              style={{
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {t("visa:wage_expert_title")}
            </p>
            <div className="flex gap-3">
              <a
                href="tel:1350"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 active:scale-[0.98] transition-transform"
                style={{
                  backgroundColor: "var(--color-surface-secondary)",
                  minHeight: 44,
                }}
              >
                <Phone
                  size={16}
                  strokeWidth={1.5}
                  style={{ color: "var(--color-text-primary)" }}
                />
                <span
                  className="text-[13px] leading-[18px]"
                  style={{
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {t("visa:wage_call_1350")}
                </span>
              </a>
              <a
                href="https://www.kicpa.or.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 active:scale-[0.98] transition-transform"
                style={{
                  backgroundColor: "var(--color-surface-secondary)",
                  minHeight: 44,
                }}
              >
                <Scale
                  size={16}
                  strokeWidth={1.5}
                  style={{ color: "var(--color-text-primary)" }}
                />
                <span
                  className="text-[13px] leading-[18px]"
                  style={{
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {t("visa:wage_find_labor")}
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────
// InputRow — 와이어프레임 스타일 인풋 (값 좌측, 라벨 우측)
// ──────────────────────────────────────
function InputRow({
  value,
  onChange,
  label,
  prefix,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  prefix?: string;
  placeholder?: string;
}) {
  return (
    <div
      className="flex items-center rounded-2xl px-4"
      style={{
        backgroundColor: "var(--color-surface-secondary)",
        minHeight: 48,
      }}
    >
      {prefix && (
        <span
          className="mr-1 text-[15px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {prefix}
        </span>
      )}
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent py-3 text-[15px] outline-none"
        style={{
          color: "var(--color-text-primary)",
          fontWeight: 500,
        }}
      />
      <span
        className="ml-2 text-[13px] leading-[18px] whitespace-nowrap"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
      </span>
    </div>
  );
}