/**
 * AuthGuardLayout.tsx — Phase 2-B v6 (DEBUG)
 * 
 * 디버그 로그를 추가해서 정확히 어떤 경로로 실행되는지 추적.
 * 문제 해결 후 로그 제거 예정.
 */

import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useDashboardStore } from '../../stores/useDashboardStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { supabase } from '../../lib/supabase'
import Layout from './layout'

export function AuthGuardLayout() {
  const { isAuthenticated, initialized } = useRequireAuth()
  const user = useAuthStore((s) => s.user)
  const { userProfile, loading } = useDashboardStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [ready, setReady] = useState(false)
  const hydrateCalledRef = useRef(false)

  // ★ DEBUG: 모든 상태 변화를 로깅
  console.log('[AuthGuard] render:', {
    initialized,
    isAuthenticated,
    userId: user?.id?.slice(0, 8),
    userProfile: userProfile ? 'EXISTS' : 'NULL',
    onboardingCompleted: userProfile?.onboarding_completed,
    loading,
    ready,
    hydrateCalled: hydrateCalledRef.current,
    pathname: location.pathname,
  })

  useEffect(() => {
    console.log('[AuthGuard] Effect running:', {
      initialized,
      isAuthenticated,
      userId: user?.id?.slice(0, 8),
      hasProfile: !!userProfile,
      loading,
      hydrateCalled: hydrateCalledRef.current,
      pathname: location.pathname,
    })

    if (!initialized || !isAuthenticated || !user?.id) {
      console.log('[AuthGuard] ❌ Not ready — waiting for auth init')
      return
    }

    if (location.pathname === '/onboarding') {
      console.log('[AuthGuard] 📋 On onboarding page — setting ready')
      setReady(true)
      return
    }

    // 이미 프로필이 로드된 상태
    if (userProfile) {
      if (!userProfile.onboarding_completed) {
        console.log('[AuthGuard] ⚠️ Profile exists but onboarding NOT completed — redirecting')
        navigate('/onboarding', { replace: true })
      } else {
        console.log('[AuthGuard] ✅ Profile loaded, onboarding completed — ready!')
        setReady(true)
      }
      return
    }

    // hydrate가 진행 중이면 기다림
    if (loading) {
      console.log('[AuthGuard] ⏳ Loading in progress — waiting...')
      return
    }

    // hydrate 호출
    if (!hydrateCalledRef.current) {
      hydrateCalledRef.current = true
      console.log('[AuthGuard] 🚀 Starting safeHydrate...')

      const doHydrate = async () => {
        // Auth 세션 대기
        let attempts = 0
        while (attempts < 5) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            console.log(`[AuthGuard] 🔑 Session confirmed (attempt ${attempts})`)
            break
          }
          attempts++
          console.log(`[AuthGuard] ⏳ Session not ready (attempt ${attempts}/5)`)
          await new Promise(r => setTimeout(r, 300))
        }

        const { hydrate } = useDashboardStore.getState()
        await hydrate(user.id)

        const { userProfile: profile } = useDashboardStore.getState()
        console.log('[AuthGuard] 📦 After hydrate:', {
          profile: profile ? 'EXISTS' : 'NULL',
          onboardingCompleted: profile?.onboarding_completed,
          fullName: profile?.full_name,
        })

        if (!profile) {
          console.log('[AuthGuard] 🆕 No profile — new user → onboarding')
          navigate('/onboarding', { replace: true })
        } else if (!profile.onboarding_completed) {
          console.log('[AuthGuard] 📋 Onboarding not done → onboarding')
          navigate('/onboarding', { replace: true })
        } else {
          console.log('[AuthGuard] ✅ All good → setting ready')
          setReady(true)
        }
      }

      doHydrate()
    } else {
      // hydrate가 이미 호출됐고, loading도 false이고, userProfile도 null
      // → hydrate가 완료됐지만 프로필이 없음 (진짜 신규 유저)
      console.log('[AuthGuard] 🔄 Hydrate already called, still no profile → onboarding')
      navigate('/onboarding', { replace: true })
    }
  }, [initialized, isAuthenticated, user?.id, userProfile, loading, location.pathname, navigate])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-surface-secondary)" }}>
        <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--color-action-primary)", borderTopColor: "transparent" }} />
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!ready && location.pathname !== '/onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-surface-secondary)" }}>
        <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--color-action-primary)", borderTopColor: "transparent" }} />
      </div>
    )
  }

  return <Layout />
}