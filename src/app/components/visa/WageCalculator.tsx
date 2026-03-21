/**
 * WageCalculator.tsx — 🆕 급여 계산기
 *
 * SETTLE_ARCHITECTURE_V2.md Layer 3:
 * - 순수 클라이언트 사이드 계산 (DB 불사용, Edge Function 불호출)
 * - Store 불사용 (visa.tsx 내부 state만)
 *
 * BUSINESS_MODEL.md 설계 제약 5원칙:
 * 1. "Wage Calculator"로 명명 ("Verifier"/"Checker" 금지)
 * 2. 앱이 판단하지 않음 — 두 숫자 나란히 표시, 유저가 비교
 * 3. 수집 최소화 — 시급/근무시간/야간 3개만
 * 4. Free 티어에 포함
 * 5. 면책은 유저 언어로 (다국어 필수)
 *
 * 면책 3중 구조 (Dennis 규칙 #35):
 * Layer 1: 결과 상단 "예상 급여 (모의계산)"
 * Layer 2: 결과 하단 법적 효력 없음 고지
 * Layer 3: 전문가 연결 CTA (1350 + 공인노무사)
 */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calculator, Phone, User } from "lucide-react";

const MINIMUM_WAGE_2026 = 10_320; // 원/시간 — 하드코딩 OK (연 1회 업데이트)

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
  // 기본급: 시급 × 일 근무시간 × 주 근무일 × 4.345주
  const weeksPerMonth = 4.345;
  const basePay = Math.round(
    hourlyRate * hoursPerDay * daysPerWeek * weeksPerMonth
  );

  // 야간수당: 시급 × 0.5 × 야간시간 × 주 근무일 × 4.345주
  const nightPay = Math.round(
    hourlyRate * 0.5 * nightHours * daysPerWeek * weeksPerMonth
  );

  // 초과근무수당: 시급 × 1.5 × 주 초과시간 × 4.345주
  const overtimePay = Math.round(
    hourlyRate * 1.5 * overtimeHoursWeek * weeksPerMonth
  );

  // 주휴수당: 주 15시간 이상 시, 시급 × 일 근무시간 × 4.345주
  const weeklyHours = hoursPerDay * daysPerWeek;
  const weeklyHolidayPay =
    weeklyHours >= 15
      ? Math.round(hourlyRate * hoursPerDay * weeksPerMonth)
      : 0;

  const totalPay = basePay + nightPay + overtimePay + weeklyHolidayPay;

  // 최저임금 기준 월급 (동일 근무시간 가정)
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

export function WageCalculator() {
  const { t } = useTranslation();

  // 입력 상태 (수집 최소화 원칙: 3+2개만)
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [hoursPerDay, setHoursPerDay] = useState<string>("8");
  const [daysPerWeek, setDaysPerWeek] = useState<string>("5");
  const [nightHours, setNightHours] = useState<string>("0");
  const [overtimeHours, setOvertimeHours] = useState<string>("0");
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    const rate = Number(hourlyRate) || 0;
    if (rate <= 0) return null;
    return calculateWage(
      rate,
      Number(hoursPerDay) || 8,
      Number(daysPerWeek) || 5,
      Number(nightHours) || 0,
      Number(overtimeHours) || 0
    );
  }, [hourlyRate, hoursPerDay, daysPerWeek, nightHours, overtimeHours]);

  const handleCalculate = () => {
    if (Number(hourlyRate) > 0) setShowResult(true);
  };

  return (
    <div
      className="rounded-3xl p-5"
      style={{ backgroundColor: "var(--color-surface-primary)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calculator
          size={18}
          style={{ color: "var(--color-action-primary)" }}
        />
        <h2
          className="text-[17px] leading-[22px]"
          style={{
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          {t("visa:wage_title")}
        </h2>
      </div>

      {/* Input Fields */}
      <div className="space-y-3">
        {/* 시급 */}
        <div>
          <label
            className="mb-1 block text-[13px] leading-[18px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t("visa:wage_hourly_rate")}
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              ₩
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={hourlyRate}
              onChange={(e) => {
                setHourlyRate(e.target.value);
                setShowResult(false);
              }}
              placeholder={String(MINIMUM_WAGE_2026)}
              className="w-full rounded-2xl py-3 pl-8 pr-4 text-[15px] outline-none transition-all focus:ring-2"
              style={{
                backgroundColor: "var(--color-surface-secondary)",
                color: "var(--color-text-primary)",
                minHeight: 48,
              }}
            />
          </div>
        </div>

        {/* 2-column: 일 근무시간 / 주 근무일 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="mb-1 block text-[13px] leading-[18px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("visa:wage_hours_day")}
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={hoursPerDay}
              onChange={(e) => {
                setHoursPerDay(e.target.value);
                setShowResult(false);
              }}
              className="w-full rounded-2xl py-3 px-4 text-[15px] outline-none transition-all focus:ring-2"
              style={{
                backgroundColor: "var(--color-surface-secondary)",
                color: "var(--color-text-primary)",
                minHeight: 48,
              }}
            />
          </div>
          <div>
            <label
              className="mb-1 block text-[13px] leading-[18px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("visa:wage_days_week")}
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={daysPerWeek}
              onChange={(e) => {
                setDaysPerWeek(e.target.value);
                setShowResult(false);
              }}
              className="w-full rounded-2xl py-3 px-4 text-[15px] outline-none transition-all focus:ring-2"
              style={{
                backgroundColor: "var(--color-surface-secondary)",
                color: "var(--color-text-primary)",
                minHeight: 48,
              }}
            />
          </div>
        </div>

        {/* 2-column: 야간시간 / 초과근무 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="mb-1 block text-[13px] leading-[18px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("visa:wage_night_hours")}
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={nightHours}
              onChange={(e) => {
                setNightHours(e.target.value);
                setShowResult(false);
              }}
              className="w-full rounded-2xl py-3 px-4 text-[15px] outline-none transition-all focus:ring-2"
              style={{
                backgroundColor: "var(--color-surface-secondary)",
                color: "var(--color-text-primary)",
                minHeight: 48,
              }}
            />
          </div>
          <div>
            <label
              className="mb-1 block text-[13px] leading-[18px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("visa:wage_overtime")}
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={overtimeHours}
              onChange={(e) => {
                setOvertimeHours(e.target.value);
                setShowResult(false);
              }}
              className="w-full rounded-2xl py-3 px-4 text-[15px] outline-none transition-all focus:ring-2"
              style={{
                backgroundColor: "var(--color-surface-secondary)",
                color: "var(--color-text-primary)",
                minHeight: 48,
              }}
            />
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          disabled={!hourlyRate || Number(hourlyRate) <= 0}
          className="w-full rounded-2xl py-3.5 text-[15px] active:scale-[0.98] transition-transform disabled:opacity-50"
          style={{
            fontWeight: 600,
            backgroundColor: "var(--color-action-primary)",
            color: "var(--color-text-on-color)",
            minHeight: 44,
          }}
        >
          {t("visa:wage_calculate")}
        </button>
      </div>

      {/* ===== Result Area ===== */}
      {showResult && result && (
        <div className="mt-5 space-y-4">
          {/* Layer 1: 결과 상단 라벨 */}
          <p
            className="text-[13px] leading-[18px]"
            style={{
              fontWeight: 600,
              color: "var(--color-text-secondary)",
            }}
          >
            {t("visa:wage_result_label")}
          </p>

          {/* 예상 급여 vs 최저임금 — 나란히 비교, 판단 안 함 */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl p-4"
              style={{
                backgroundColor: "var(--color-surface-secondary)",
              }}
            >
              <p
                className="text-[12px] leading-[16px] mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("visa:wage_your_estimate")}
              </p>
              <p
                className="text-[20px] leading-[25px]"
                style={{
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                ₩{result.totalPay.toLocaleString()}
              </p>
            </div>
            <div
              className="rounded-2xl p-4"
              style={{
                backgroundColor: "var(--color-surface-secondary)",
              }}
            >
              <p
                className="text-[12px] leading-[16px] mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("visa:wage_minimum_ref")}
              </p>
              <p
                className="text-[20px] leading-[25px]"
                style={{
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                ₩{result.minimumMonthlyPay.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div
            className="space-y-2 rounded-2xl p-4"
            style={{ backgroundColor: "var(--color-surface-secondary)" }}
          >
            {[
              { label: t("visa:wage_base"), value: result.basePay },
              { label: t("visa:wage_night"), value: result.nightPay },
              { label: t("visa:wage_ot"), value: result.overtimePay },
              { label: t("visa:wage_holiday"), value: result.weeklyHolidayPay },
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
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  ₩{row.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Layer 2: 법적 효력 없음 면책 */}
          <p
            className="text-[11px] leading-[15px]"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {t("visa:wage_disclaimer")}
          </p>

          {/* Layer 3: 전문가 연결 CTA */}
          <div
            className="space-y-2 rounded-2xl p-4"
            style={{
              backgroundColor: "var(--color-surface-secondary)",
            }}
          >
            <p
              className="text-[13px] leading-[18px] mb-2"
              style={{
                fontWeight: 600,
                color: "var(--color-text-secondary)",
              }}
            >
              {t("visa:wage_expert_title")}
            </p>
            <a
              href="tel:1350"
              className="flex items-center gap-3 rounded-2xl p-3 active:scale-[0.98] transition-transform"
              style={{
                backgroundColor: "var(--color-surface-primary)",
                minHeight: 44,
              }}
            >
              <Phone
                size={18}
                style={{ color: "var(--color-action-primary)" }}
              />
              <span
                className="text-[15px] leading-[20px]"
                style={{
                  fontWeight: 600,
                  color: "var(--color-action-primary)",
                }}
              >
                {t("visa:wage_call_1350")}
              </span>
            </a>
            <a
              href="https://www.kicpa.or.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl p-3 active:scale-[0.98] transition-transform"
              style={{
                backgroundColor: "var(--color-surface-primary)",
                minHeight: 44,
              }}
            >
              <User
                size={18}
                style={{ color: "var(--color-action-primary)" }}
              />
              <span
                className="text-[15px] leading-[20px]"
                style={{
                  fontWeight: 600,
                  color: "var(--color-action-primary)",
                }}
              >
                {t("visa:wage_find_labor")}
              </span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}