import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";

// ============================================
// PaywallIntro — 레퍼런스 왼쪽 이미지 1:1 복제
// 일러스트 SVG 재현 + 타이포그래피 + CTA 구조 그대로
// 텍스트만 Phivis 맞춤
// ============================================

const springs = {
  pop: { stiffness: 400, damping: 20, mass: 0.5 },
};

export function PaywallIntro() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        maxWidth: 420,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* ── Illustration Area ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "56px 24px 32px",
          minHeight: 380,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.05, 0.7, 0.1, 1.0] }}
        >
          <ReferenceIllustration />
        </motion.div>
      </div>

      {/* ── Text Area — 레퍼런스 타이포그래피 그대로 ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        style={{ padding: "0 28px" }}
      >
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#1A1A1A",
            lineHeight: 1.3,
            letterSpacing: "-0.3px",
            margin: 0,
          }}
        >
          {t("paywall:intro_title")}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#888888",
            lineHeight: 1.6,
            marginTop: 12,
          }}
        >
          {t("paywall:intro_desc")}
        </p>
      </motion.div>

      {/* ── CTA — 레퍼런스: 흰 pill + 검정 원형 → 버튼 ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.25 }}
        style={{ padding: "28px 28px 48px" }}
      >
        <motion.button
          onClick={() => navigate("/paywall")}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", ...springs.pop }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 14px 14px 24px",
            borderRadius: 28,
            border: "1px solid #E8E8E8",
            cursor: "pointer",
            backgroundColor: "#FFFFFF",
            fontFamily: "inherit",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "#1A1A1A",
              letterSpacing: "-0.1px",
            }}
          >
            {t("paywall:intro_cta")}
          </span>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 9999,
              backgroundColor: "#1A1A1A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ChevronRight size={22} color="#FFFFFF" strokeWidth={2.5} />
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ─── Reference Illustration — 레퍼런스 캐릭터 SVG 1:1 ─── */
function ReferenceIllustration() {
  return (
    <svg
      width="260"
      height="310"
      viewBox="0 0 260 310"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* === 배경 원들 === */}
      <circle cx="140" cy="130" r="115" stroke="#E2E2E2" strokeWidth="1.2" fill="none" />
      <circle cx="140" cy="130" r="85" stroke="#EBEBEB" strokeWidth="1" fill="none" />
      <circle cx="140" cy="130" r="55" stroke="#F2F2F2" strokeWidth="0.8" fill="none" />

      {/* === 플로팅 UI 카드 — 브라우저 윈도우 (우상단) === */}
      <g transform="translate(175, 32)">
        <rect width="56" height="44" rx="7" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="1" />
        <rect x="0" y="0" width="56" height="13" rx="7" fill="#F0F0F0" />
        <circle cx="10" cy="7" r="2" fill="#D4D4D4" />
        <circle cx="17" cy="7" r="2" fill="#D4D4D4" />
        <circle cx="24" cy="7" r="2" fill="#D4D4D4" />
        <rect x="8" y="18" width="28" height="3" rx="1.5" fill="#E0E0E0" />
        <rect x="8" y="24" width="20" height="3" rx="1.5" fill="#EBEBEB" />
        <rect x="8" y="30" width="32" height="3" rx="1.5" fill="#F0F0F0" />
      </g>

      {/* === 플로팅 UI 카드 — 체크리스트 (좌상단) === */}
      <g transform="translate(32, 45)">
        <rect width="48" height="40" rx="7" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="1" />
        <rect x="8" y="8" width="14" height="3" rx="1.5" fill="#1A1A1A" />
        <rect x="8" y="15" width="30" height="2.5" rx="1" fill="#D4D4D4" />
        <rect x="8" y="21" width="22" height="2.5" rx="1" fill="#E0E0E0" />
        <rect x="8" y="27" width="26" height="2.5" rx="1" fill="#EBEBEB" />
        <rect x="8" y="33" width="18" height="2.5" rx="1" fill="#F0F0F0" />
      </g>

      {/* === 하트 아이콘 (좌중) === */}
      <g transform="translate(28, 110)">
        <rect width="32" height="32" rx="8" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="0.8" />
        <path
          d="M16 24C16 24 9 19 9 15C9 12.8 10.8 11 13 11C14.2 11 15.3 11.6 16 12.5C16.7 11.6 17.8 11 19 11C21.2 11 23 12.8 23 15C23 19 16 24 16 24Z"
          fill="none"
          stroke="#1A1A1A"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* === 캐릭터 본체 === */}
      <g transform="translate(90, 55)">
        {/* 머리 — 검정, 약간 큰 원 */}
        <ellipse cx="45" cy="24" rx="22" ry="24" fill="#1A1A1A" />
        
        {/* 얼굴 — 살색 부분 (앞면) */}
        <ellipse cx="50" cy="28" rx="13" ry="15" fill="#E8C9A0" />
        
        {/* 머리카락 앞머리 */}
        <path
          d="M30 18C32 6 40 0 50 0C58 0 64 6 66 14L68 22C68 22 60 16 50 16C40 16 32 20 30 18Z"
          fill="#1A1A1A"
        />

        {/* 목 */}
        <rect x="42" y="42" width="12" height="10" rx="4" fill="#E8C9A0" />

        {/* 몸통 — 흰 셔츠/코트 */}
        <path
          d="M22 58C22 52 32 48 47 48C62 48 68 52 68 58L70 140C70 146 64 150 58 150L32 150C26 150 20 146 20 140Z"
          fill="#FFFFFF"
          stroke="#1A1A1A"
          strokeWidth="1.8"
        />
        
        {/* 셔츠 중앙 라인 */}
        <line x1="46" y1="52" x2="46" y2="130" stroke="#E8E8E8" strokeWidth="1" />
        
        {/* 주머니 */}
        <rect x="28" y="100" width="14" height="16" rx="3" fill="none" stroke="#E0E0E0" strokeWidth="0.8" />
        <rect x="50" y="100" width="14" height="16" rx="3" fill="none" stroke="#E0E0E0" strokeWidth="0.8" />

        {/* 왼팔 — 올려서 폰 들고 있는 */}
        <path
          d="M22 65L6 40"
          stroke="#FFFFFF"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M22 65L6 40"
          stroke="#1A1A1A"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        
        {/* 왼손 — 폰 */}
        <g transform="translate(-12, 12) rotate(-15, 10, 30)">
          <rect x="0" y="6" width="24" height="38" rx="5" fill="#1A1A1A" />
          <rect x="3" y="10" width="18" height="28" rx="3" fill="#3A3A3A" />
          {/* 폰 화면 내용 */}
          <rect x="6" y="14" width="12" height="2" rx="1" fill="#666" />
          <rect x="6" y="19" width="8" height="2" rx="1" fill="#555" />
          <rect x="6" y="24" width="10" height="2" rx="1" fill="#555" />
        </g>

        {/* 손가락 (폰 잡는) */}
        <ellipse cx="4" cy="38" rx="4" ry="5" fill="#E8C9A0" />

        {/* 오른팔 */}
        <path
          d="M68 68L82 92"
          stroke="#FFFFFF"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M68 68L82 92"
          stroke="#1A1A1A"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* 오른손 */}
        <ellipse cx="84" cy="95" rx="5" ry="5" fill="#E8C9A0" />

        {/* 다리 — 왼쪽 (흰 바지) */}
        <path d="M36 150L32 220" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" />
        <path d="M36 150L32 220" stroke="#1A1A1A" strokeWidth="1.8" />

        {/* 다리 — 오른쪽 */}
        <path d="M56 150L60 220" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" />
        <path d="M56 150L60 220" stroke="#1A1A1A" strokeWidth="1.8" />

        {/* 신발 — 왼쪽 */}
        <ellipse cx="30" cy="225" rx="16" ry="7" fill="#1A1A1A" />
        <circle cx="22" cy="221" r="3" fill="#1A1A1A" />
        
        {/* 신발 — 오른쪽 */}
        <ellipse cx="62" cy="225" rx="16" ry="7" fill="#1A1A1A" />
        <circle cx="70" cy="221" r="3" fill="#1A1A1A" />

        {/* 신발 별 장식 */}
        <text x="26" y="228" fontSize="7" fill="#FFFFFF" textAnchor="middle">★</text>
        <text x="58" y="228" fontSize="7" fill="#FFFFFF" textAnchor="middle">★</text>
      </g>

      {/* === 장식 별 (우하단) === */}
      <g transform="translate(218, 175)">
        <path
          d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6Z"
          fill="#1A1A1A"
        />
      </g>

      {/* === 작은 별 (좌하단) === */}
      <g transform="translate(40, 195)">
        <path
          d="M5 0L6.2 3.8L10 5L6.2 6.2L5 10L3.8 6.2L0 5L3.8 3.8Z"
          fill="#D0D0D0"
        />
      </g>

      {/* === 작은 점 장식 === */}
      <circle cx="225" cy="120" r="2.5" fill="#E0E0E0" />
      <circle cx="30" cy="160" r="2" fill="#EBEBEB" />
      <circle cx="200" cy="200" r="1.5" fill="#D4D4D4" />
    </svg>
  );
}