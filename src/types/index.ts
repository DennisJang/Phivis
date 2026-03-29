// ============================================
// Settle DB Types — 테이블 1:1 매핑
// 절대 추측 금지, SETTLE_BLUEPRINT.md 기준
// Phase 5: Layer 2 (통합신청서 자동완성) 필드 추가
// ============================================

export interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  nationality: string | null
  visa_type: string | null
  visa_expiry: string | null // DATE → ISO string
  phone: string | null
  language: string
  subscription_plan: 'free' | 'basic' | 'premium'
  subscription_expires_at: string | null
  created_at: string
  updated_at: string
  primary_bank: string | null
  frequent_country: string | null
  onboarding_completed: boolean

  // --- Phase 5: Layer 2 (통합신청서 자동완성) ---
  // "한 번 입력, 영원히 재사용" — 비자 프로필 온보딩에서 수집
  foreign_reg_no: string | null       // ARC 외국인등록번호
  date_of_birth: string | null        // 생년월일 (DATE)
  sex: 'M' | 'F' | null              // 성별
  passport_no: string | null          // 여권번호
  passport_issue_date: string | null  // 여권 발급일
  passport_expiry_date: string | null // 여권 유효기간
  address_korea: string | null        // 대한민국 내 주소
  address_home: string | null         // 본국 주소
  home_phone: string | null           // 본국 전화번호
  current_workplace: string | null    // 현 근무처
  current_biz_reg_no: string | null   // 사업자등록번호
  current_workplace_phone: string | null // 근무처 전화번호
  annual_income: number | null        // 연소득 (만원 단위)
  occupation: string | null           // 직업
  email: string | null                // 전자우편
  bank_account: string | null         // 반환용 계좌번호
  event_consent: boolean | null        // PIPA Art.15 이벤트 수집 동의 (null=미확인)

  // --- 번역 원문 + 통화 ---
  address_home_original: string | null       // 본국주소 원문 (모국어)
  occupation_original: string | null         // 직업 원문 (모국어, 번역→occupation)
  current_workplace_original: string | null  // 직장명 원문 (비한국어, 번역→current_workplace)
  income_currency: 'KRW' | 'USD'            // 소득 통화
}

export interface VisaTracker {
  id: string
  user_id: string
  visa_type: string | null
  total_score: number
  income_score: number
  korean_score: number
  social_score: number
  age_score: number
  volunteer_score: number
  kiip_stage: number
  checklist: ChecklistItem[]
  updated_at: string
}

export interface ChecklistItem {
  id: number
  title: string
  subtitle: string
  completed: boolean
}

export interface DailyWorkLog {
  id: string
  user_id: string
  work_date: string
  clock_in: string | null
  clock_out: string | null
  is_holiday: boolean
  snapshot_minimum_wage: number | null // hourly_wage 컬럼 없음!
  created_at: string
}

export interface LifeEvent {
  id: string
  user_id: string
  event_type: string
  payload: Record<string, unknown>
  created_at: string
}

export interface ActionQueue {
  id: string
  user_id: string
  action_type: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  due_date: string | null
  payload: Record<string, unknown>
  created_at: string
}

export interface KiipSchedule {
  id: string
  stage: number
  location: string
  start_date: string
  end_date: string
  registration_deadline: string
  capacity: number
  is_active: boolean
}

export interface KiipAlert {
  id: string
  user_id: string
  target_stage: number
  alert_enabled: boolean
  created_at: string
}

export interface RemitLog {
  id: string
  user_id: string
  provider: string
  amount: number
  fee: number
  destination_country: string
  created_at: string
}

export interface AdminMatchRequest {
  id: string
  user_id: string
  service_type: string
  status: 'PENDING' | 'MATCHED' | 'COMPLETED' | 'CANCELLED'
  matched_admin_id: string | null
  fee_amount: number | null
  commission_amount: number | null
  created_at: string
}

export interface FaxSubmission {
  id: string
  user_id: string
  fax_type: string
  recipient_number: string
  status: 'PENDING' | 'SENDING' | 'SUCCESS' | 'FAILED'
  liability_accepted: boolean
  payload: Record<string, unknown>
  popbill_receipt_id: string | null
  created_at: string
}

export interface PaymentHistory {
  id: string
  user_id: string
  plan: string
  amount: number
  billing_cycle: string
  toss_payment_key: string | null
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
  created_at: string
}

// ============================================
// Edge Function Response Types
// ============================================

export interface MonthlyWageResult {
  base_pay: number
  night_bonus_pay: number // night_pay 절대 아님!
  overtime_pay: number
  weekly_holiday_pay: number
  total_pay: number
  snapshot_min_wage: number
  target_month: string
}

// ============================================
// Component Prop Types (확정, 추측 금지)
// ============================================

export interface LiabilityActionSheetProps {
  isOpen: boolean // "open" 아님!
  onClose: () => void
  onConfirm: () => void
}

export interface MissingDocFallbackProps {
  affiliateUrl?: string // onClose 없음!
}

// ============================================
// Store Types
// ============================================

export type SubmitStatus = 'idle' | 'pending' | 'success' | 'error' // "sending" 없음