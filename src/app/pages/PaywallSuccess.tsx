import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { usePaymentStore } from "../../stores/usePaymentStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useDashboardStore } from "../../stores/useDashboardStore";

// ============================================
// PaywallSuccess — Toss redirect 후 처리
// URL params: authKey, customerKey, plan, cycle
// → Edge Function 호출 → 구독 활성화
// ============================================

type Status = 'processing' | 'success' | 'error'

export function PaywallSuccess() {
  // 규칙 #2: window.location.href 금지 → useNavigate()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const activateSubscription = usePaymentStore((s) => s.activateSubscription)
  const hydrate = useDashboardStore((s) => s.hydrate)

  const [status, setStatus] = useState<Status>('processing')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const authKey = searchParams.get('authKey')
    const customerKey = searchParams.get('customerKey')
    const plan = searchParams.get('plan') as 'basic' | 'premium' | null
    const cycle = searchParams.get('cycle') as 'monthly' | 'yearly' | null

    // Toss가 보내는 에러 파라미터 체크
    const errorCode = searchParams.get('code')
    const errorMsg = searchParams.get('message')

    if (errorCode || errorMsg) {
      setStatus('error')
      setErrorMessage(errorMsg ?? '결제 인증에 실패했습니다.')
      return
    }

    if (!authKey || !customerKey || !plan || !user) {
      setStatus('error')
      setErrorMessage('결제 정보가 올바르지 않습니다.')
      return
    }

    // Edge Function 호출
    const activate = async () => {
      try {
        await activateSubscription({
          authKey,
          customerKey,
          plan,
          billingCycle: cycle ?? 'monthly',
        })

        // 구독 활성화 후 dashboard 재로드 (subscription_plan 갱신 반영)
        await hydrate(user.id)

        setStatus('success')

        // 3초 후 홈으로 이동
        setTimeout(() => {
          navigate('/home', { replace: true })
        }, 3000)
      } catch (err) {
        setStatus('error')
        setErrorMessage(
          err instanceof Error ? err.message : '구독 활성화에 실패했습니다.'
        )
      }
    }

    activate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center space-y-6">
        {/* Processing */}
        {status === 'processing' && (
          <>
            <Loader2 size={48} className="text-[#007AFF] animate-spin mx-auto" />
            <h2 className="text-xl" style={{ fontWeight: 600 }}>
              구독을 활성화하고 있어요
            </h2>
            <p className="text-sm text-[#86868B]">
              잠시만 기다려주세요...
            </p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <CheckCircle2 size={48} className="text-[#34C759] mx-auto" />
            <h2 className="text-xl" style={{ fontWeight: 600 }}>
              Premium 활성화 완료!
            </h2>
            <p className="text-sm text-[#86868B]">
              잠시 후 홈으로 이동합니다.
            </p>
            <button
              onClick={() => navigate('/home', { replace: true })}
              className="w-full bg-[#007AFF] text-white rounded-2xl py-4 active:scale-96 transition-transform"
              style={{ fontWeight: 600 }}
            >
              홈으로 이동
            </button>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <XCircle size={48} className="text-[#FF3B30] mx-auto" />
            <h2 className="text-xl" style={{ fontWeight: 600 }}>
              구독 활성화 실패
            </h2>
            <p className="text-sm text-[#FF3B30]">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/paywall', { replace: true })}
                className="w-full bg-[#007AFF] text-white rounded-2xl py-4 active:scale-96 transition-transform"
                style={{ fontWeight: 600 }}
              >
                다시 시도
              </button>
              <button
                onClick={() => navigate('/home', { replace: true })}
                className="w-full bg-[#F5F5F7] text-[#1D1D1F] rounded-2xl py-4 active:scale-96 transition-transform"
                style={{ fontWeight: 600 }}
              >
                홈으로 이동
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}