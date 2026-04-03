/**
 * home.tsx — v2.1 위젯형 홈 (레퍼런스 기반 리디자인)
 *
 * 레이아웃 (세로 스크롤):
 *   Row 1: [Action bar (wide)] [Avatar (small)]
 *   Row 2: [Visa 위젯 (tall, gradient)] [Scan 위젯 (3D object)]
 *   Row 3: [Finance + Housing 2col]
 *   Row 4: [Lab 풀와이드 배너]
 *
 * Dennis 규칙:
 *   #32 시맨틱 토큰
 *   #34 i18n
 */

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useDashboardStore } from "../../stores/useDashboardStore";
import { useVisaIntentStore } from "../../stores/useVisaIntentStore";
import { useMemo } from "react";

// ─── Animation ───

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
  },
};

// ─── Main ───

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { userProfile, visaTracker } = useDashboardStore();
  const { intent } = useVisaIntentStore();

  const userName = userProfile?.full_name ?? "Traveler";

  const dDay = useMemo(() => {
    const expiry = userProfile?.visa_expiry;
    if (!expiry) return null;
    return Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }, [userProfile?.visa_expiry]);

  const readiness = intent?.readiness_score ?? 0;
  const docsReady = intent?.documents_ready ?? 0;
  const docsTotal = intent?.documents_required ?? 0;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--color-surface-secondary)",
        padding: "20px 14px 40px",
      }}
    >
      <motion.div variants={stagger} initial="hidden" animate="show">

        {/* ═══ Row 1: Action bar + Avatar ═══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 56px",
            gap: 10,
            marginBottom: 12,
          }}
        >
          {/* Action bar — wide pill */}
          <motion.div
            variants={fadeUp}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/visa")}
            className="cursor-pointer"
            style={{
              background: "var(--color-surface-primary)",
              borderRadius: 28,
              padding: "14px 18px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, zIndex: 1 }}>
              <span style={{ fontSize: 26, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: -0.5 }}>
                {dDay !== null ? `D-${dDay}` : "—"}
              </span>
              <span style={{ fontSize: 13, fontWeight: 400, color: "var(--color-text-secondary)" }}>
                {t("home:dday_label", { defaultValue: "days" })}
              </span>
            </div>

            {/* Gradient CTA pill */}
            <div
              style={{
                background: "linear-gradient(135deg, #FEB47B 0%, #C084FC 40%, #818CF8 70%, #635BFF 100%)",
                borderRadius: 20,
                padding: "10px 20px",
                zIndex: 1,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: -0.2 }}>
                {t("home:visa_cta", { defaultValue: "Check Visa" })}
              </span>
            </div>
          </motion.div>

          {/* Avatar */}
          <motion.div
            variants={fadeUp}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/profile")}
            className="cursor-pointer"
            style={{
              background: "var(--color-surface-primary)",
              borderRadius: 20,
              width: 56,
              height: 56,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #F4C8A0, #A0B8F4)",
                opacity: 0.85,
              }}
            />
          </motion.div>
        </div>

        {/* ═══ Row 2: Visa (tall, gradient) + Scan ═══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 12,
          }}
        >
          {/* Visa Widget — tall, gradient background */}
          <motion.div
            variants={fadeUp}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/visa")}
            className="cursor-pointer"
            style={{
              background: "var(--color-surface-primary)",
              borderRadius: 28,
              overflow: "hidden",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(0,0,0,0.03)",
              minHeight: 220,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Gradient top zone */}
            <div
              style={{
                position: "relative",
                background: "linear-gradient(160deg, #FEB47B 0%, #F7A09C 25%, #C084FC 55%, #818CF8 80%, #635BFF 100%)",
                padding: "20px 18px 16px",
                flex: "0 0 auto",
              }}
            >
              <p className="m-0" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", color: "rgba(255,255,255,0.7)" }}>
                VISA
              </p>
              <p className="m-0" style={{ fontSize: 36, fontWeight: 600, color: "#fff", letterSpacing: -1.5, lineHeight: 1, marginTop: 4 }}>
                {dDay !== null ? `D-${dDay}` : "—"}
              </p>
            </div>

            {/* Info card (like morning message in reference) */}
            <div
              style={{
                margin: "-8px 10px 12px",
                background: "var(--color-surface-primary)",
                borderRadius: 18,
                padding: "12px 14px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                border: "0.5px solid var(--color-border-default)",
                position: "relative",
                zIndex: 1,
              }}
            >
              <p className="m-0" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", color: "var(--color-action-primary)" }}>
                {t("home:visa_status", { defaultValue: "DOCUMENTS" })}
              </p>
              <p className="m-0" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", marginTop: 4 }}>
                {t("home:visa_readiness", { defaultValue: "Readiness" })}
                <span style={{ fontWeight: 700 }}> {readiness}%</span>
              </p>
              <p className="m-0" style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
                {docsReady}/{docsTotal} {t("home:docs_ready", { defaultValue: "ready" })}
              </p>
            </div>
          </motion.div>

          {/* Scan Widget — 3D object card */}
          <motion.div
            variants={fadeUp}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer"
            style={{
              background: "var(--color-surface-primary)",
              borderRadius: 28,
              overflow: "hidden",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(0,0,0,0.03)",
              minHeight: 220,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* 3D object */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 16 }}>
              <img
                src="/layer-object.png"
                alt=""
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "contain",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Menu dots (like reference) */}
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "var(--color-text-tertiary)",
                  }}
                />
              ))}
            </div>

            {/* Bottom info */}
            <div style={{ padding: "0 18px 18px" }}>
              <p className="m-0" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", color: "var(--color-action-primary)" }}>
                {t("home:scan_label", { defaultValue: "SCAN" })}
              </p>
              <p className="m-0" style={{ fontSize: 22, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: -0.3, marginTop: 2 }}>
                {t("home:scan_title", { defaultValue: "Scan Anything" })}
              </p>
              {/* Stat badges */}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <StatBadge icon="📄" value={t("home:scan_docs", { defaultValue: "문서" })} />
                <StatBadge icon="💰" value={t("home:scan_pay", { defaultValue: "급여" })} />
                <StatBadge icon="📋" value={t("home:scan_contract", { defaultValue: "계약서" })} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══ Row 3: Finance + Housing ═══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 12,
          }}
        >
          {/* Finance */}
          <motion.div
            variants={fadeUp}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer"
            onClick={() => navigate("/life")}
            style={{
              background: "var(--color-surface-primary)",
              borderRadius: 28,
              padding: 20,
              boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              className="absolute"
              style={{
                bottom: -14,
                right: -14,
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #B8E8C8, #C8D8F8)",
                opacity: 0.25,
              }}
            />
            <p className="m-0" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", color: "var(--color-text-secondary)" }}>
              {t("home:finance_label", { defaultValue: "FINANCE" })}
            </p>
            <p className="m-0" style={{ fontSize: 26, fontWeight: 600, color: "var(--color-text-primary)", marginTop: 4, letterSpacing: -0.5 }}>
              ₩2.4M
            </p>
            <p className="m-0" style={{ fontSize: 12, color: "var(--color-action-success)", marginTop: 4, fontWeight: 500 }}>
              {t("home:finance_subtitle", { defaultValue: "받을 수 있는 돈" })}
            </p>
          </motion.div>

          {/* Housing */}
          <motion.div
            variants={fadeUp}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer"
            onClick={() => navigate("/life")}
            style={{
              background: "var(--color-surface-primary)",
              borderRadius: 28,
              padding: 20,
              boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              className="absolute"
              style={{
                bottom: -12,
                right: -12,
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #F8D0A0, #F0B8C0)",
                opacity: 0.25,
              }}
            />
            <p className="m-0" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", color: "var(--color-text-secondary)" }}>
              {t("home:housing_label", { defaultValue: "HOUSING" })}
            </p>
            <p className="m-0" style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)", marginTop: 4 }}>
              {t("home:housing_title", { defaultValue: "전입신고" })}
            </p>
            <p className="m-0" style={{ fontSize: 24, fontWeight: 600, color: "var(--color-action-warning)", marginTop: 2, letterSpacing: -0.5 }}>
              D-3
            </p>
          </motion.div>
        </div>

        {/* ═══ Row 4: Lab — full width banner ═══ */}
        <motion.div
          variants={fadeUp}
          whileTap={{ scale: 0.97 }}
          className="cursor-pointer"
          style={{
            background: "var(--color-surface-primary)",
            borderRadius: 28,
            padding: "16px 18px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 12,
          }}
        >
          {/* + icon with gradient glow */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: "var(--color-surface-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <defs>
                <linearGradient id="labGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#C084FC" />
                  <stop offset="100%" stopColor="#635BFF" />
                </linearGradient>
              </defs>
              <line x1="12" y1="5" x2="12" y2="19" stroke="url(#labGrad)" />
              <line x1="5" y1="12" x2="19" y2="12" stroke="url(#labGrad)" />
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <p className="m-0" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", color: "var(--color-action-primary)" }}>
              {t("home:lab_label", { defaultValue: "LAB" })}
            </p>
            <p className="m-0" style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", marginTop: 2 }}>
              {t("home:lab_title", { defaultValue: "어떤 기능이 필요하세요?" })}
            </p>
          </div>

          <div
            style={{
              background: "var(--color-surface-secondary)",
              borderRadius: 12,
              padding: "6px 12px",
            }}
          >
            <p className="m-0" style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)" }}>
              342{t("home:lab_votes", { defaultValue: "표" })}
            </p>
          </div>
        </motion.div>

        {/* ═══ Row 5: LifeStyle — wide card with message ═══ */}
        <motion.div
          variants={fadeUp}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/life")}
          className="cursor-pointer"
          style={{
            background: "var(--color-surface-primary)",
            borderRadius: 28,
            padding: "18px 18px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {/* Gradient circle */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #F0B8C8, #C8B8F0)",
              opacity: 0.6,
              flexShrink: 0,
            }}
          />

          <div style={{ flex: 1 }}>
            <p className="m-0" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", color: "var(--color-text-secondary)" }}>
              {t("home:lifestyle_label", { defaultValue: "LIFESTYLE" })}
            </p>
            <p className="m-0" style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", marginTop: 2 }}>
              {t("home:lifestyle_title", { defaultValue: "이번 주" })}
              <span style={{ fontWeight: 700 }}> {t("home:lifestyle_highlight", { defaultValue: "안산 다문화축제" })}</span>
              {t("home:lifestyle_suffix", { defaultValue: " 외 2건" })}
            </p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

// ─── Micro components ───

function StatBadge({ icon, value }: { icon: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}