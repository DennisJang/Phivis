/**
 * eventLog.ts — 이벤트 기록 유틸 (Phase 4 Layer 2)
 *
 * 역할: settle_events 테이블에 유저 행동 자동 기록
 * 원칙: fire-and-forget. 실패해도 UX 무영향. PII 미수집.
 *
 * Phase 4 수정 (PIPA 동의):
 *   - logEvent 호출 시 user_profiles.event_consent 체크
 *   - 동의 없으면 조용히 skip (앱 기능에 영향 없음)
 *   - 동의 상태는 메모리 캐시 (세션 당 1회 DB 조회)
 */

import { supabase } from "./supabase";

type EventType =
  | "intent_created"
  | "document_uploaded"
  | "readiness_changed"
  | "guide_viewed"
  | "intent_completed";

interface EventData {
  // intent_created
  visa_type?: string;
  civil_type?: string;
  // document_uploaded
  document_code?: string;
  file_size_kb?: number;
  compression_ratio?: number;
  // readiness_changed
  old_score?: number;
  new_score?: number;
  // guide_viewed
  office_id?: string;
  // intent_completed
  duration_days?: number;
  total_documents?: number;
}

// ─── Consent cache ───
// 세션 당 1회만 DB 조회. null = 미확인, true/false = 확인 완료.
let consentCache: boolean | null = null;

async function hasEventConsent(): Promise<boolean> {
  // 캐시 히트
  if (consentCache !== null) return consentCache;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from("user_profiles")
      .select("event_consent")
      .eq("user_id", user.id)
      .maybeSingle();

    consentCache = data?.event_consent === true;
    return consentCache;
  } catch {
    return false;
  }
}

/**
 * 동의 상태 갱신 시 캐시 무효화.
 * EventConsentSheet에서 동의/거부 후 호출.
 */
export function invalidateConsentCache(): void {
  consentCache = null;
}

/**
 * 동의 상태를 DB에 저장 + 캐시 갱신.
 */
export async function setEventConsent(consent: boolean): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("user_profiles")
      .update({ event_consent: consent })
      .eq("user_id", user.id);

    consentCache = consent;
  } catch (e) {
    console.warn("[EventLog] Failed to set consent:", e);
  }
}

/**
 * 이벤트 기록. 동의 없으면 조용히 skip.
 */
export async function logEvent(
  intentId: string | null,
  eventType: EventType,
  eventData: EventData = {}
): Promise<void> {
  try {
    // PIPA 동의 체크
    const consent = await hasEventConsent();
    if (!consent) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("settle_events").insert({
      user_id: user.id,
      intent_id: intentId,
      event_type: eventType,
      event_data: eventData,
    });
  } catch (e) {
    // 이벤트 기록 실패는 UX에 영향 주지 않음 — 조용히 실패
    console.warn("[EventLog] Failed to log event:", eventType, e);
  }
}