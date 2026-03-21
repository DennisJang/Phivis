import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './useAuthStore'
import { useDashboardStore } from './useDashboardStore'
import type { FaxSubmission, SubmitStatus } from '../types'

// ============================================
// Submit Store — Phase 4 팩스/서류 제출 관리
//
// 핵심 규칙:
//   - submitFax(): 인자 없음 (규칙 #3)
//   - Status: 'idle' | 'pending' | 'success' | 'error' ("sending" 없음)
//   - liability_accepted 필수 체크 (면책 헌법)
//   - send-immigration-fax Edge Function 호출
// ============================================

interface SubmitState {
  // --- 팩스 관련 ---
  faxStatus: SubmitStatus
  faxError: string | null
  currentFax: FaxSubmission | null
  faxHistory: FaxSubmission[]

  // --- 서류 제출 준비 데이터 (컴포넌트에서 set) ---
  pendingFaxType: string | null
  pendingRecipientNumber: string | null
  pendingPayload: Record<string, unknown> | null
  liabilityAccepted: boolean

  // --- actions ---
  // 팩스 데이터 세팅 (visa.tsx, housing.tsx 등에서 호출)
  prepareFax: (params: {
    faxType: string
    recipientNumber: string
    payload: Record<string, unknown>
  }) => void

  // 면책 동의 토글
  setLiabilityAccepted: (accepted: boolean) => void

  // 팩스 발송 — 인자 없음! (규칙 #3)
  // 내부적으로 pendingFax* + liabilityAccepted 사용
  submitFax: () => Promise<void>

  // 팩스 결과 처리
  resolveFax: (receiptId: string) => void
  rejectFax: (errorMessage: string) => void

  // 팩스 이력 조회
  fetchFaxHistory: () => Promise<void>

  // 초기화
  reset: () => void
}

const initialState = {
  faxStatus: 'idle' as SubmitStatus,
  faxError: null,
  currentFax: null,
  faxHistory: [],
  pendingFaxType: null,
  pendingRecipientNumber: null,
  pendingPayload: null,
  liabilityAccepted: false,
}

export const useSubmitStore = create<SubmitState>((set, get) => ({
  ...initialState,

  // ============================================
  // prepareFax — 발송 전 데이터 세팅
  // 컴포넌트에서 LiabilityActionSheet 열기 전에 호출
  // ============================================
  prepareFax: ({ faxType, recipientNumber, payload }) => {
    set({
      pendingFaxType: faxType,
      pendingRecipientNumber: recipientNumber,
      pendingPayload: payload,
      liabilityAccepted: false, // 매번 초기화 (면책 재확인 강제)
      faxStatus: 'idle',
      faxError: null,
    })
  },

  // ============================================
  // setLiabilityAccepted — 면책 체크박스 토글
  // ============================================
  setLiabilityAccepted: (accepted) => {
    set({ liabilityAccepted: accepted })
  },

  // ============================================
  // submitFax — 인자 없음! (규칙 #3)
  //
  // 플로우:
  // 1. liabilityAccepted 확인 (면책 헌법)
  // 2. fax_submissions 레코드 INSERT
  // 3. send-immigration-fax Edge Function 호출
  // 4. 결과에 따라 resolve/reject
  //
  // Edge Function이 Popbill API를 호출하므로
  // POPBILL_API_KEY 미등록 시 여기서 에러 발생함
  // ============================================
  submitFax: async () => {
    const {
      pendingFaxType,
      pendingRecipientNumber,
      pendingPayload,
      liabilityAccepted,
    } = get()

    // --- 사전 검증 ---
    if (!liabilityAccepted) {
      set({
        faxStatus: 'error',
        faxError: '면책 동의가 필요합니다. 자동완성 도구이며, 제출 책임은 본인에게 있습니다.',
      })
      return
    }

    const user = useAuthStore.getState().user
    if (!user) {
      set({ faxStatus: 'error', faxError: '로그인이 필요합니다.' })
      return
    }

    if (!pendingFaxType || !pendingRecipientNumber) {
      set({ faxStatus: 'error', faxError: '팩스 정보가 불완전합니다.' })
      return
    }

    set({ faxStatus: 'pending', faxError: null })

    try {
      // 1) fax_submissions 레코드 생성
      const { data: faxRecord, error: insertError } = await supabase
        .from('fax_submissions')
        .insert({
          user_id: user.id,
          fax_type: pendingFaxType,
          recipient_number: pendingRecipientNumber,
          status: 'PENDING',
          liability_accepted: true,
          payload: pendingPayload ?? {},
        })
        .select()
        .single()

      if (insertError) {
        // 규칙 #16: 에러 {} 빈 객체 감지
        throw new Error(insertError?.message ?? 'Failed to create fax record')
      }

      set({ currentFax: faxRecord })

      // 2) send-immigration-fax Edge Function 호출
      const { data: edgeResult, error: edgeError } = await supabase.functions.invoke(
        'send-immigration-fax',
        {
          body: {
            fax_submission_id: faxRecord.id,
            fax_type: pendingFaxType,
            recipient_number: pendingRecipientNumber,
            payload: pendingPayload ?? {},
          },
        }
      )

      if (edgeError) {
        throw new Error(edgeError?.message ?? 'Edge Function error')
      }

      // 3) 성공 처리
      const receiptId = edgeResult?.popbill_receipt_id ?? null

      // fax_submissions 상태 업데이트
      await supabase
        .from('fax_submissions')
        .update({
          status: 'SUCCESS',
          popbill_receipt_id: receiptId,
        })
        .eq('id', faxRecord.id)

      set({
        faxStatus: 'success',
        currentFax: { ...faxRecord, status: 'SUCCESS', popbill_receipt_id: receiptId },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fax submission failed'

      // fax_submissions 실패 상태 업데이트
      const { currentFax } = get()
      if (currentFax) {
        await supabase
          .from('fax_submissions')
          .update({ status: 'FAILED' })
          .eq('id', currentFax.id)
      }

      set({
        faxStatus: 'error',
        faxError: message,
      })
    }
  },

  // ============================================
  // resolveFax — 외부에서 성공 처리 (webhook 등)
  // ============================================
  resolveFax: (receiptId) => {
    const { currentFax } = get()
    set({
      faxStatus: 'success',
      currentFax: currentFax
        ? { ...currentFax, status: 'SUCCESS', popbill_receipt_id: receiptId }
        : null,
    })
  },

  // ============================================
  // rejectFax — 외부에서 실패 처리
  // ============================================
  rejectFax: (errorMessage) => {
    set({
      faxStatus: 'error',
      faxError: errorMessage,
    })
  },

  // ============================================
  // fetchFaxHistory — 발송 이력 조회
  // ============================================
  fetchFaxHistory: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('fax_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('[SubmitStore] fetchFaxHistory error:', error?.message)
        return
      }

      set({ faxHistory: data ?? [] })
    } catch (err) {
      console.error('[SubmitStore] fetchFaxHistory:', err)
    }
  },

  // ============================================
  // reset — signOut 시 호출
  // ============================================
  reset: () => set(initialState),
}))