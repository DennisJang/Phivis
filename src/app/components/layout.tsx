/**
 * layout.tsx — Phase 0-A (4-Tab Floating Tab Bar)
 *
 * 변경 사항:
 * - 6탭 → 4탭 (Home / Visa / Remit / MY)
 * - 시맨틱 토큰 사용 (하드코딩 색상 제거) — Dennis 규칙 #32
 * - Liquid Glass 부유형(Floating) 탭바 — DESIGN_SYSTEM.md 섹션 4, 5
 * - i18n 탭 라벨 — Dennis 규칙 #34
 * - 8pt 그리드 준수 — DESIGN_SYSTEM.md 섹션 3
 *
 * Dennis 규칙 준수:
 * #2  useNavigate() 사용 (window.location.href 금지)
 * #7  pathname === "/home" 정확 매칭 (startsWith 금지)
 * #26 디자인 작업 시 비즈니스 로직 건드리지 않음
 * #31 탭 4개 (6개 이상 절대 금지)
 * #32 컬러 하드코딩 금지 → CSS 변수 사용
 * #34 i18n 전 페이지 적용
 */

import { createBrowserRouter, Navigate } from "react-router";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Home, FileText, Send, User } from "lucide-react";

// === Tab 정의 ===
// 순서: Home → Visa → Remit → MY (SETTLE_ARCHITECTURE_V2.md Layer 1)
const TAB_CONFIG = [
  { path: "/home", icon: Home, labelKey: "common:tab_home" },
  { path: "/visa", icon: FileText, labelKey: "common:tab_visa" },
  { path: "/remit", icon: Send, labelKey: "common:tab_remit" },
  { path: "/profile", icon: User, labelKey: "common:tab_my" },
] as const;

// === 탭바 미표시 경로 ===
// Paywall, Onboarding 등은 탭바 없이 전체 화면
const HIDE_TAB_BAR_PATHS = ["/paywall", "/paywall/success", "/onboarding"];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 현재 경로가 탭바 숨김 대상인지 판별
  const shouldHideTabBar = HIDE_TAB_BAR_PATHS.includes(location.pathname);

  return (
    <div
      className="relative mx-auto flex min-h-screen flex-col"
      style={{
        maxWidth: 375, // iPhone 기준 프레임
        backgroundColor: "var(--color-surface-secondary)",
      }}
    >
      {/* === Main Content Area === */}
      {/* 탭바 높이(80pt) + Safe Area 하단(34pt) 만큼 하단 패딩 확보 */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingBottom: shouldHideTabBar ? 0 : 114, // 80 + 34 = 114 (8pt 배수 아님이지만 Safe Area 고정값)
        }}
      >
        <Outlet />
      </main>

      {/* === Floating Tab Bar === */}
      {!shouldHideTabBar && (
        <nav
          className="fixed bottom-0 left-1/2 z-50 w-full -translate-x-1/2"
          style={{
            maxWidth: 375,
          }}
          role="tablist"
          aria-label={t("common:tab_navigation")}
        >
          {/* Floating 컨테이너 — Liquid Glass */}
          <div
            className="mx-4 mb-8 flex items-center justify-around rounded-3xl px-2 py-3"
            style={{
              background: "var(--color-surface-glass)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              borderTop: "1px solid var(--color-border-strong)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            }}
          >
            {TAB_CONFIG.map((tab) => {
              // Dennis 규칙 #7: 정확 매칭 (startsWith 금지)
              const isActive = location.pathname === tab.path;
              const IconComponent = tab.icon;

              return (
                <button
                  key={tab.path}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={t(tab.labelKey)}
                  onClick={() => navigate(tab.path)}
                  className="flex flex-col items-center gap-1 transition-transform active:scale-[0.95]"
                  style={{
                    // 터치 타겟: 최소 44×44pt (Apple HIG)
                    minWidth: 64, // 8pt 배수
                    minHeight: 44,
                    padding: "4px 8px",
                  }}
                >
                  {/* 아이콘: 25×25pt, stroke-width 2(비활성) / 2.5(활성) */}
                  <IconComponent
                    size={25}
                    strokeWidth={isActive ? 2.5 : 2}
                    style={{
                      color: isActive
                        ? "var(--color-action-primary)"
                        : "var(--color-text-secondary)",
                      transition: "color 200ms ease, stroke-width 200ms ease",
                    }}
                  />
                  {/* 라벨: 10pt Medium (Caption 1 수준) */}
                  <span
                    style={{
                      fontSize: 10,
                      lineHeight: "13px",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive
                        ? "var(--color-action-primary)"
                        : "var(--color-text-secondary)",
                      transition: "color 200ms ease",
                    }}
                  >
                    {t(tab.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}