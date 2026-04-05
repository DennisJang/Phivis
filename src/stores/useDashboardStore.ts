import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type {
  UserProfile,
  ChecklistItem,
} from '../types'

// ============================================
// Dashboard Store — Phase B 정리
//
// 레거시 제거:
//   visa_trackers, daily_work_logs, life_events 쿼리 삭제
//   (존재하지 않는 테이블 → 404 에러 원인)
//
// 유지:
//   user_profiles hydrate + updateProfileField + updateSpecOptimistic
// ============================================

interface DashboardState {
  userProfile: UserProfile | null
  loading: boolean
  error: string | null

  hydrate: (userId: string) => Promise<void>
  updateSpecOptimistic: (
    field: keyof Pick<UserProfile, 'full_name' | 'nationality' | 'visa_type' | 'visa_expiry' | 'phone' | 'language'>,
    value: string
  ) => Promise<void>
  updateProfileField: (updates: Partial<UserProfile>) => Promise<void>
  reset: () => void
}

const initialState = {
  userProfile: null as UserProfile | null,
  loading: false,
  error: null as string | null,
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  ...initialState,

  hydrate: async (userId: string) => {
    set({ loading: true, error: null })

    try {
      const profileRes = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (profileRes.error) {
        console.error('[Dashboard hydrate] error:', profileRes.error.message)
      }

      // 프로필 null이면 Auth 토큰 레이스 → 1회 재시도
      if (!profileRes.data) {
        await new Promise(resolve => setTimeout(resolve, 500))

        const retryProfile = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        set({
          userProfile: retryProfile.data ?? null,
          loading: false,
        })
        return
      }

      set({
        userProfile: profileRes.data ?? null,
        loading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard'
      set({ error: message, loading: false })
    }
  },

  updateSpecOptimistic: async (field, value) => {
    const { userProfile } = get()
    if (!userProfile) return

    const prev = userProfile[field]
    set({ userProfile: { ...userProfile, [field]: value } })

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('user_id', userProfile.user_id)
      if (error) throw error
    } catch (err) {
      set({
        userProfile: { ...get().userProfile!, [field]: prev },
        error: err instanceof Error ? err.message : 'Failed to update profile',
      })
    }
  },

  updateProfileField: async (updates: Partial<UserProfile>) => {
    const { userProfile } = get()
    if (!userProfile) return

    const prevProfile = { ...userProfile }
    set({ userProfile: { ...userProfile, ...updates, updated_at: new Date().toISOString() } })

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userProfile.user_id)
      if (error) throw error
    } catch (err) {
      set({
        userProfile: prevProfile,
        error: err instanceof Error ? err.message : 'Failed to update profile',
      })
    }
  },

  reset: () => set(initialState),
}))