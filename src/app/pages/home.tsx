/**
 * home.tsx — 레퍼런스 디자인 1:1 재현
 *
 * 6개 카드 격자:
 *   Row 1: [30 mins + Book a Call (wide)] [Avatar (small)]
 *   Row 2: [9:41 AM gradient + message (tall)] [Happy Files + folder (tall)]
 *   Row 3: [+ icon (small)] [MORNING X'IES message (wide)]
 */

import { motion } from "motion/react";

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

export function Home() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#E8E6E1",
        padding: "20px 14px 40px",
      }}
    >
      <motion.div variants={stagger} initial="hidden" animate="show">

        {/* ═══ Row 1: Action bar + Avatar ═══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 64px",
            gap: 10,
            marginBottom: 12,
          }}
        >
          {/* ── 30 mins + Book a Call ── */}
          <motion.div
            variants={fadeUp}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer"
            style={{
              background: "#fff",
              borderRadius: 28,
              padding: "16px 16px 16px 22px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 600, color: "#1A1A18", letterSpacing: -0.5 }}>
                30
              </span>
              <span style={{ fontSize: 15, fontWeight: 400, color: "#A0A098" }}>
                mins
              </span>
              <svg width="12" height="18" viewBox="0 0 12 18" fill="none" style={{ marginLeft: 4, opacity: 0.35 }}>
                <path d="M6 2L10 7H2L6 2Z" fill="#888" />
                <path d="M6 16L10 11H2L6 16Z" fill="#888" />
              </svg>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #FEB47B 0%, #F7A09C 25%, #C084FC 50%, #818CF8 75%, #635BFF 100%)",
                borderRadius: 22,
                padding: "12px 24px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)",
                  borderRadius: 22,
                }}
              />
              <span style={{ fontSize: 16, fontWeight: 600, color: "#fff", position: "relative", letterSpacing: -0.2 }}>
                Book a Call
              </span>
            </div>
          </motion.div>

          {/* ── Avatar ── */}
          <motion.div
            variants={fadeUp}
            style={{
              background: "#fff",
              borderRadius: 22,
              width: 64,
              height: 64,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #D0CFC8, #B0AFA8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#888">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* ═══ Row 2: 9:41 AM + Happy Files ═══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 12,
          }}
        >
          {/* ── 9:41 AM — gradient + morning message ── */}
          <motion.div
            variants={fadeUp}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer"
            style={{
              background: "#fff",
              borderRadius: 28,
              overflow: "visible",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* Gradient background */}
            <div
              style={{
                background: "linear-gradient(160deg, #FEB47B 0%, #F7A09C 30%, #E898B8 50%, #C084FC 70%, #818CF8 90%, #635BFF 100%)",
                borderRadius: "28px 28px 0 0",
                padding: "20px 18px 44px",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <span style={{ fontSize: 34, fontWeight: 600, color: "#fff", letterSpacing: -1 }}>
                  9:41
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)", marginLeft: 4 }}>
                  AM
                </span>
              </div>
            </div>

            {/* Sub-card with gradient glow border */}
            <div
              style={{
                position: "relative",
                margin: "-28px 8px 14px",
                zIndex: 2,
              }}
            >
              {/* Glow border */}
              <div
                style={{
                  position: "absolute",
                  inset: -2,
                  borderRadius: 20,
                  background: "linear-gradient(135deg, #635BFF 0%, #C084FC 35%, #F7A09C 65%, #FEB47B 100%)",
                  opacity: 0.6,
                }}
              />
              {/* White card */}
              <div
                style={{
                  position: "relative",
                  background: "#fff",
                  borderRadius: 18,
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>☀️</span>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", color: "#C084FC" }}>
                    MORNING JAY
                  </span>
                </div>
                <p className="m-0" style={{ fontSize: 13, fontWeight: 400, color: "#1A1A18", lineHeight: 1.5 }}>
                  You have to start{" "}
                  <span style={{ fontWeight: 700 }}>delegating tasks</span>
                  , now go{" "}
                  <span style={{ fontWeight: 700 }}>carpe diem</span>
                  {" "}:)
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Happy Files ── */}
          <motion.div
            variants={fadeUp}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer"
            style={{
              background: "#fff",
              borderRadius: 28,
              overflow: "hidden",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* Kebab dots */}
            <div
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                zIndex: 2,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#1A1A18" }} />
              ))}
            </div>

            {/* Folder icon */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 20px 8px" }}>
              <div style={{ position: "relative", width: 88, height: 68 }}>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 4,
                    right: 4,
                    height: 52,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, #F7A09C 0%, #C084FC 50%, #635BFF 100%)",
                    boxShadow: "0 6px 20px rgba(99,91,255,0.35)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 4,
                    width: 38,
                    height: 24,
                    borderRadius: "12px 12px 0 0",
                    background: "linear-gradient(135deg, #FEB47B 0%, #F7A09C 100%)",
                  }}
                />
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: "0 18px 16px" }}>
              <p className="m-0" style={{ fontSize: 12, fontWeight: 500, color: "#A0A098", letterSpacing: "0.3px" }}>
                NEW
              </p>
              <p className="m-0" style={{ fontSize: 26, fontWeight: 700, color: "#1A1A18", letterSpacing: -0.5, marginTop: 2 }}>
                Happy Files
              </p>
              {/* Stats */}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <StatItem emoji="🖼" value={88} />
                <StatItem emoji="📷" value={24} />
                <StatItem emoji="📄" value={9} />
                <StatItem emoji="📹" value={89} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══ Row 3: + button + MORNING X'IES ═══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "64px 1fr",
            gap: 10,
          }}
        >
          {/* ── + icon ── */}
          <motion.div
            variants={fadeUp}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
            style={{
              background: "#fff",
              borderRadius: 22,
              width: 64,
              height: 64,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  inset: -8,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(192,132,252,0.2) 0%, rgba(254,180,123,0.1) 50%, transparent 70%)",
                }}
              />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round">
                <defs>
                  <linearGradient id="plusG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#C084FC" />
                    <stop offset="50%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#635BFF" />
                  </linearGradient>
                </defs>
                <line x1="12" y1="5" x2="12" y2="19" stroke="url(#plusG)" />
                <line x1="5" y1="12" x2="19" y2="12" stroke="url(#plusG)" />
              </svg>
            </div>
          </motion.div>

          {/* ── MORNING X'IES ── */}
          <motion.div
            variants={fadeUp}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer"
            style={{
              background: "#fff",
              borderRadius: 28,
              padding: "16px 20px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
              <span style={{ fontSize: 13 }}>☀️</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", color: "#A0A098" }}>
                MORNING X'IES
              </span>
            </div>
            <p className="m-0" style={{ fontSize: 15, fontWeight: 400, color: "#1A1A18", lineHeight: 1.5 }}>
              You should{" "}
              <span style={{ fontWeight: 700 }}>finish your portfolio</span>
              {" "}today, what do you think?
            </p>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}

function StatItem({ emoji, value }: { emoji: string; value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <span style={{ fontSize: 11, opacity: 0.5 }}>{emoji}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: "#A0A098" }}>{value}</span>
    </div>
  );
}