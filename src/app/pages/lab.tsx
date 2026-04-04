/**
 * lab.tsx — Lab 위젯 페이지
 * Sprint 2에서 구현 예정.
 * Q-F2: 실험실 탭
 */

import { useTranslation } from "react-i18next";

export function Lab() {
  const { t } = useTranslation("lab");

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
          {t("placeholder", "Lab — Coming Soon")}
        </p>
      </div>
    </div>
  );
}

export default Lab;