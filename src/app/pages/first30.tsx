/**
 * first30.tsx — First 30 Days 위젯 페이지
 * Sprint 2에서 구현 예정.
 * Q-B4: 첫 30일 위자드
 */

import { useTranslation } from "react-i18next";

export function First30() {
  const { t } = useTranslation("first30");

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: "var(--color-surface-page)",
        padding: "var(--space-md)",
      }}
    >
      <div
        className="text-center"
        style={{ color: "var(--color-text-secondary)" }}
      >
        <p style={{ fontSize: "15px" }}>
          {t("placeholder", "First 30 Days — Coming Soon")}
        </p>
      </div>
    </div>
  );
}

export default First30;