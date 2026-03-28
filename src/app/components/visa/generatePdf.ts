/**
 * generatePdf.ts — Phase 3-B Sprint 2
 *
 * render-immigration-pdf Edge Function 호출 → PDF 반환
 * - Premium: base64 → Blob → 다운로드
 * - Free: base64 → 블러 미리보기 (1페이지만, Canvas 블러)
 *
 * 프로젝트 경로: src/app/components/visa/generatePdf.ts
 *
 * Dennis 규칙:
 * #9  pdf-lib: esm.sh/pdf-lib@1.17.1
 * #12 Edge Function 401 → service_role 클라이언트
 * #39 "서류 작성 대행" 표현 금지
 * #40 "유저가 자기 데이터를 자기 양식에 채우는 것"
 */

import { supabase } from "../../../lib/supabase";

// ─── Types ───

export interface PdfGenerateResult {
  success: boolean;
  pdfBase64?: string;
  fieldsFilled?: number;
  skippedKoreanFields?: number;
  skippedFieldNames?: string[];
  error?: string;
}

export interface PdfGenerateParams {
  userId: string;
  applicationType: string; // "stay_extension" | "status_change" | etc.
  additionalFields?: Record<string, string>;
}

// ─── Main function ───

/**
 * render-immigration-pdf Edge Function 호출
 */
export async function generateUnifiedPdf(
  params: PdfGenerateParams
): Promise<PdfGenerateResult> {
  const { userId, applicationType, additionalFields = {} } = params;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/render-immigration-pdf`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          form_type: "unified_application",
          user_id: userId,
          fields: {
            application_type: applicationType,
            ...additionalFields,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `Server error ${response.status}: ${errText}` };
    }

    const result = await response.json();

    if (!result.success || !result.pdf_base64) {
      return { success: false, error: result.error ?? "No PDF returned" };
    }

    return {
      success: true,
      pdfBase64: result.pdf_base64,
      fieldsFilled: result.fields_filled,
      skippedKoreanFields: result.skipped_korean_fields,
      skippedFieldNames: result.skipped_field_names,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * base64 PDF → Blob URL (다운로드용)
 */
export function pdfBase64ToBlob(base64: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: "application/pdf" });
}

/**
 * PDF 다운로드 트리거
 */
export function downloadPdf(base64: string, fileName: string): void {
  const blob = pdfBase64ToBlob(base64);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * PDF base64 → 블러 처리된 미리보기 이미지 (Canvas)
 * Free 유저용 — 전환 훅
 */
export async function generateBlurPreview(base64: string): Promise<string> {
  // PDF의 첫 페이지를 이미지로 변환하려면 pdf.js가 필요하지만
  // 번들 사이즈를 아끼기 위해, 단순한 placeholder를 반환
  // Phase 4에서 pdf.js lazy import로 업그레이드 가능
  //
  // 지금은 "PDF 생성 완료" 상태만 표시하고,
  // Premium 전환 유도 CTA를 보여주는 방식으로 처리
  return `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="210" height="297" viewBox="0 0 210 297">' +
      '<rect width="210" height="297" fill="#f5f5f7" rx="8"/>' +
      '<text x="105" y="140" text-anchor="middle" font-size="14" fill="#86868b" font-family="system-ui">PDF Preview</text>' +
      '<text x="105" y="165" text-anchor="middle" font-size="11" fill="#86868b" font-family="system-ui">Upgrade to download</text>' +
      "</svg>"
  )}`;
}