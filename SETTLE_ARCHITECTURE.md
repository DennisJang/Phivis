# 🏗️ Settle Architecture Design — 4-Layer Blueprint
> 이 문서는 설계 완료 후 프로젝트 지침 파일로 편입됨
> 코딩 시작 전 반드시 이 문서를 읽을 것

---

## Layer 0: 파일 구조 (추가할 것만)

```
src/
├── lib/
│   ├── supabase.ts          # Supabase 클라이언트 싱글턴
│   ├── auth.ts              # Auth 헬퍼 (signIn, signUp, signOut, resetPw)
│   └── constants.ts         # 환경변수, 매직넘버, 비자 점수표
│
├── stores/
│   ├── useAuthStore.ts      # 인증 상태 (user, session, loading)
│   ├── useDashboardStore.ts # 프로필+비자+워크로그 통합 스토어
│   ├── usePaymentStore.ts   # 구독 상태 + Toss 연동
│   └── useSubmitStore.ts    # 팩스/서류 제출 상태
│
├── hooks/
│   ├── useRequireAuth.ts    # Auth Guard 훅
│   └── useSubscription.ts   # 구독 상태 체크 훅
│
├── types/
│   └── index.ts             # 전체 타입 정의 (DB 테이블 1:1 매핑)
│
├── app/
│   ├── routes.tsx            # 기존 (Auth Guard 래핑 추가)
│   ├── pages/                # 기존 8개 (로직 바인딩만 추가)
│   └── components/           # 기존 (터치하지 않음)
```

**원칙:** Figma 생성 파일은 건드리지 않는다. `lib/`, `stores/`, `hooks/`, `types/` 만 새로 추가.

---

## Layer 1: Auth 레이어

### 1.1 Supabase Client

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### 1.2 Auth Store

```typescript
// src/stores/useAuthStore.ts
interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean

  // Actions
  initialize: () => Promise<void>    // onAuthStateChange 구독
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>       // signOut + 모든 store reset + navigate("/")
  resetPassword: (email: string) => Promise<void>
}
```

**핵심 흐름:**
1. `App.tsx` 마운트 → `initialize()` 호출
2. `onAuthStateChange` → session 있으면 user 세팅
3. 신규 유저 → `user_profiles` + `visa_trackers` 자동 생성 (DB trigger or RPC)

### 1.3 Auth Guard

```typescript
// src/hooks/useRequireAuth.ts
// session 없으면 "/" 로 리다이렉트
// routes.tsx에서 Layout 컴포넌트 진입 전 체크
```

### 1.4 Route 구조 변경

```typescript
// routes.tsx 수정 방향 (구조만, 디자인 안 건듦)
{
  path: "/",
  Component: Landing,  // 미인증 전용
},
{
  path: "/",
  Component: AuthGuardLayout,  // Layout + Auth 체크 래핑
  children: [
    { path: "home", Component: Home },
    // ... 기존 동일
  ],
}
```

### 1.5 신규 유저 자동 프로필 생성 (DB Trigger)

```sql
-- Supabase SQL Editor에서 실행
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'en'
  );

  INSERT INTO public.visa_trackers (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Layer 2: Data 레이어

### 2.1 테이블 요약 (SETTLE_BLUEPRINT.md 기준, 변경 없음)

| 테이블 | 주요 역할 | 쓰기 주체 |
|---|---|---|
| `user_profiles` | 유저 기본 + 구독 상태 | Auth trigger, Profile 수정, 결제 webhook |
| `visa_trackers` | 비자 점수 + KIIP + 체크리스트 | Dashboard store |
| `daily_work_logs` | 출퇴근 기록 | Remit 탭 CRUD |
| `life_events` | 활동 이력 (홈 피드) | 각 액션 후 자동 INSERT |
| `kiip_schedules` | KIIP 수업 일정 (읽기 전용) | Admin/수동 |
| `kiip_alerts` | KIIP 알림 구독 | Education 탭 |
| `remit_logs` | 송금 비교 이력 | 딥링크 클릭 시 |
| `admin_match_requests` | 행정사 매칭 | Visa/Housing CTA |
| `fax_submissions` | 팩스 발송 | Submit store |
| `payment_history` | 결제 이력 | Toss webhook |
| `action_queue` | 자동화 큐 | 시스템 |

### 2.2 RLS 정책 (전 테이블 공통 패턴)

```sql
-- 모든 user_id FK 테이블에 동일 적용
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- INSERT는 trigger가 처리하므로 일반 유저 INSERT 불필요
-- DELETE는 cascade로 auth.users 삭제 시 자동
```

**예외:**
- `kiip_schedules` → 전체 공개 읽기 (인증된 유저 전체)
- `fax_submissions`, `payment_history` → INSERT는 Edge Function (service_role)

### 2.3 Edge Functions (기존 9개에서 우선순위 정리)

| 함수 | 우선순위 | 트리거 | 핵심 로직 |
|---|---|---|---|
| `get-wage-summary` | P0 | Remit 탭 진입 | user_id → daily_work_logs 집계 → MonthlyWageResult 반환 |
| `toss-subscribe-init` | P0 | Paywall "Start trial" | customerKey 생성 → Toss 위젯 초기화 데이터 반환 |
| `toss-webhook-handler` | P0 | Toss 서버 콜백 | 결제 확인 → payment_history INSERT → user_profiles.subscription_plan 업데이트 |
| `parse-contract-ocr` | P1 | Housing "Scan" | Base64 이미지 → OpenAI gpt-4o-mini → Zod 검증 → 분석 결과 반환 |
| `render-immigration-pdf` | P1 | Visa 서류 생성 | user_profiles 데이터 → pdf-lib 좌표 매핑 → PDF 바이너리 반환 |
| `send-immigration-fax` | P1 | 팩스 발송 | Popbill API 호출 → fax_submissions 업데이트 |
| `webhook-fax-handler` | P2 | Popbill 콜백 | 팩스 상태 업데이트 |
| `handle-vault-cleanup` | P3 | CRON | 만료 파일 정리 |
| `sync-beehiiv-subscriber` | P3 | 회원가입 후 | 뉴스레터 연동 |

### 2.4 핵심 RPC

```sql
-- 비자 점수 재계산 (결정론적, AI 금지)
CREATE OR REPLACE FUNCTION public.recalculate_visa_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_profile user_profiles%ROWTYPE;
  v_tracker visa_trackers%ROWTYPE;
  v_total INTEGER := 0;
BEGIN
  SELECT * INTO v_profile FROM user_profiles WHERE user_id = p_user_id;
  SELECT * INTO v_tracker FROM visa_trackers WHERE user_id = p_user_id;

  -- 연령 점수 (법무부 점수표 하드코딩)
  -- 소득 점수
  -- 한국어 점수 (KIIP 단계 기반)
  -- 사회통합 점수
  -- 체류기간 점수

  UPDATE visa_trackers
  SET total_score = v_total,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 스펙 업데이트 (user_profiles 타겟 — visa_trackers 아님!)
CREATE OR REPLACE FUNCTION public.update_user_spec(
  p_user_id UUID,
  p_visa_type VARCHAR DEFAULT NULL,
  p_visa_expiry DATE DEFAULT NULL,
  p_nationality VARCHAR DEFAULT NULL,
  p_phone VARCHAR DEFAULT NULL,
  p_language VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET
    visa_type = COALESCE(p_visa_type, visa_type),
    visa_expiry = COALESCE(p_visa_expiry, visa_expiry),
    nationality = COALESCE(p_nationality, nationality),
    phone = COALESCE(p_phone, phone),
    language = COALESCE(p_language, language),
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Layer 3: State 레이어 (Zustand)

### 3.1 useDashboardStore

```typescript
// src/stores/useDashboardStore.ts
interface DashboardState {
  // Data
  profile: UserProfile | null
  visaTracker: VisaTracker | null
  recentEvents: LifeEvent[]
  workLogs: DailyWorkLog[]

  // Loading
  hydrating: boolean

  // Actions
  hydrate: () => Promise<void>
  // → user_profiles, visa_trackers, life_events, daily_work_logs 한 번에 fetch

  updateSpecOptimistic: (spec: Partial<UserProfile>) => Promise<void>
  // → optimistic UI → update_user_spec RPC → rollback on error

  saveWorkLog: (log: Partial<DailyWorkLog>) => Promise<void>
  // → daily_work_logs UPSERT (UNIQUE user_id + work_date)

  submitFaxWithLiability: () => Promise<void>
  // → 면책 체크 확인 → render-immigration-pdf → send-immigration-fax

  // Reset
  reset: () => void  // signOut 시 호출
}
```

**hydrate 흐름:**
```
App 마운트 → Auth 확인 → session 있음 → hydrate() 호출
→ Promise.all([
    supabase.from('user_profiles').select().eq('user_id', uid).single(),
    supabase.from('visa_trackers').select().eq('user_id', uid).single(),
    supabase.from('life_events').select().eq('user_id', uid).order('created_at', { ascending: false }).limit(10),
  ])
→ 상태 세팅 → hydrating = false
```

### 3.2 usePaymentStore

```typescript
// src/stores/usePaymentStore.ts
interface PaymentState {
  plan: 'free' | 'basic' | 'premium'
  expiresAt: string | null
  loading: boolean

  // Actions
  initSubscription: (plan: string, cycle: string) => Promise<TossInitData>
  // → toss-subscribe-init Edge Function 호출
  // → { clientKey, customerKey, orderId, orderName, amount }

  activateSubscription: (paymentKey: string) => Promise<void>
  // → toss-webhook에서 처리되지만, 클라이언트 확인용 폴링

  resetSubscription: () => void
}
```

### 3.3 useSubmitStore

```typescript
// src/stores/useSubmitStore.ts
type SubmitStatus = 'idle' | 'pending' | 'success' | 'error'  // "sending" 없음

interface SubmitState {
  status: SubmitStatus
  error: string | null
  lastReceiptId: string | null

  // Actions
  submitFax: () => void  // 인자 없음 — DashboardStore에서 데이터 가져옴
  resolveFax: (receiptId: string) => void
  rejectFax: (error: string) => void
  reset: () => void
}
```

---

## Layer 4: UI Binding 레이어 (화면별 데이터 연결)

### 4.1 바인딩 맵 (하드코딩 → 동적)

#### Landing
| 하드코딩 | 바인딩 대상 |
|---|---|
| `navigate("/home")` 직접 이동 | `useAuthStore.signInWithEmail()` → 성공 시 `/home` |
| email/password input | `useAuthStore` 연동 |
| (추가) Google OAuth 버튼 | `useAuthStore.signInWithGoogle()` |

#### Home
| 하드코딩 | 바인딩 대상 |
|---|---|
| `"안녕하세요, Alex!"` | `profile.full_name` |
| `"28 days"` | `profile.visa_expiry` → `differenceInDays(expiry, now)` |
| Recent Activity 3개 | `recentEvents.slice(0, 3)` |
| Premium 카드 표시 여부 | `profile.subscription_plan !== 'premium'` |

#### Visa
| 하드코딩 | 바인딩 대상 |
|---|---|
| `score = 68` | `visaTracker.total_score` |
| Age/KIIP/Stay | `profile` + `visaTracker` 조합 |
| requirements 배열 | `visaTracker.checklist` (JSONB) |
| KIIP 단계 | `visaTracker.kiip_stage` |
| 행정사 매칭 CTA | `admin_match_requests` INSERT + **LiabilityActionSheet** |

#### Remit
| 하드코딩 | 바인딩 대상 |
|---|---|
| 환율 "1,320.50" | 정적 데이터 (v1) → 환율 API (v2) |
| 3개 업체 | 정적 상수 (딥링크 URL 포함) |
| 업체 클릭 | `window.open(deeplink)` + `remit_logs` INSERT |
| 급여 달력 | `workLogs` → 월별 그룹핑 |
| Salary Breakdown | `get-wage-summary` Edge Function |

#### Housing
| 하드코딩 | 바인딩 대상 |
|---|---|
| AI Scanner | 구독 체크 → 파일 업로드 → `parse-contract-ocr` |
| 보험사 3곳 | 정적 상수 (v1) |
| 법무사 2곳 | 정적 상수 → 클릭 시 `admin_match_requests` |
| Emergency 버튼 | `tel:` 링크 |

#### Education
| 하드코딩 | 바인딩 대상 |
|---|---|
| KIIP 일정 3개 | `kiip_schedules` 테이블 쿼리 |
| 모의고사 | v1: 외부 링크 / v2: 내장 엔진 |
| E-7-4 점수 | `visaTracker` 점수 분해 |

#### Profile
| 하드코딩 | 바인딩 대상 |
|---|---|
| "Alex Johnson" | `profile.full_name` |
| email | `user.email` (auth) |
| Visa/KIIP/Employment | `profile` + `visaTracker` |
| 각 항목 클릭 | `update_user_spec` RPC |
| Subscription "Basic" | `profile.subscription_plan` |
| Log out | `useAuthStore.signOut()` |

#### Paywall
| 하드코딩 | 바인딩 대상 |
|---|---|
| "Current plan" | `profile.subscription_plan` 에 따라 버튼 텍스트 변경 |
| "Start free trial" | `usePaymentStore.initSubscription('premium', 'monthly')` |
| Annual 카드 | `initSubscription('premium', 'yearly')` |

---

## 구현 순서 (우선순위)

### Phase 1: 기반 (코딩 가능)
1. `lib/supabase.ts` — 클라이언트 생성
2. `types/index.ts` — DB 타입 정의
3. `stores/useAuthStore.ts` — Auth 전체
4. `hooks/useRequireAuth.ts` — Guard
5. `routes.tsx` 수정 — Guard 래핑
6. `landing.tsx` 수정 — 실제 Auth 연결
7. DB: `handle_new_user` trigger 생성
8. DB: 전 테이블 RLS 활성화
9. **`sonner.tsx` 수정** — `next-themes` 제거, `theme="light"` 하드코딩

### Phase 2: 데이터 바인딩 (Auth 완료 후)
1. `stores/useDashboardStore.ts` — hydrate + 프로필/비자 데이터
2. `home.tsx` — 동적 바인딩 (이름, D-Day, 피드)
3. `visa.tsx` — 점수 링 + 체크리스트 + KIIP
4. `profile.tsx` — 스펙 읽기/쓰기

### Phase 3: 트랜잭션 기능
1. `stores/usePaymentStore.ts` — Toss 연동
2. `paywall.tsx` — 결제 플로우
3. Edge Functions: `toss-subscribe-init`, `toss-webhook-handler`
4. Edge Function: `get-wage-summary`
5. `remit.tsx` — 급여 바인딩

### Phase 4: 프리미엄 기능
1. Edge Function: `parse-contract-ocr`
2. `housing.tsx` — AI 스캐너 + 면책
3. Edge Functions: `render-immigration-pdf`, `send-immigration-fax`
4. `stores/useSubmitStore.ts` — 팩스 플로우
5. `education.tsx` — KIIP 일정 바인딩

---

## .env 템플릿

```env
VITE_SUPABASE_URL=https://wcwurhccxhbzojrsictb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_TOSS_CLIENT_KEY=test_ck_...
VITE_POPBILL_API_KEY=...
```

**규칙 #21:** `=` 뒤 공백 절대 금지
**규칙 #22:** 브라우저 변수는 반드시 `VITE_` 접두사

---

## 면책 체크포인트 (변호사법 회피)

아래 액션은 반드시 **면책 체크박스 확인 후** 실행:
- [ ] AI 계약서 스캔 (`parse-contract-ocr`)
- [ ] 서류 PDF 생성 (`render-immigration-pdf`)
- [ ] 팩스 발송 (`send-immigration-fax`)
- [ ] 행정사 매칭 요청 (`admin_match_requests` INSERT)

면책 문구: "본 서비스는 참고용이며 법률 자문이 아닙니다. 제출 책임은 본인에게 있습니다."

---

## 버그 수정 목록 (코딩 전 선행)

1. `src/app/components/ui/sonner.tsx` — `next-themes` import 제거, `theme="light"` 하드코딩
2. `package.json` — `next-themes` 의존성 제거
3. `"use client"` 디렉티브 — Vite에서 무해하지만 알고 있을 것