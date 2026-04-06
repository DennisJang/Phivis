import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// ============================================
// Payment Store v2 — 3층 요금 구조
// Business Model v2 (D-023) + subscriptions SSOT (D-020)
// ============================================
// Layer 1: 무료 (영구) — plan='free'
// Layer 2: Scan 크레딧 — plan='scan_pack' | 'scan_unlimited'
// Layer 3: 비자 시즌 패스 — plan='visa_season'
// ============================================

export type PlanType = 'free' | 'scan_pack' | 'scan_unlimited' | 'visa_season' | 'trial' | 'premium'
export type BillingType = 'none' | 'one_time' | 'recurring' | 'trial'
export type PurchaseType = 'scan_pack' | 'scan_unlimited' | 'visa_season'

interface Subscription {
  plan: PlanType
  billing_type: BillingType
  scan_credits: number
  started_at: string | null
  expires_at: string | null
  trial_expires_at: string | null
}

interface ScanUsage {
  free_used: number
  credit_used: number
}

interface PaymentState {
  // --- subscription ---
  subscription: Subscription
  scanUsage: ScanUsage

  // --- computed ---
  isTrialActive: boolean
  isPremium: boolean // trial OR visa_season OR scan_unlimited (전체 기능 접근)
  canScan: boolean // 스캔 가능 여부

  // --- UI state ---
  loading: boolean
  error: string | null

  // --- actions ---
  fetchSubscription: () => Promise<void>
  fetchScanUsage: () => Promise<void>

  purchaseScanPack: (paymentKey: string, orderId: string) => Promise<void>
  purchaseScanUnlimited: (authKey: string, customerKey: string) => Promise<void>
  purchaseVisaSeason: (paymentKey: string, orderId: string) => Promise<void>
  activateTrial: () => Promise<void>

  consumeScanCredit: () => Promise<boolean> // true = 성공, false = 크레딧 부족

  reset: () => void
}

const FREE_SCAN_LIMIT = 3 // 월 3회 무료

const initialSubscription: Subscription = {
  plan: 'free',
  billing_type: 'none',
  scan_credits: 0,
  started_at: null,
  expires_at: null,
  trial_expires_at: null,
}

const initialScanUsage: ScanUsage = {
  free_used: 0,
  credit_used: 0,
}

// EF 호출 헬퍼 (기존 패턴 유지)
async function callEF(action: string, payload: Record<string, unknown> = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/toss-subscribe-init`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action, ...payload }),
    }
  )
  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(data.error ?? 'Payment failed')
  }
  return data
}

function getCurrentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  subscription: { ...initialSubscription },
  scanUsage: { ...initialScanUsage },
  isTrialActive: false,
  isPremium: false,
  canScan: true,
  loading: false,
  error: null,

  // ============================================
  // fetchSubscription — subscriptions 테이블 조회 (SSOT)
  // ============================================
  fetchSubscription: async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, billing_type, scan_credits, started_at, expires_at, trial_expires_at')
        .maybeSingle()

      if (error) throw error

      if (!data) {
        // 구독 레코드 없음 = 무료
        set({
          subscription: { ...initialSubscription },
          isTrialActive: false,
          isPremium: false,
        })
        return
      }

      const sub = data as Subscription
      const trialActive = sub.trial_expires_at ? !isExpired(sub.trial_expires_at) : false
      const planActive = sub.expires_at ? !isExpired(sub.expires_at) : true // null = 만료 없음

      // trial 만료 → free로 다운그레이드 (프론트에서 표시만, DB는 그대로)
      const effectivePlan = (sub.plan === 'trial' && !trialActive) ? 'free' : sub.plan
      const expired = !planActive && sub.plan !== 'scan_pack' // scan_pack은 만료 없음

      const premium = trialActive ||
        (effectivePlan === 'visa_season' && planActive) ||
        (effectivePlan === 'scan_unlimited' && planActive)

      set({
        subscription: { ...sub, plan: expired ? 'free' : effectivePlan as PlanType },
        isTrialActive: trialActive,
        isPremium: premium,
      })
    } catch (err) {
      console.error('[PaymentStore] fetchSubscription error:', err)
    }
  },

  // ============================================
  // fetchScanUsage — 이번 달 스캔 사용량
  // ============================================
  fetchScanUsage: async () => {
    try {
      const yearMonth = getCurrentYearMonth()
      const { data, error } = await supabase
        .from('scan_usage')
        .select('free_used, credit_used')
        .eq('year_month', yearMonth)
        .maybeSingle()

      if (error) throw error

      const usage = data ?? { free_used: 0, credit_used: 0 }
      const { subscription, isTrialActive } = get()

      // canScan 계산
      const canScan = isTrialActive ||
        subscription.plan === 'scan_unlimited' ||
        usage.free_used < FREE_SCAN_LIMIT ||
        subscription.scan_credits > 0

      set({ scanUsage: usage, canScan })
    } catch (err) {
      console.error('[PaymentStore] fetchScanUsage error:', err)
    }
  },

  // ============================================
  // purchaseScanPack — Scan 5회팩 (일회성, ₩1,900)
  // paywall에서 Toss requestPayment 성공 후 호출
  // ============================================
  purchaseScanPack: async (paymentKey, orderId) => {
    set({ loading: true, error: null })
    try {
      await callEF('one_time', {
        plan: 'scan_pack',
        paymentKey,
        orderId,
        amount: 1900,
      })
      await get().fetchSubscription()
      set({ loading: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Purchase failed'
      set({ error: msg, loading: false })
      throw err
    }
  },

  // ============================================
  // purchaseScanUnlimited — Scan 월 무제한 (구독, ₩1,900/월)
  // paywall에서 Toss requestBillingAuth 성공 후 호출
  // ============================================
  purchaseScanUnlimited: async (authKey, customerKey) => {
    set({ loading: true, error: null })
    try {
      await callEF('billing', {
        plan: 'scan_unlimited',
        authKey,
        customerKey,
      })
      await get().fetchSubscription()
      set({ loading: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Subscription failed'
      set({ error: msg, loading: false })
      throw err
    }
  },

  // ============================================
  // purchaseVisaSeason — 비자 시즌 패스 (일회성, ₩4,900, 90일)
  // ============================================
  purchaseVisaSeason: async (paymentKey, orderId) => {
    set({ loading: true, error: null })
    try {
      await callEF('one_time', {
        plan: 'visa_season',
        paymentKey,
        orderId,
        amount: 4900,
      })
      await get().fetchSubscription()
      set({ loading: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Purchase failed'
      set({ error: msg, loading: false })
      throw err
    }
  },

  // ============================================
  // activateTrial — Reverse Trial (D-024)
  // 온보딩 완료 시 자동 호출
  // ============================================
  activateTrial: async () => {
    set({ loading: true, error: null })
    try {
      await callEF('activate_trial')
      await get().fetchSubscription()
      set({ loading: false })
    } catch (err) {
      // Trial 이미 사용 → 무시
      const msg = err instanceof Error ? err.message : ''
      if (!msg.includes('already used')) {
        set({ error: msg, loading: false })
      } else {
        set({ loading: false })
      }
    }
  },

  // ============================================
  // consumeScanCredit — 스캔 1회 소비
  // scan-analyze 호출 전에 실행
  // ============================================
  consumeScanCredit: async () => {
    const { subscription, scanUsage, isTrialActive } = get()

    // Trial 또는 무제한 구독 → 무조건 허용
    if (isTrialActive || subscription.plan === 'scan_unlimited') {
      return true
    }

    const yearMonth = getCurrentYearMonth()

    // 무료 잔여 있음?
    if (scanUsage.free_used < FREE_SCAN_LIMIT) {
      const { error } = await supabase
        .from('scan_usage')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          year_month: yearMonth,
          free_used: scanUsage.free_used + 1,
          credit_used: scanUsage.credit_used,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,year_month' })

      if (!error) {
        set({ scanUsage: { ...scanUsage, free_used: scanUsage.free_used + 1 } })
        return true
      }
    }

    // 크레딧 잔여 있음?
    if (subscription.scan_credits > 0) {
      // scan_usage 업데이트
      await supabase
        .from('scan_usage')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          year_month: yearMonth,
          free_used: scanUsage.free_used,
          credit_used: scanUsage.credit_used + 1,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,year_month' })

      // subscriptions에서 크레딧 차감
      const { error } = await supabase
        .from('subscriptions')
        .update({
          scan_credits: subscription.scan_credits - 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

      if (!error) {
        set({
          subscription: { ...subscription, scan_credits: subscription.scan_credits - 1 },
          scanUsage: { ...scanUsage, credit_used: scanUsage.credit_used + 1 },
        })
        return true
      }
    }

    // 잔여 없음 → paywall 유도 필요
    return false
  },

  reset: () => set({
    subscription: { ...initialSubscription },
    scanUsage: { ...initialScanUsage },
    isTrialActive: false,
    isPremium: false,
    canScan: true,
    loading: false,
    error: null,
  }),
}))