import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { PaymentHistory } from '../types'

// ============================================
// Payment Store — Phase 3 구독 결제 관리
// Toss billingAuth → Edge Function → DB 갱신
// ============================================

interface PaymentState {
  // --- data ---
  currentPlan: 'free' | 'basic' | 'premium'
  billingCycle: 'monthly' | 'yearly' | null
  paymentHistory: PaymentHistory[]

  // --- UI state ---
  loading: boolean
  error: string | null

  // --- actions ---
  activateSubscription: (params: {
    authKey: string
    customerKey: string
    plan: 'basic' | 'premium'
    billingCycle: 'monthly' | 'yearly'
  }) => Promise<void>
  resetSubscription: () => void
  fetchPaymentHistory: (userId: string) => Promise<void>
}

const initialState = {
  currentPlan: 'free' as const,
  billingCycle: null as 'monthly' | 'yearly' | null,
  paymentHistory: [],
  loading: false,
  error: null,
}

export const usePaymentStore = create<PaymentState>((set, _get) => ({
  ...initialState,

  // ============================================
  // activateSubscription
  // paywall/success 페이지에서 호출
  // authKey + customerKey → Edge Function → 빌링키 발급 + DB 기록
  // ============================================
  activateSubscription: async ({ authKey, customerKey, plan, billingCycle }) => {
    set({ loading: true, error: null })

    try {
      // Edge Function: toss-subscribe-init
      // service_role 사용 (규칙 #12: Edge Function 401 방지)
      const { data, error } = await supabase.functions.invoke('toss-subscribe-init', {
        body: {
          authKey,
          customerKey,
          plan,
          billingCycle,
        },
      })

      if (error) {
        throw new Error(error.message ?? 'Subscription activation failed')
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      set({
        currentPlan: plan,
        billingCycle,
        loading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate subscription'
      set({ error: message, loading: false })
      throw err // re-throw → PaywallSuccess 컴포넌트에서 에러 UI 표시
    }
  },

  // ============================================
  // fetchPaymentHistory — 결제 이력 조회
  // ============================================
  fetchPaymentHistory: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      set({ paymentHistory: data ?? [] })
    } catch (err) {
      console.error('[PaymentStore] fetchPaymentHistory error:', err)
    }
  },

  // ============================================
  // resetSubscription — signOut 시 호출
  // ============================================
  resetSubscription: () => set(initialState),
}))