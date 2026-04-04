/**
 * motion.ts — Phivis DS v3.0 모션 프리셋
 *
 * Framer Motion spring 프리셋 + 공통 전환 설정.
 * Apple HIG + Material Design 3 기반 수치.
 *
 * 사용법:
 *   import { springs, transitions } from '@/lib/motion';
 *   <motion.div transition={springs.sheet} />
 *   <motion.div transition={transitions.cardExpand} />
 */

// === Spring 프리셋 ===
export const springs = {
  /** 바텀시트, 모달 올라오기 (Apple sheet 참고) */
  sheet: { type: "spring" as const, stiffness: 300, damping: 30, mass: 1 },

  /** 카드 확장, 아코디언 */
  expand: { type: "spring" as const, stiffness: 200, damping: 25, mass: 0.8 },

  /** 작은 요소 등장 (뱃지, 토스트) */
  pop: { type: "spring" as const, stiffness: 400, damping: 20, mass: 0.5 },

  /** 숫자 카운트업 (readiness %, 금액) */
  count: { type: "spring" as const, stiffness: 100, damping: 20, mass: 1 },
} as const;

// === Tween 전환 프리셋 ===
export const transitions = {
  /** 탭 피드백 */
  tap: { duration: 0.1, ease: [0.4, 0, 0.2, 1] },

  /** 카드 hover */
  hover: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },

  /** 카드 확장, 모달 등장 */
  cardExpand: { duration: 0.3, ease: [0.05, 0.7, 0.1, 1.0] },

  /** 모달/바텀시트 퇴장 (등장보다 빠름) */
  exit: { duration: 0.2, ease: [0.3, 0, 0.8, 0.15] },

  /** 페이지 전환 */
  page: { duration: 0.5, ease: [0.05, 0.7, 0.1, 1.0] },

  /** 숫자 카운트업 */
  countUp: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
} as const;

// === 공통 애니메이션 variants ===
export const fadeSlideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// === Stagger 컨테이너 ===
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};