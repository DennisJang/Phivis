# Settle Design System v2.0 — Stripe 미학
> 갱신: 2026-03-30 · Apple HIG v1 → Stripe 미학 v2 전면 교체
> 소스: Stripe DevTools 분석, Stripe Apps 공식 문서, Stripe Elements API, Claude 웹서치(다크모드 토큰), Manus 리서치 2건 (교차 검증 완료)

---

## 핵심 5원칙 (v2)

1. **시맨틱 토큰 강제.** 하드코딩 색상 전면 폐지. `var(--color-*)` 또는 Tailwind 바인딩만.
2. **다층 그림자로 깊이감.** 단일 shadow 금지. 2중 레이어가 기본.
3. **Tight radius.** 카드 12px, 버튼 8px, 인풋 8px. 24px 금지.
4. **8pt 그리드 유지.** v1에서 계승. 소수점 간격 금지.
5. **로딩/에러/빈 상태 통일.** Shimmer + 인라인 에러 + CTA형 빈 상태.

---

## 1. 색상 시스템 — 시맨틱 토큰 (v2)

### 1.1 Light Mode

```css
:root {
  /* === Action === */
  --color-action-primary: #635BFF;         /* Stripe Indigo. CTA 버튼, 활성 탭, 링크 */
  --color-action-primary-hover: #5349E0;   /* -12% lightness */
  --color-action-primary-subtle: rgba(99, 91, 255, 0.08); /* 포커스 링, 배지 배경 */
  --color-action-success: #10B981;         /* 성공, 완료, 양수 */
  --color-action-warning: #F59E0B;         /* 경고, D-Day ≤89 */
  --color-action-error: #EF4444;           /* 에러, 삭제, D-Day ≤30 */

  /* === Text === */
  --color-text-primary: #1A1D26;           /* 본문, 제목. Stripe 계열 blue-black */
  --color-text-secondary: #6B7294;         /* 부제, 캡션, 비활성. Stripe blue-gray */
  --color-text-tertiary: #A3ACCD;          /* 플레이스홀더 */
  --color-text-on-color: #FFFFFF;          /* 컬러 배경 위 텍스트 */

  /* === Surface === */
  --color-surface-primary: #FFFFFF;        /* 카드, 모달 배경 */
  --color-surface-secondary: #F6F8FA;      /* 페이지 배경, 인풋 배경. Stripe cool-gray */
  --color-surface-elevated: #FFFFFF;       /* 떠있는 요소 (탭바, 시트) */

  /* === Border === */
  --color-border-default: #E3E8EF;         /* 카드 테두리, 구분선. 실선 (rgba 아님) */
  --color-border-strong: #CFD5E2;          /* 탭바 상단선, 인풋 기본 테두리 */
  --color-border-focus: #635BFF;           /* 포커스 상태 테두리 */

  /* === Overlay === */
  --color-overlay: rgba(0, 0, 0, 0.30);   /* 모달/시트 배경 */

  /* === Status Background (뱃지/배너용) === */
  --color-bg-success: #D1FAE5;
  --color-bg-warning: #FEF3C7;
  --color-bg-error: #FEE2E2;
  --color-bg-info: #EEF2FF;

  /* === Status Text (뱃지/배너용) === */
  --color-text-success: #065F46;
  --color-text-warning: #92400E;
  --color-text-error: #991B1B;
  --color-text-info: #3730A3;
}
```

### 1.2 Dark Mode (예비 — 라이트모드 완성 후 적용)

```css
.dark {
  --color-action-primary: #7C75FF;         /* 밝은 인디고 */
  --color-action-primary-hover: #9B95FF;
  --color-action-primary-subtle: rgba(124, 117, 255, 0.12);
  --color-action-success: #34D399;
  --color-action-warning: #FBBF24;
  --color-action-error: #F87171;

  --color-text-primary: #E8ECF4;
  --color-text-secondary: #8C99AD;
  --color-text-tertiary: #5A6478;
  --color-text-on-color: #FFFFFF;

  --color-surface-primary: #1A1D26;        /* Stripe Dashboard 다크 배경 */
  --color-surface-secondary: #22252E;
  --color-surface-elevated: #2B3039;

  --color-border-default: #2B3039;
  --color-border-strong: #3A4050;
  --color-border-focus: #7C75FF;

  --color-overlay: rgba(0, 0, 0, 0.60);
}
```

### 1.3 사용 규칙

- `#635BFF` 직접 사용 **절대 금지** → `var(--color-action-primary)` 사용
- Google 로그인 버튼의 SVG 브랜드 컬러(#4285F4, #34A853, #FBBC05, #EA4335)는 토큰화 면제 (v1 계승)
- Tailwind 클래스에서: `text-[var(--color-text-primary)]` 또는 `@theme` 연결
- 새 색상 추가 시 반드시 토큰 정의 → 사용. 인라인 컬러 금지.

### 1.4 Stripe 그라데이션 (장식용)

시스템 토큰이 아닌 **특수 용도 전용**. CTA 카드, 프리미엄 배너, 랜딩 히어로 배경에만 사용.

```css
/* === Stripe 시그니처 그라데이션 === */

/* Mesh 그라데이션 — 프리미엄 카드/배너 배경 */
--gradient-stripe-mesh: linear-gradient(
  135deg,
  #635BFF 0%,
  #9B8CFF 30%,
  #FF7EB3 60%,
  #80E9FF 100%
);

/* 서브틀 그라데이션 — CTA 카드 호버, 섹션 배경 */
--gradient-stripe-subtle: linear-gradient(
  135deg,
  rgba(99, 91, 255, 0.06) 0%,
  rgba(155, 140, 255, 0.04) 50%,
  rgba(255, 126, 179, 0.03) 100%
);

/* 수평 그라데이션 — 프로그레스 바, 장식 라인 */
--gradient-stripe-horizontal: linear-gradient(
  90deg,
  #635BFF 0%,
  #80E9FF 100%
);
```

**사용 규칙:**
- `--gradient-stripe-mesh`: 랜딩 히어로, Premium 업셀 카드, 성취 축하 배경에만
- `--gradient-stripe-subtle`: 마우스 호버, 활성 카드 배경에만
- `--gradient-stripe-horizontal`: ReadinessBar 100% 상태, 장식 구분선에만
- **본문 카드에 절대 사용 금지** — 가독성 훼손
- 그라데이션 위 텍스트는 항상 `--color-text-on-color` (#FFFFFF)

---

## 2. 타이포그래피 — Inter 기준

### 2.1 폰트 스택

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

Inter 웹폰트 로드:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 2.2 타입 스케일 (375px 모바일 기준)

| 스타일 | 크기 | 웨이트 | 행간 | letter-spacing | 용도 |
|---|---|---|---|---|---|
| Display | 32px | 700 | 1.2 (38px) | -0.5px | 페이지 제목, 큰 숫자 (Settle Score, D-Day) |
| H1 | 24px | 700 | 1.3 (31px) | -0.3px | 섹션 헤더 ("안녕하세요, Alex!") |
| H2 | 20px | 600 | 1.4 (28px) | 0 | 서브 섹션 |
| H3 | 18px | 600 | 1.4 (25px) | 0 | 카드 제목 |
| Body | 16px | 400 | 1.5 (24px) | 0 | 기본 본문 |
| Small | 14px | 400 | 1.5 (21px) | 0 | 보조 텍스트, 면책 문구 |
| Caption | 12px | 500 | 1.4 (17px) | 0 | 메타데이터, 태그, 뱃지 |
| Tab Label | 10px | 500 | 1.4 (14px) | 0 | 탭바 라벨 |
| Button | 16px | 600 | 1.2 (19px) | 0 | 버튼 텍스트 |

### 2.3 규칙

- 폰트 종류: **Inter 1개만**. 장식 서체 금지.
- `fontWeight`는 숫자: `400`, `500`, `600`, `700`
- 행간: 본문 1.5, 헤딩 1.2~1.4
- **Negative letter-spacing**: Display/H1에만 적용. 이것이 Stripe 타이포의 시그니처.
- **Input 폰트 16px 필수**: iOS에서 16px 미만 input은 자동 확대됨.
- **최소 폰트 크기**: 10px (Tab Label 전용). 그 외 12px 이상.

---

## 3. 그리드 & 간격 — 8pt 시스템 (v1 계승)

| 구분 | 값 | 적용 |
|---|---|---|
| 기본 단위 | 8px | 모든 간격의 최소 배수 |
| 페이지 좌우 여백 | 16px (`px-4`) | 콘텐츠 너비 = 375 - 32 = 343px |
| 카드 내부 패딩 | 16px (`p-4`) | 기본. 24px도 허용 |
| 요소 간격 (작음) | 8px (`gap-2`) | 인접 요소 간 |
| 요소 간격 (중간) | 12-16px (`gap-3` ~ `gap-4`) | 카드 내 항목 간 |
| 섹션 간격 | 24px (`space-y-6`) | 큰 블록 간 |
| 카드 간 간격 | 12px (`gap-3`) | 카드 리스트 |
| 터치 타겟 최소 | 44px | Apple HIG 필수 |

### 금지

- 소수점: `7.3px`, `15px` → `8px`, `16px`로 교정
- 비 8배수: `10px`, `18px`, `22px` → 가장 가까운 8배수로
- 예외: `border-width` (0.5px, 1px), `font-size` (타이포 매트릭스 따름), `letter-spacing`

---

## 4. 그림자 — 다층 시스템

### v1 → v2 변경

v1: `shadow-lg` 단일 → v2: 2중 레이어 기본

```css
:root {
  /* 카드 기본 */
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08),
                 0 4px 12px rgba(0, 0, 0, 0.04);

  /* 카드 호버 / 활성 */
  --shadow-card-hover: 0 4px 16px rgba(0, 0, 0, 0.10),
                       0 1px 4px rgba(0, 0, 0, 0.06);

  /* 떠있는 요소 (모달, 시트, 드롭다운) */
  --shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.12),
                     0 2px 6px rgba(0, 0, 0, 0.06);

  /* 입력 필드 포커스 */
  --shadow-focus: 0 0 0 3px var(--color-action-primary-subtle);

  /* 에러 포커스 */
  --shadow-focus-error: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
```

### 사용 규칙

- 카드: `box-shadow: var(--shadow-card)` (기본), 호버 시 `var(--shadow-card-hover)` 전환
- 바텀시트/모달: `var(--shadow-elevated)`
- 입력 필드 포커스: `border-color: var(--color-border-focus)` + `box-shadow: var(--shadow-focus)`
- **그림자 전환**: `transition: box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1)`
- Tailwind shadow 유틸리티 금지 → 커스텀 토큰만 사용

---

## 5. Corner Radius

| 요소 | v1 | v2 | Tailwind |
|---|---|---|---|
| 카드 | 24px | **12px** | `rounded-xl` |
| 버튼 | 16px | **8px** | `rounded-lg` |
| 입력 필드 | 16px | **8px** | `rounded-lg` |
| 뱃지 | — | **6px** | `rounded-md` |
| 바텀시트 상단 | 24px | **16px** | `rounded-t-2xl` |
| 탭바 | 부유형 | **없음** (직사각 고정) | — |
| 프로그레스 바 | — | **4px** | `rounded-sm` |
| 아바타/프로필 | — | **50%** | `rounded-full` |

---

## 6. 애니메이션

### 6.1 Easing (Stripe 시그니처)

```css
:root {
  --ease-stripe: cubic-bezier(0.25, 1, 0.5, 1);  /* 빠른 시작 + 약간의 오버슈팅 */
  --ease-out: ease-out;                            /* 일반 진출 */
}
```

### 6.2 Duration

| 유형 | Duration | 적용 |
|---|---|---|
| 마이크로 (버튼, 토글, 체크박스) | 200ms | 즉각 반응 |
| 표준 (카드 호버, 페이드인) | 300ms | 기본 전환 |
| 바텀시트 진입/퇴장 | 400ms | 큰 요소 이동 |
| Shimmer 로딩 | 2000ms (infinite) | 스켈레톤 |

### 6.3 Stagger (연속 진입)

```css
/* 리스트 아이템 순차 등장 */
.stagger-child:nth-child(1) { animation-delay: 0ms; }
.stagger-child:nth-child(2) { animation-delay: 50ms; }
.stagger-child:nth-child(3) { animation-delay: 100ms; }
.stagger-child:nth-child(4) { animation-delay: 150ms; }
```

### 6.4 공통 애니메이션

```css
/* Fade + Slide Up (카드, 리스트 아이템 진입) */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-enter {
  animation: fadeSlideUp 0.3s var(--ease-stripe);
}

/* 바텀시트 */
@keyframes sheetEnter {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.animate-sheet {
  animation: sheetEnter 0.4s var(--ease-stripe);
}

/* Shimmer 로딩 */
@keyframes shimmer {
  from { background-position: -400px 0; }
  to { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    var(--color-border-default) 0%,
    var(--color-surface-secondary) 50%,
    var(--color-border-default) 100%
  );
  background-size: 800px 100%;
  animation: shimmer 2s infinite;
}

/* 버튼 press */
.btn-press:active {
  transform: scale(0.98);
  transition: transform 0.1s ease-out;
}
```

### 6.5 접근성

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. 컴포넌트 스펙

### 7.1 Button

#### 크기

| 크기 | 높이 | 패딩 | 폰트 | 용도 |
|---|---|---|---|---|
| Small | 36px | 8px 16px | 14px/600 | 보조 액션, 카드 내 |
| Medium | 44px | 12px 24px | 16px/600 | 표준 CTA |
| Large | 48px | 12px 24px | 16px/600 | 모바일 풀와이드 CTA |

#### 역할별 스타일

| 역할 | 배경 | 텍스트 | 테두리 | 용도 |
|---|---|---|---|---|
| Primary | `--color-action-primary` | `--color-text-on-color` | none | CTA ("제출", "시작") |
| Secondary | `--color-surface-secondary` | `--color-text-primary` | `1px --color-border-strong` | 보조 액션 |
| Destructive | `--color-action-error` | `--color-text-on-color` | none | 삭제, 로그아웃 |
| Ghost | transparent | `--color-action-primary` | none | 링크형 ("View all") |

#### 상태

| 상태 | 변화 |
|---|---|
| Hover | 배경 -12% lightness |
| Active/Pressed | `transform: scale(0.98)` |
| Disabled | `opacity: 0.5; cursor: not-allowed` |
| Loading | 텍스트 → Loader2 스피너 (`animate-spin`) |

#### CSS

```css
.btn {
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.3s var(--ease-stripe),
              transform 0.1s ease-out;
}
```

### 7.2 Input (TextField)

| 속성 | 값 |
|---|---|
| 높이 | 44px |
| 패딩 | 12px 16px |
| 폰트 | 16px / 400 (iOS zoom 방지) |
| 배경 | `--color-surface-primary` |
| 테두리 | `1px solid var(--color-border-strong)` |
| 곡률 | 8px |
| 플레이스홀더 | `--color-text-tertiary` |

#### 상태

| 상태 | 스타일 |
|---|---|
| Default | `border: 1px solid var(--color-border-strong)` |
| Focus | `border-color: var(--color-border-focus)` + `box-shadow: var(--shadow-focus)` |
| Error | `border-color: var(--color-action-error)` + `box-shadow: var(--shadow-focus-error)` |
| Disabled | `background: var(--color-surface-secondary); color: var(--color-text-tertiary)` |

### 7.3 Card

| 속성 | 값 |
|---|---|
| 배경 | `--color-surface-primary` |
| 곡률 | 12px |
| 패딩 | 16px (기본), 24px (큰 카드) |
| 테두리 | `0.5px solid var(--color-border-default)` |
| 그림자 | `var(--shadow-card)` |
| 호버 | `var(--shadow-card-hover)` + `transition: box-shadow 0.3s var(--ease-stripe)` |
| 너비 | 343px (375px - 16px × 2) |

### 7.4 Badge

| 상태 | 배경 | 텍스트 | 용도 |
|---|---|---|---|
| Success | `--color-bg-success` | `--color-text-success` | 완료, 승인 |
| Warning | `--color-bg-warning` | `--color-text-warning` | 주의, D-Day |
| Error | `--color-bg-error` | `--color-text-error` | 에러, 만료 |
| Info | `--color-bg-info` | `--color-text-info` | 정보, 진행 중 |
| Neutral | `--color-surface-secondary` | `--color-text-secondary` | 기본 태그 |

공통: `padding: 4px 8px; font-size: 12px; font-weight: 500; border-radius: 6px;`

### 7.5 Progress Bar (ReadinessBar 등)

| 속성 | 값 |
|---|---|
| 높이 | 8px |
| 곡률 | 4px |
| 배경 (트랙) | `--color-surface-secondary` |
| 채움 (기본) | `--color-action-primary` |
| 채움 (100%) | `--color-action-success` 또는 `--gradient-stripe-horizontal` |
| 전환 | `width 0.5s var(--ease-stripe)` |

### 7.6 Tab Bar

| 속성 | v1 | v2 |
|---|---|---|
| 스타일 | 부유형 + Liquid Glass | **고정 하단 + solid 배경** |
| 높이 | 미지정 | **56px** |
| 배경 | Glass blur | `--color-surface-elevated` |
| 상단선 | blur | `0.5px solid var(--color-border-default)` |
| 탭 수 | 4 (Home/Visa/Remit/MY) | **4 (Home/Visa/Life/MY)** |
| 아이콘 | 25×25, Lucide | **24×24, Lucide** |
| 라벨 | 10pt Medium | **10px / 500** |
| 활성 색상 | `--color-action-primary` | `--color-action-primary` (유지) |
| 비활성 색상 | `--color-text-secondary` | `--color-text-secondary` (유지) |
| 활성 아이콘 | strokeWidth 2.5 | **strokeWidth 2, `fill` 또는 weight 변화** |

### 7.7 Bottom Sheet

| 속성 | 값 |
|---|---|
| 상단 곡률 | 16px |
| 배경 | `--color-surface-primary` |
| 오버레이 | `--color-overlay` + `backdrop-filter: blur(4px)` |
| 애니메이션 | `sheetEnter 0.4s var(--ease-stripe)` |
| 스냅 포인트 | 50vh / 75vh / 90vh |
| 핸들 바 | 36×4px, `--color-border-strong`, 곡률 2px, 상단 중앙 |

### 7.8 Toast (Sonner)

| 속성 | 값 |
|---|---|
| 위치 | 화면 하단 16px 위 |
| 너비 | 343px |
| 높이 | auto (최소 48px) |
| 배경 | `--color-text-primary` (어두운 토스트) |
| 텍스트 | `--color-text-on-color` |
| 곡률 | 8px |
| 자동 사라짐 | 3초 |

---

## 8. 로딩 / 에러 / 빈 상태 패턴

### v1 → v2 변경

| 상태 | v1 | v2 |
|---|---|---|
| 로딩 (목록) | `animate-pulse` 카드 | **Shimmer gradient sweep** |
| 로딩 (버튼) | 스피너 + 텍스트 | 스피너 + 텍스트 (유지) |
| 에러 (인라인) | 에러 배너 | `--color-bg-error` + `--color-text-error` + 1px border |
| 빈 상태 | 텍스트 + CTA | 텍스트 + CTA (유지, 스타일만 변경) |

### Skeleton 높이 기준

| 요소 | 높이 |
|---|---|
| 텍스트 라인 | 12px |
| 버튼 | 44px |
| 카드 | 120px |
| 아바타 | 40×40px (circle) |

---

## 9. 접근성 규칙 (v1 계승 + 보강)

| 항목 | 기준 |
|---|---|
| 텍스트 대비 | 최소 4.5:1 (WCAG AA) |
| 터치 타겟 | 최소 44×44px |
| 포커스 링 | `var(--shadow-focus)` — `0 0 0 3px` 인디고 반투명 |
| 모션 감소 | `@media (prefers-reduced-motion: reduce)` → 애니메이션 비활성 |
| 스크린리더 | 아이콘 버튼에 `aria-label` 필수 |

---

## 10. i18n 규칙 (v1 계승)

- **전 페이지 모든 유저 노출 텍스트**는 `t()` 경유 필수
- 콜론 네임스페이스 표기: `t('visa:mission.title')`. 점(dot) 네임스페이스 금지.
- 네임스페이스: common, visa, home, life (신규, remit 대체), profile, notification, paywall, onboarding

---

## 11. 탭 구조 변경

### v1 → v2

| v1 | v2 | 변경 |
|---|---|---|
| Home | Home | 유지 |
| Visa | Visa | 유지 |
| **Remit** | **Life** | 송금 → Life 탭 하위로 이동 |
| MY | MY | 유지 |

### Life 탭 3카테고리

| 카테고리 | 아이콘 | 내용 |
|---|---|---|
| 금융 | Wallet | 송금 비교, 은행 계좌, 보험, 폰 플랜 |
| 문화 | Globe | 여행, 한국어 학습, 문화 콘텐츠 |
| 생활 | Home | 맛집, 고향 식재료, 절약 팁 |

---

## 12. 삭제 대상 (v1 → v2 전환 시)

### CSS/스타일에서 제거

| 제거 대상 | 이유 |
|---|---|
| `.glass-surface` 클래스 및 관련 CSS | Liquid Glass 전면 폐기 |
| `backdrop-filter: blur(20px) saturate(180%)` (탭바/헤더) | Solid 배경으로 교체 |
| `@media (prefers-reduced-transparency)` 폴백 | Liquid Glass 없으므로 불필요 |
| `shadow-lg`, `shadow-xl` Tailwind 유틸리티 | 커스텀 그림자 토큰으로 교체 |
| `rounded-3xl` (24px) | 12px로 교체 |
| `rounded-2xl` (버튼에서) | 8px로 교체 |
| Spring 애니메이션 값 (response, dampingFraction) | cubic-bezier로 교체 |
| `animate-pulse` (로딩 상태) | shimmer로 교체 |

### 파일에서 제거

| 파일 | 작업 |
|---|---|
| theme.css 내 Liquid Glass 변수/클래스 | 삭제 후 v2 토큰으로 교체 |
| 각 페이지 인라인 `<style>` slideUp 중복 | 공통 애니메이션으로 통합 |

### 코드에서 제거하지 않는 것

| 유지 대상 | 이유 |
|---|---|
| 비즈니스 로직 전체 | Rule #26 |
| `theme.css` 파일 자체 | 절대 삭제 금지. 내용만 교체 |
| Google SVG 브랜드 컬러 | 토큰화 면제 |
| 바텀시트 `backdrop-filter: blur(4px)` | 오버레이에는 유지 (Glass 아닌 기능적 blur) |

---

## 13. Figma Make 프롬프트 업데이트 (v2)

### 기본 구조

```
[Context]
한국 체류 외국인을 위한 슈퍼앱 "Settle"의 모바일 화면.
타겟 유저: E-9 비전문취업 노동자 + D-2 유학생.
다국어 지원 (한국어, 영어, 베트남어, 중국어).

[Platform]
iOS 모바일 전용. 375×812 프레임. Safe Area 반영.

[Style]
Stripe Dashboard 미학. Inter 폰트.
색상: #635BFF(Primary Indigo), #10B981(Success), #F6F8FA(Background), #FFFFFF(Card).
카드 곡률 12px. 버튼 곡률 8px. 8pt 그리드.
다층 그림자 (0 1px 3px + 0 4px 12px). 깔끔하고 미니멀.
숫자 강조: Display 32px Bold, letter-spacing -0.5px.

[Negative]
보라색/네온 그라데이션 금지 (시스템 그라데이션만 허용).
3D 이모티콘 금지.
불필요한 장식 그래픽 금지.
글래스모피즘 금지 (Liquid Glass 전면 폐기).
24px 이상 곡률 금지.
단일 그림자(shadow-lg) 금지 — 다층 그림자만.

[Components]
하단 탭바: 4개 (Home/Visa/Life/MY). 고정 하단, solid 배경, 56px 높이.
```

---

## 14. theme.css 토큰 매핑 (구현용)

theme.css에 넣을 최종 토큰 세트. 기존 v1 토큰을 이 내용으로 **전면 교체**.

```css
/* ============================================
   Settle Design System v2.0 — Theme Tokens
   Stripe 미학 기반. 이 파일은 절대 삭제 금지.
   ============================================ */

:root {
  /* --- Action --- */
  --color-action-primary: #635BFF;
  --color-action-primary-hover: #5349E0;
  --color-action-primary-subtle: rgba(99, 91, 255, 0.08);
  --color-action-success: #10B981;
  --color-action-warning: #F59E0B;
  --color-action-error: #EF4444;

  /* --- Text --- */
  --color-text-primary: #1A1D26;
  --color-text-secondary: #6B7294;
  --color-text-tertiary: #A3ACCD;
  --color-text-on-color: #FFFFFF;

  /* --- Surface --- */
  --color-surface-primary: #FFFFFF;
  --color-surface-secondary: #F6F8FA;
  --color-surface-elevated: #FFFFFF;

  /* --- Border --- */
  --color-border-default: #E3E8EF;
  --color-border-strong: #CFD5E2;
  --color-border-focus: #635BFF;

  /* --- Overlay --- */
  --color-overlay: rgba(0, 0, 0, 0.30);

  /* --- Status Backgrounds --- */
  --color-bg-success: #D1FAE5;
  --color-bg-warning: #FEF3C7;
  --color-bg-error: #FEE2E2;
  --color-bg-info: #EEF2FF;

  /* --- Status Text --- */
  --color-text-success: #065F46;
  --color-text-warning: #92400E;
  --color-text-error: #991B1B;
  --color-text-info: #3730A3;

  /* --- Shadow --- */
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
  --shadow-card-hover: 0 4px 16px rgba(0, 0, 0, 0.10), 0 1px 4px rgba(0, 0, 0, 0.06);
  --shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06);
  --shadow-focus: 0 0 0 3px rgba(99, 91, 255, 0.10);
  --shadow-focus-error: 0 0 0 3px rgba(239, 68, 68, 0.10);

  /* --- Gradient (장식용) --- */
  --gradient-stripe-mesh: linear-gradient(135deg, #635BFF 0%, #9B8CFF 30%, #FF7EB3 60%, #80E9FF 100%);
  --gradient-stripe-subtle: linear-gradient(135deg, rgba(99,91,255,0.06) 0%, rgba(155,140,255,0.04) 50%, rgba(255,126,179,0.03) 100%);
  --gradient-stripe-horizontal: linear-gradient(90deg, #635BFF 0%, #80E9FF 100%);

  /* --- Animation --- */
  --ease-stripe: cubic-bezier(0.25, 1, 0.5, 1);

  /* --- Radius --- */
  --radius-card: 12px;
  --radius-button: 8px;
  --radius-input: 8px;
  --radius-badge: 6px;
  --radius-sheet: 16px;
  --radius-progress: 4px;
}
```

---

*Settle Design System v2.0 · 2026-03-30 · Stripe 미학 기반*
*이 문서는 DESIGN_SYSTEM.md(v1)와 Guidelines.md(Figma v1)를 대체한다.*