# Settle Architecture v2.5 — Design System v2.0 반영
> 갱신: 2026-03-30 · V2.4 + 탭 변경(Remit→Life) + 휴면 정리 + Design System v2 반영
> 이전 V2.1~V2.4는 이 파일로 대체. 삭제 가능.

---

## Layer 0: 파일 구조

```
src/
├── app/
│   ├── pages/
│   │   ├── landing.tsx          ✅
│   │   ├── onboarding.tsx       ✅
│   │   ├── home.tsx             ✅ Phase 4 + DS v2 적용
│   │   ├── visa.tsx             ✅ Phase 4 + DS v2 적용
│   │   ├── life.tsx             🔄 remit.tsx에서 리네임 + Life 탭 3카테고리
│   │   ├── profile.tsx          ✅ (MY 탭)
│   │   ├── paywall.tsx          ✅
│   │   ├── PaywallSuccess.tsx   ✅
│   │   ├── privacy.tsx          ✅
│   │   └── terms.tsx            ✅
│   ├── components/
│   │   ├── layout.tsx           🔄 4탭: Home/Visa/Life/MY + DS v2 탭바
│   │   ├── AuthGuardLayout.tsx  ✅
│   │   ├── logo.tsx             ✅
│   │   ├── visa/
│   │   │   ├── KpointSimulator.tsx      ✅
│   │   │   ├── RequirementsChecklist.tsx ✅
│   │   │   ├── KiipProgress.tsx         ✅
│   │   │   ├── DocumentPrep.tsx         ✅
│   │   │   ├── SubmissionGuide.tsx      ✅
│   │   │   ├── MissionEntry.tsx         ✅
│   │   │   ├── ReadinessBar.tsx         ✅
│   │   │   ├── CelebrationModal.tsx     ✅
│   │   │   ├── DocumentSubmitCTA.tsx    ✅
│   │   │   ├── DocumentGuide.tsx        ✅
│   │   │   ├── WageCalculator.tsx       ✅
│   │   │   ├── LawyerMatchCTA.tsx       ✅
│   │   │   ├── LiabilitySheet.tsx       ✅
│   │   │   ├── compressImage.ts         ✅
│   │   │   ├── documentVault.ts         ✅
│   │   │   └── generatePdf.ts          ✅
│   │   └── ui/                  ✅ shadcn
│   ├── App.tsx                  ✅
│   └── routes.tsx               🔄 remit → life
├── i18n/
│   └── locales/ (ko/en/vi/zh)   🔄 remit 네임스페이스 → life
├── stores/
│   ├── useAuth.ts               ✅
│   ├── useDashboard.ts          ✅
│   ├── usePayment.ts            ✅
│   ├── useSubmit.ts             ✅
│   └── useVisaIntentStore.ts    ✅
├── hooks/useRequireAuth.ts      ✅
├── types/index.ts               ✅
├── lib/
│   ├── supabase.ts              ✅
│   └── eventLog.ts              ✅
└── styles/
    ├── theme.css                🔄 v2 토큰 전면 교체
    ├── index.css                ✅
    └── fonts.css                🔄 Inter 폰트 로드 추가
```

### 삭제 완료 파일
- `housing.tsx` — 삭제됨 (v15 세션)
- `education.tsx` — 삭제됨 (v15 세션)

### 삭제 대상 (DS v2 전환 시 코드에서 제거)
- theme.css 내 Liquid Glass 변수/클래스 (`.glass-surface` 등)
- `backdrop-filter: blur(20px) saturate(180%)` (탭바/헤더에서)
- `@media (prefers-reduced-transparency)` 폴백
- `shadow-lg`, `shadow-xl` Tailwind 유틸리티 사용처
- `rounded-3xl` (24px) → 12px 교체
- `rounded-2xl` (버튼에서) → 8px 교체
- `animate-pulse` → shimmer 교체
- 각 페이지 인라인 `<style>` slideUp 중복 → 공통 애니메이션 통합

---

## Layer 1: Route 구조

```typescript
export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  {
    path: "/",
    Component: AuthGuardLayout,
    children: [
      { path: "home", Component: Home },
      { path: "visa", Component: Visa },
      { path: "life", Component: Life },       // ← remit → life
      { path: "profile", Component: Profile },
      { path: "paywall", Component: Paywall },
      { path: "paywall/success", Component: PaywallSuccess },
      { path: "onboarding", Component: Onboarding },
      { path: "privacy", Component: Privacy },
      { path: "terms", Component: Terms },
    ],
  },
]);
```

---

## Layer 2: Data 레이어

### 테이블 (22개)

| 테이블 | 상태 | 사용 탭 | 비고 |
|---|---|---|---|
| user_profiles | ✅ | 전체 | |
| visa_trackers | ✅ | Home, Visa | |
| visa_intents | ✅ | Visa | 상태 머신 |
| visa_civil_metadata | ✅ | Visa | 46개 조합 |
| life_events | ✅ | Home | |
| action_queue | ✅ | 시스템 | |
| kiip_schedules | ✅ | Home | |
| kiip_alerts | ✅ | Home | |
| exchange_rates | ✅ | Home, **Life** | ← Remit → Life |
| remit_logs | ✅ | **Life** | ← Remit → Life |
| fax_submissions | ✅ | Visa | |
| payment_history | ✅ | MY | |
| admin_match_requests | ✅ | Visa | |
| document_requirements | ✅ | Visa | 239건, 공개 읽기 |
| document_vault | ✅ | Visa | 유저별 RLS |
| immigration_offices | ✅ | Visa | 19개 관서, 공개 읽기 |
| settle_events | ✅ | 시스템 | 5가지 MVP 이벤트 |
| daily_work_logs | ⏸️ | — | |
| housing_insurance_providers | — | — | 확인 결과 존재하지 않음 |
| housing_legal_services | — | — | 확인 결과 존재하지 않음 |
| exam_attempts | — | — | 확인 결과 존재하지 않음 |

**참고:** housing_insurance_providers, housing_legal_services, exam_attempts는 이전 세션에서 이미 존재하지 않음을 확인. mock_exams는 v15 세션에서 마이그레이션으로 삭제 완료.

### settle_events 스키마

```sql
settle_events (
  id uuid PK DEFAULT gen_random_uuid(),
  user_id uuid → auth.users,
  intent_id uuid → visa_intents (nullable),
  event_type text CHECK IN (
    'intent_created',
    'document_uploaded',
    'readiness_changed',
    'guide_viewed',
    'intent_completed'
  ),
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
)
-- RLS: 유저는 자기 이벤트만 INSERT/SELECT
```

### immigration_offices 데이터 현황

19/19 관서 완성. 전부 jurisdiction_keywords + phone_number + address_ko 채워짐.

---

## Layer 3: State 레이어

```
useAuthStore           → Auth 상태
useDashboardStore      → 프로필 + 비자 + 이벤트
usePaymentStore        → 구독 + Toss
useSubmitStore         → 팩스/서류 제출
useVisaIntentStore     → VisaIntent 상태 머신 + logEvent 연동
```

급여 계산기: 순수 클라이언트 계산 (Store/DB 불사용).

---

## Layer 4: Visa 탭 UI 바인딩

```
[MissionEntry] (최상단)
  "What do you need?" 3버튼: Extend / Change / Check Score
  currentIntent 있으면 → 진행 중 카드 표시

[ReadinessBar]
  visa_intents.readiness_score 바인딩
  100% = var(--color-action-success), else = var(--color-action-primary)

[D-Day Banner]
  D-90+: 미표시 | D-30~89: warning | D-30 이하: urgent

Block A: Score
├── KpointSimulator (ScoreRing 내장)
├── RequirementsChecklist
└── KiipProgress

Block B: Services
├── DocumentPrep (서류 준비 + 업로드 + PDF)
│   ├── onCivilTypeChange → visa.tsx state
│   └── onUploadComplete → visa.tsx refreshScore()
├── SubmissionGuide (제출 가이드 + 관서 선택 + logEvent)
├── DocumentGuide (AI 서류 가이드)
├── DocumentSubmitCTA (팩스 제출)
└── LawyerMatchCTA (행정사 매칭)

Block C: Tools
└── WageCalculator (급여 계산기)

[CelebrationModal]
  readiness_score < 100 → 100 전이 시 트리거
```

### 5계층 연결 흐름

```
업로드 → document_uploaded (L2 Event Log)
       → refreshScore() (L3 VisaIntent)
       → readiness_changed (L2 Event Log)
       → ReadinessBar 업데이트 (L5 UI)
       → score 100 → CelebrationModal (L5 UI + L4 Notification)
       → 상태 전이 → Sonner 토스트 (L4 Notification)
```

---

## Layer 5: Home 탭

```
[인사말]
[진행 중 민원 카드]
  currentIntent 있을 때: 비자유형 + Readiness % + D-Day + "계속하기" CTA
[비자 D-Day 카드]
[환율 스냅샷]
[KIIP 진행도]
[최근 활동 피드]
```

---

## Layer 6: Life 탭 (신규)

```
[카테고리 필 탭] — 금융 / 문화 / 생활
  기본 탭: 금융

[금융]
├── 송금 비교 (기존 remit.tsx 기능)
├── 은행 계좌 (정보 카드)
├── 보험 (정보 카드)
└── 폰 플랜 (정보 카드)

[문화]
├── 여행 (정보 카드)
├── 한국어 학습 (정보 카드)
└── 문화 콘텐츠 (정보 카드)

[생활]
├── 맛집 (정보 카드)
├── 고향 식재료 (정보 카드)
└── 절약 팁 (정보 카드)
```

**Stage 1**: 금융 탭의 송금 비교만 기능 완성. 나머지는 정보 카드(타이틀 + 설명 + "Coming soon" 뱃지).

---

## Design System v2 적용 범위

### 탭바 변경
- v1: 부유형 + Liquid Glass + Remit 탭
- v2: 고정 하단 + solid 배경 (#FFFFFF) + Life 탭 + 56px 높이 + 상단 `0.5px solid #E3E8EF`

### i18n 네임스페이스 변경
- v1: common, visa, home, **remit**, profile, notification, paywall, onboarding
- v2: common, visa, home, **life**, profile, notification, paywall, onboarding

### 전역 스타일 변경 (theme.css)
- 모든 색상 토큰: v1 Apple HIG → v2 Stripe 토큰으로 교체
- 그림자: shadow-lg 단일 → 다층 커스텀 토큰
- 곡률: radius 커스텀 토큰 추가
- 애니메이션: ease-stripe + shimmer + fadeSlideUp + sheetEnter
- Inter 폰트 로드 추가 (fonts.css 또는 index.html)

---

## Supabase Secrets

| Secret | 상태 |
|---|---|
| POPBILL_LINK_ID | ✅ |
| POPBILL_SECRET_KEY | ✅ |
| POPBILL_CORP_NUM | ✅ |
| KOREAEXIM_API_KEY | ✅ |
| EXCHANGERATE_API_KEY | ✅ |

---

## 번들 현황

| 항목 | 값 |
|---|---|
| 현재 크기 | **241KB** (메인), 전체 500KB 이하 ✅ |
| 목표 | 500KB 이하 달성 ✅ |
| 상태 | code-split 완료 |

---

*Settle Architecture v2.5 · 2026-03-30 · Design System v2.0 + Life 탭 반영.*
