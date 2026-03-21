import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type {
  UserProfile,
  VisaTracker,
  DailyWorkLog,
  LifeEvent,
  ChecklistItem,
} from '../types'

// ============================================
// Dashboard Store — Phase 2 데이터 바인딩 허브
// Blueprint 확정 함수명: hydrate, saveWorkLog, updateSpecOptimistic
// Phase 5 추가: toggleChecklistItem
// ============================================

interface DashboardState {
  // --- data ---
  userProfile: UserProfile | null
  visaTracker: VisaTracker | null
  workLogs: DailyWorkLog[]
  lifeEvents: LifeEvent[]

  // --- UI state ---
  loading: boolean
  error: string | null

  // --- actions ---
  hydrate: (userId: string) => Promise<void>
  saveWorkLog: (log: Omit<DailyWorkLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateSpecOptimistic: (
    field: keyof Pick<UserProfile, 'full_name' | 'nationality' | 'visa_type' | 'visa_expiry' | 'phone' | 'language'>,
    value: string
  ) => Promise<void>
  toggleChecklistItem: (itemId: number) => Promise<void>
  updateProfileField: (updates: Partial<UserProfile>) => Promise<void>
  reset: () => void
}

const initialState = {
  userProfile: null,
  visaTracker: null,
  workLogs: [],
  lifeEvents: [],
  loading: false,
  error: null,
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  ...initialState,

  // ============================================
  // hydrate — 로그인 직후 1회 호출
  // 4개 테이블 병렬 fetch (RLS가 user_id 필터링)
  // ============================================
  hydrate: async (userId: string) => {
    set({ loading: true, error: null })

    try {
      // 당월 첫째날 계산 (workLogs 범위 제한)
      const now = new Date()
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

      const [profileRes, visaRes, logsRes, eventsRes] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),

        supabase
          .from('visa_trackers')
          .select('*')
          .eq('user_id', userId)
          .single(),

        supabase
          .from('daily_work_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('work_date', monthStart)
          .order('work_date', { ascending: false }),

        supabase
          .from('life_events')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      // 에러 감지: Supabase 에러 직렬화 실패 시 {} 빈 객체 (규칙 #16)
      const errors = [profileRes.error, visaRes.error, logsRes.error, eventsRes.error]
        .filter(Boolean)
        .map((e) => e?.message ?? 'Unknown error')

      if (errors.length > 0) {
        console.error('[Dashboard hydrate] errors:', errors)
      }

      set({
        userProfile: profileRes.data ?? null,
        visaTracker: visaRes.data ?? null,
        workLogs: logsRes.data ?? [],
        lifeEvents: eventsRes.data ?? [],
        loading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard'
      set({ error: message, loading: false })
    }
  },

  // ============================================
  // saveWorkLog — 출퇴근 기록 upsert
  // 규칙 #15: Supabase .upsert() Partial Index onConflict 사용 불가
  // → select 후 insert or update 패턴 사용
  // ============================================
  saveWorkLog: async (log) => {
    const { userProfile, workLogs } = get()
    if (!userProfile) return

    const userId = userProfile.user_id

    try {
      // 기존 레코드 확인
      const { data: existing } = await supabase
        .from('daily_work_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('work_date', log.work_date)
        .maybeSingle()

      let result

      if (existing) {
        // UPDATE
        result = await supabase
          .from('daily_work_logs')
          .update({
            clock_in: log.clock_in,
            clock_out: log.clock_out,
            is_holiday: log.is_holiday,
            snapshot_minimum_wage: log.snapshot_minimum_wage,
          })
          .eq('id', existing.id)
          .select()
          .single()
      } else {
        // INSERT
        result = await supabase
          .from('daily_work_logs')
          .insert({
            user_id: userId,
            work_date: log.work_date,
            clock_in: log.clock_in,
            clock_out: log.clock_out,
            is_holiday: log.is_holiday,
            snapshot_minimum_wage: log.snapshot_minimum_wage,
          })
          .select()
          .single()
      }

      if (result.error) {
        // 규칙 #14: PostgREST 409 = PG 23505 병행 감지
        const isPgConflict =
          result.error.code === '23505' ||
          result.error.message?.includes('duplicate') ||
          (result.error as { status?: number }).status === 409

        if (isPgConflict) {
          console.warn('[saveWorkLog] Conflict detected, refetching...')
        }
        throw new Error(result.error.message ?? 'Failed to save work log')
      }

      if (result.data) {
        // 낙관적 업데이트: 리스트에서 교체 or 추가
        const updated = existing
          ? workLogs.map((w) => (w.id === existing.id ? result.data! : w))
          : [result.data, ...workLogs]

        set({ workLogs: updated })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save work log'
      set({ error: message })
    }
  },

  // ============================================
  // updateSpecOptimistic — user_profiles 필드 업데이트
  // 규칙 #29: update_user_spec RPC는 user_profiles 타겟 (visa_trackers 아님)
  // 낙관적 업데이트 패턴: UI 즉시 반영 → 실패 시 롤백
  // ============================================
  updateSpecOptimistic: async (field, value) => {
    const { userProfile } = get()
    if (!userProfile) return

    // 이전 값 저장 (롤백용)
    const prev = userProfile[field]

    // 즉시 UI 반영
    set({
      userProfile: { ...userProfile, [field]: value },
    })

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('user_id', userProfile.user_id)

      if (error) throw error
    } catch (err) {
      // 롤백
      set({
        userProfile: { ...get().userProfile!, [field]: prev },
        error: err instanceof Error ? err.message : 'Failed to update profile',
      })
    }
  },

  // ============================================
  // toggleChecklistItem — Phase 5: 체크리스트 항목 토글
  // 낙관적 업데이트: UI 즉시 반영 → DB 저장 → 실패 시 롤백
  // visa_trackers.checklist (JSONB) 업데이트
  // ============================================
  toggleChecklistItem: async (itemId: number) => {
    const { visaTracker } = get()
    if (!visaTracker) return

    const prevChecklist = visaTracker.checklist

    // 낙관적 업데이트: 토글 즉시 반영
    const updatedChecklist = prevChecklist.map((item: ChecklistItem) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )

    set({
      visaTracker: { ...visaTracker, checklist: updatedChecklist },
    })

    try {
      const { error } = await supabase
        .from('visa_trackers')
        .update({
          checklist: updatedChecklist,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', visaTracker.user_id)

      if (error) throw error
    } catch (err) {
      // 롤백
      set({
        visaTracker: { ...get().visaTracker!, checklist: prevChecklist },
        error: err instanceof Error ? err.message : 'Failed to update checklist',
      })
    }
  },

  // ============================================
  // updateProfileField — Phase 5: Layer 2 필드 범용 업데이트
  // 낙관적 업데이트: UI 즉시 반영 → DB 저장 → 실패 시 롤백
  // user_profiles 대상 (규칙 #29)
  // 여러 필드를 한 번에 업데이트 가능 (Partial<UserProfile>)
  // ============================================
  updateProfileField: async (updates: Partial<UserProfile>) => {
    const { userProfile } = get()
    if (!userProfile) return

    // 이전 값 저장 (롤백용)
    const prevProfile = { ...userProfile }

    // 즉시 UI 반영
    set({
      userProfile: { ...userProfile, ...updates, updated_at: new Date().toISOString() },
    })

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userProfile.user_id)

      if (error) throw error
    } catch (err) {
      // 롤백
      set({
        userProfile: prevProfile,
        error: err instanceof Error ? err.message : 'Failed to update profile',
      })
    }
  },

  // ============================================
  // reset — signOut 시 호출 (규칙 #10)
  // ============================================
  reset: () => set(initialState),
}))