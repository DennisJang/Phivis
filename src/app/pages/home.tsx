/**
 * home.tsx — Phase 0-A (Glanceable Dashboard Redesign)
 *
 * 변경 사항:
 * - Quick Actions 4그리드 → 글랜서블 카드 구조 (D-Day + 환율 + KIIP + 송금 + 피드 + 프리미엄)
 * - Housing/Education 링크 제거 (4탭 구조 반영)
 * - 하드코딩 색상 → 시맨틱 토큰 (Dennis 규칙 #32)
 * - 하드코딩 텍스트 → t() i18n (Dennis 규칙 #34)
 * - 빈 상태에 CTA 버튼 추가 (DESIGN_SYSTEM.md 섹션 8)
 * - 환율/송금 데이터: home 내부 독립 fetch (store 미변경, Dennis 규칙 #26)
 *
 * 동결된 로직 (절대 수정 금지):
 * - calcDDay(), mapEventIcon(), formatTimeAgo()
 * - useAuthStore, useDashboardStore hydrate 호출
 * - 피드 매핑 로직
 */

import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  FileText,
  Send,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Logo } from "../components/logo";
import { useAuthStore } from "../../stores/useAuthStore";
import { useDashboardStore } from "../../stores/useDashboardStore";
import { supabase } from "../../lib/supabase";

// ============================================
// D-Day 계산 유틸 (결정론적, AI 추론 금지) — 로직 동결
// ============================================
function calcDDay(visaExpiry: string | null): number | null {
  if (!visaExpiry) return null;
  const diff = new Date(visaExpiry).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================
// lifeEvent → 피드 아이템 매핑 — 로직 동결
// ============================================
function mapEventIcon(eventType: string) {
  switch (eventType) {
    case "visa_approved":
    case "visa_extension":
      return { icon: CheckCircle, color: "var(--color-action-success)" };
    case "remittance":
      return { icon: Send, color: "var(--color-action-primary)" };
    case "kiip_registered":
    case "kiip_completed":
      return { icon: GraduationCap, color: "var(--color-action-success)" };
    default:
      return { icon: CheckCircle, color: "var(--color-action-primary)" };
  }
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

// ============================================
// 환율 타입
// ============================================
interface ExchangeRateData {
  currency_code: string;
  rate: number;
  base_currency: string;
}

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { userProfile, visaTracker, lifeEvents, loading, hydrate } =
    useDashboardStore();

  // --- 환율/송금: 로컬 state (store 미변경, Dennis 규칙 #26) ---
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateData | null>(
    null
  );
  const [monthlyRemit, setMonthlyRemit] = useState<number | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  // hydrate 호출 (최초 1회) — 로직 동결
  useEffect(() => {
    if (user?.id && !userProfile) {
      hydrate(user.id);
    }
  }, [user?.id, userProfile, hydrate]);

  // --- 환율 fetch (home 독립, store 불변) ---
  const fetchExchangeRate = useCallback(async () => {
    try {
      const country = userProfile?.frequent_country ?? "USD";
      const { data } = await supabase
        .from("exchange_rates")
        .select("currency_code, rate, base_currency")
        .eq("currency_code", country)
        .order("fetched_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setExchangeRate(data);
    } catch {
      // 환율 실패는 치명적이지 않음 — 빈 상태로 표시
    }
  }, [userProfile?.frequent_country]);

  // --- 이번 달 송금 합계 fetch ---
  const fetchMonthlyRemit = useCallback(async () => {
    if (!user?.id) return;
    try {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

      const { data } = await supabase
        .from("remit_logs")
        .select("amount_krw")
        .eq("user_id", user.id)
        .gte("created_at", monthStart);

      if (data && data.length > 0) {
        const total = data.reduce(
          (sum: number, row: { amount_krw: number }) => sum + (row.amount_krw || 0),
          0
        );
        setMonthlyRemit(total);
      } else {
        setMonthlyRemit(0);
      }
    } catch {
      // 송금 실패는 치명적이지 않음
    }
  }, [user?.id]);

  // --- 환율/송금 fetch 트리거 ---
  useEffect(() => {
    if (userProfile) {
      setLocalLoading(true);
      Promise.all([fetchExchangeRate(), fetchMonthlyRemit()]).finally(() =>
        setLocalLoading(false)
      );
    }
  }, [userProfile, fetchExchangeRate, fetchMonthlyRemit]);

  // --- 동적 데이터 ---
  const displayName =
    userProfile?.full_name || user?.user_metadata?.full_name || "there";
  const dDay = calcDDay(userProfile?.visa_expiry ?? null);
  const showUrgent = dDay !== null && dDay <= 30 && dDay > 0;
  const kiipStage = visaTracker?.kiip_stage ?? undefined;
  const isPremium = userProfile?.subscription_plan === "premium";

  // --- 피드: DB 데이터 or 빈 배열 (더미 제거) — 로직 동결 ---
  const feedItems = lifeEvents.map((event) => {
    const { icon, color } = mapEventIcon(event.event_type);
    const payload = event.payload as Record<string, string>;
    return {
      id: event.id,
      icon,
      iconColor: color,
      title: payload?.title ?? event.event_type.replace(/_/g, " "),
      subtitle: payload?.subtitle ?? "",
      time: formatTimeAgo(event.created_at),
    };
  });

  // --- D-Day 카드 색상 결정 ---
  const dDayColor =
    dDay === null
      ? "var(--color-text-secondary)"
      : dDay <= 30
        ? "var(--color-action-warning)"
        : dDay <= 90
          ? "var(--color-action-primary)"
          : "var(--color-action-success)";

  // ============================================
  // Render
  // ============================================
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-surface-secondary)" }}
    >
      {/* ===== Header ===== */}
      <header
        style={{
          backgroundColor: "var(--color-surface-primary)",
          borderBottom: "1px solid var(--color-border-default)",
        }}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="small" />
            <Link
              to="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full active:scale-95 transition-transform"
              style={{ backgroundColor: "var(--color-surface-secondary)" }}
              aria-label={t("common:tab_my")}
            >
              <span className="text-base" role="img" aria-hidden="true">
                👤
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* ===== Welcome ===== */}
        <div className="space-y-1">
          <h1
            className="text-[28px] leading-[34px]"
            style={{
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {t("home:greeting", { name: displayName })}
          </h1>
          <p
            className="text-[15px] leading-[20px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t("home:subtitle")}
          </p>
        </div>

        {/* ===== Urgent Alert (D-Day ≤ 30) ===== */}
        {showUrgent && (
          <div
            className="rounded-3xl p-5"
            style={{
              background:
                "linear-gradient(135deg, var(--color-action-warning), #FF6B00)",
              color: "var(--color-text-on-color)",
            }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3
                  className="text-[17px] leading-[22px]"
                  style={{ fontWeight: 600 }}
                >
                  {t("home:visa_urgent_title", { days: dDay })}
                </h3>
                <p className="text-[13px] leading-[18px] opacity-90">
                  {t("home:visa_urgent_desc")}
                </p>
                <Link
                  to="/visa"
                  className="mt-2 inline-block rounded-2xl px-4 py-2 text-[13px] active:scale-95 transition-transform"
                  style={{
                    fontWeight: 600,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {t("home:visa_urgent_cta")}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ===== Visa D-Day Card ===== */}
        <div
          className="rounded-3xl p-5"
          style={{
            backgroundColor: "var(--color-surface-primary)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <p
            className="text-[13px] leading-[18px] mb-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t("home:visa_dday_label")}
          </p>
          {dDay !== null ? (
            <div className="flex items-baseline gap-2">
              <span
                className="text-[34px] leading-[41px]"
                style={{ fontWeight: 600, color: dDayColor }}
              >
                {dDay}
              </span>
              <span
                className="text-[15px] leading-[20px]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("home:visa_dday_unit")}
              </span>
            </div>
          ) : (
            <p
              className="text-[15px] leading-[20px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {t("home:visa_dday_empty")}
            </p>
          )}
          {dDay !== null && (
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full"
              style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(0, Math.min(100, ((365 - dDay) / 365) * 100))}%`,
                  backgroundColor: dDayColor,
                }}
              />
            </div>
          )}
        </div>

        {/* ===== 2-Column: Exchange Rate + KIIP ===== */}
        <div className="grid grid-cols-2 gap-4">
          {/* Exchange Rate */}
          <div
            className="rounded-3xl p-4"
            style={{
              backgroundColor: "var(--color-surface-primary)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp
                size={14}
                style={{ color: "var(--color-text-secondary)" }}
              />
              <p
                className="text-[12px] leading-[16px]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("home:exchange_label")}
              </p>
            </div>
            {localLoading ? (
              <div className="h-7 w-20 animate-pulse rounded-lg"
                style={{ backgroundColor: "var(--color-surface-secondary)" }}
              />
            ) : exchangeRate ? (
              <>
                <p
                  className="text-[20px] leading-[25px]"
                  style={{
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  ₩{Math.round(exchangeRate.rate).toLocaleString()}
                </p>
                <p
                  className="text-[12px] leading-[16px] mt-0.5"
                  style={{ color: "var(--color-action-success)" }}
                >
                  = 1 {exchangeRate.currency_code}
                </p>
              </>
            ) : (
              <p
                className="text-[13px] leading-[18px]"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {t("home:exchange_empty")}
              </p>
            )}
          </div>

          {/* KIIP Progress */}
          <div
            className="rounded-3xl p-4"
            style={{
              backgroundColor: "var(--color-surface-primary)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <p
              className="text-[12px] leading-[16px] mb-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("home:kiip_label")}
            </p>
            {kiipStage !== undefined && kiipStage !== null ? (
              <>
                <p
                  className="text-[20px] leading-[25px]"
                  style={{
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {kiipStage}{" "}
                  <span
                    className="text-[15px]"
                    style={{
                      fontWeight: 400,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    / 5
                  </span>
                </p>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full"
                  style={{
                    backgroundColor: "var(--color-surface-secondary)",
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(kiipStage / 5) * 100}%`,
                      backgroundColor: "var(--color-action-success)",
                    }}
                  />
                </div>
              </>
            ) : (
              <p
                className="text-[13px] leading-[18px]"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {t("home:kiip_empty")}
              </p>
            )}
          </div>
        </div>

        {/* ===== Remit Summary ===== */}
        <button
          onClick={() => navigate("/remit")}
          className="w-full rounded-3xl p-5 text-left active:scale-[0.98] transition-transform"
          style={{
            backgroundColor: "var(--color-surface-primary)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-[13px] leading-[18px] mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("home:remit_label")}
              </p>
              {localLoading ? (
                <div className="h-6 w-28 animate-pulse rounded-lg"
                  style={{ backgroundColor: "var(--color-surface-secondary)" }}
                />
              ) : monthlyRemit !== null && monthlyRemit > 0 ? (
                <p
                  className="text-[20px] leading-[25px]"
                  style={{
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  ₩{monthlyRemit.toLocaleString()}
                </p>
              ) : (
                <p
                  className="text-[15px] leading-[20px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {t("home:remit_empty")}
                </p>
              )}
            </div>
            <ChevronRight
              size={20}
              style={{ color: "var(--color-text-secondary)" }}
            />
          </div>
        </button>

        {/* ===== Recent Activity ===== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-[17px] leading-[22px]"
              style={{
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {t("home:activity_title")}
            </h2>
            {feedItems.length > 0 && (
              <button
                className="text-[13px]"
                style={{
                  fontWeight: 600,
                  color: "var(--color-action-primary)",
                }}
              >
                {t("home:activity_view_all")}
              </button>
            )}
          </div>

          {loading ? (
            // 스켈레톤 (DESIGN_SYSTEM.md 섹션 8: 3행 animate-pulse)
            <div
              className="rounded-3xl divide-y"
              style={{
                backgroundColor: "var(--color-surface-primary)",
                borderColor: "var(--color-border-default)",
              }}
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 animate-pulse">
                  <div
                    className="h-11 w-11 rounded-2xl"
                    style={{
                      backgroundColor: "var(--color-surface-secondary)",
                    }}
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-4 w-3/4 rounded-lg"
                      style={{
                        backgroundColor: "var(--color-surface-secondary)",
                      }}
                    />
                    <div
                      className="h-3 w-1/2 rounded-lg"
                      style={{
                        backgroundColor: "var(--color-surface-secondary)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : feedItems.length > 0 ? (
            <div
              className="rounded-3xl divide-y"
              style={{
                backgroundColor: "var(--color-surface-primary)",
                borderColor: "var(--color-border-default)",
              }}
            >
              {feedItems.slice(0, 3).map((activity) => {
                const Icon = activity.icon;
                return (
                  <button
                    key={activity.id}
                    className="flex w-full items-start gap-3 p-4 text-left transition-colors active:opacity-70"
                  >
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${activity.iconColor} 12%, transparent)`,
                      }}
                    >
                      <Icon
                        size={20}
                        style={{ color: activity.iconColor }}
                        strokeWidth={2}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[15px] leading-[20px]"
                        style={{
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {activity.title}
                      </p>
                      {activity.subtitle && (
                        <p
                          className="text-[12px] leading-[16px] mt-0.5"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {activity.subtitle}
                        </p>
                      )}
                      <p
                        className="text-[12px] leading-[16px] mt-0.5"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {activity.time}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="mt-1 flex-shrink-0"
                      style={{ color: "var(--color-text-tertiary)" }}
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            // 빈 상태 — CTA 필수 (DESIGN_SYSTEM.md 섹션 8)
            <div
              className="rounded-3xl p-8 text-center"
              style={{ backgroundColor: "var(--color-surface-primary)" }}
            >
              <p
                className="text-[15px] leading-[20px] mb-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("home:activity_empty")}
              </p>
              <button
                onClick={() => navigate("/visa")}
                className="rounded-2xl px-5 py-2.5 text-[15px] active:scale-[0.98] transition-transform"
                style={{
                  fontWeight: 600,
                  backgroundColor: "var(--color-action-primary)",
                  color: "var(--color-text-on-color)",
                  minHeight: 44,
                }}
              >
                {t("home:activity_empty_cta")}
              </button>
            </div>
          )}
        </div>

        {/* ===== Premium Upsell Banner ===== */}
        {!isPremium && (
          <Link
            to="/paywall"
            className="block rounded-3xl p-5 active:scale-[0.98] transition-transform"
            style={{
              background:
                "linear-gradient(135deg, var(--color-action-primary), var(--color-action-primary-hover))",
              color: "var(--color-text-on-color)",
              boxShadow: "0 4px 16px rgba(0,122,255,0.25)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div
                  className="inline-block rounded-full px-3 py-1 text-[11px] leading-[13px]"
                  style={{
                    fontWeight: 600,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  PREMIUM
                </div>
                <h3
                  className="text-[20px] leading-[25px]"
                  style={{ fontWeight: 600 }}
                >
                  {t("home:premium_title")}
                </h3>
                <p className="text-[13px] leading-[18px] opacity-90">
                  {t("home:premium_desc")}
                </p>
              </div>
              <ChevronRight size={24} className="flex-shrink-0" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}