/**
 * AuthGuardLayout.tsx — Phase 2-B FINAL
 *
 * Google OAuth 재로그인 시 온보딩 재진입 문제 해결.
 *
 * 전략:
 * 1. Auth 세션이 HTTP 클라이언트에 전파될 때까지 대기 (supabase.auth.getSession)
 * 2. hydrate를 await로 완료까지 대기
 * 3. hydrate 완료 후 useDashboardStore.getState()로 직접 읽기 (React 렌더 불필요)
 * 4. 프로필 유무 + onboarding_completed로 판단
 *
 * Dennis 규칙 #26: 비즈니스 로직 건드리지 않음
 * Dennis 규칙 #32: 컬러 하드코딩 금지
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

  useEffect(() => {
    if (!initialized || !isAuthenticated || !user?.id) return

    // 온보딩 페이지 자체에서는 바로 ready
    if (location.pathname === '/onboarding') {
      setReady(true)
      return
    }

    // 이미 프로필이 로드된 상태 (페이지 내 이동 등)
    if (userProfile) {
      if (!userProfile.onboarding_completed) {
        navigate('/onboarding', { replace: true })
      } else {
        setReady(true)
      }
      return
    }

    // hydrate가 진행 중이면 기다림
    if (loading) return

    // hydrate 호출 (1회만)
    if (!hydrateCalledRef.current) {
      hydrateCalledRef.current = true

      const doHydrate = async () => {
        // Auth 세션이 HTTP 클라이언트에 전파될 때까지 대기
        let attempts = 0
        while (attempts < 5) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) break
          attempts++
          await new Promise(r => setTimeout(r, 300))
        }

        // hydrate 완료까지 대기
        const { hydrate } = useDashboardStore.getState()
        await hydrate(user.id)

        // Zustand store에서 직접 읽기 (React 리렌더 불필요)
        const { userProfile: profile } = useDashboardStore.getState()

        if (!profile) {
          navigate('/onboarding', { replace: true })
        } else if (!profile.onboarding_completed) {
          navigate('/onboarding', { replace: true })
        } else {
          setReady(true)
        }
      }

      doHydrate()
    } else {
      // hydrate 완료 후에도 프로필 없음 → 신규 유저
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