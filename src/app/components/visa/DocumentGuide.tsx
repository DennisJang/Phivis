/**
 * DocumentGuide.tsx — Phase 1 (AI 서류 가이드)
 *
 * Phase 0-A → Phase 1 변경사항:
 * - 비자타입 pill 배지 추가 (E-9 주황)
 * - 서류 상태 표시: ✅ 초록 체크 or "Needed" 주황 텍스트
 * - 서류 항목 UI 간소화 (번호 → 아이콘, 배경색 제거)
 * - Premium 전용 항목은 Free 유저에게 숨김 (별도 upsell 불필요 — Submit CTA에 Premium 배지)
 *
 * 비즈니스 로직 동결 (#26):
 * - VISA_DOCUMENTS 매핑 구조 100% 유지
 * - premiumOnly 필터링 로직 유지
 *
 * Dennis 규칙:
 * #26 비즈니스 로직 건드리지 않음
 * #32 컬러 하드코딩 금지
 * #34 i18n 전 페이지 적용
 */

import { useTranslation } from "react-i18next";
import { FileText, CheckCircle2 } from "lucide-react";

interface DocumentGuideProps {
  visaType: string | null;
  isPremium: boolean;
}

interface DocItem {
  titleKey: string;
  descKey: string;
  premiumOnly: boolean;
}

// --- 비자유형별 필요 서류 매핑 (정적, 결정론적) — 로직 동결 ---
const VISA_DOCUMENTS: Record<string, DocItem[]> = {
  "E-9": [
    { titleKey: "visa:guide_passport", descKey: "visa:guide_passport_desc", premiumOnly: false },
    { titleKey: "visa:guide_arc", descKey: "visa:guide_arc_desc", premiumOnly: false },
    { titleKey: "visa:guide_employment", descKey: "visa:guide_employment_desc", premiumOnly: false },
    { titleKey: "visa:guide_contract", descKey: "visa:guide_contract_desc", premiumOnly: false },
    { titleKey: "visa:guide_tax", descKey: "visa:guide_tax_desc", premiumOnly: false },
    { titleKey: "visa:guide_insurance", descKey: "visa:guide_insurance_desc", premiumOnly: true },
    { titleKey: "visa:guide_residence", descKey: "visa:guide_residence_desc", premiumOnly: true },
  ],
  "E-7-4": [
    { titleKey: "visa:guide_passport", descKey: "visa:guide_passport_desc", premiumOnly: false },
    { titleKey: "visa:guide_arc", descKey: "visa:guide_arc_desc", premiumOnly: false },
    { titleKey: "visa:guide_kpoint", descKey: "visa:guide_kpoint_desc", premiumOnly: false },
    { titleKey: "visa:guide_kiip_cert", descKey: "visa:guide_kiip_cert_desc", premiumOnly: false },
    { titleKey: "visa:guide_employment", descKey: "visa:guide_employment_desc", premiumOnly: false },
    { titleKey: "visa:guide_income_proof", descKey: "visa:guide_income_proof_desc", premiumOnly: true },
    { titleKey: "visa:guide_background", descKey: "visa:guide_background_desc", premiumOnly: true },
  ],
  "D-2": [
    { titleKey: "visa:guide_passport", descKey: "visa:guide_passport_desc", premiumOnly: false },
    { titleKey: "visa:guide_arc", descKey: "visa:guide_arc_desc", premiumOnly: false },
    { titleKey: "visa:guide_enrollment", descKey: "visa:guide_enrollment_desc", premiumOnly: false },
    { titleKey: "visa:guide_transcript", descKey: "visa:guide_transcript_desc", premiumOnly: false },
    { titleKey: "visa:guide_finance", descKey: "visa:guide_finance_desc", premiumOnly: true },
  ],
};

const DEFAULT_DOCUMENTS: DocItem[] = [
  { titleKey: "visa:guide_passport", descKey: "visa:guide_passport_desc", premiumOnly: false },
  { titleKey: "visa:guide_arc", descKey: "visa:guide_arc_desc", premiumOnly: false },
  { titleKey: "visa:guide_employment", descKey: "visa:guide_employment_desc", premiumOnly: false },
];

export function DocumentGuide({ visaType, isPremium }: DocumentGuideProps) {
  const { t } = useTranslation();

  // --- 비자유형 매칭 — 로직 동결 ---
  const matchedType = visaType
    ? Object.keys(VISA_DOCUMENTS).find((key) =>
        visaType.toUpperCase().startsWith(key)
      )
    : null;

  const allDocuments = matchedType
    ? VISA_DOCUMENTS[matchedType]
    : DEFAULT_DOCUMENTS;

  // Free 유저: premiumOnly 항목 숨김 (와이어프레임: 4종만 표시)
  const visibleDocuments = isPremium
    ? allDocuments
    : allDocuments.filter((d) => !d.premiumOnly);

  // 표시용 비자타입 라벨
  const displayVisaType = matchedType ?? visaType?.toUpperCase() ?? null;

  return (
    <div
      className="rounded-3xl p-5"
      style={{ backgroundColor: "var(--color-surface-primary)" }}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <FileText
            size={18}
            style={{ color: "var(--color-action-primary)" }}
            strokeWidth={1.5}
          />
          <h3
            className="text-[17px] leading-[22px]"
            style={{
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {t("visa:guide_title")}
          </h3>
        </div>
        <p
          className="mt-1 text-[13px] leading-[18px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {visaType
            ? t("visa:guide_subtitle_type", { type: visaType })
            : t("visa:guide_subtitle_default")}
        </p>
      </div>

      {/* Visa type badge */}
      {displayVisaType && (
        <div className="mb-4">
          <span
            className="inline-block rounded-lg px-2.5 py-1 text-[13px] leading-[18px]"
            style={{
              fontWeight: 600,
              backgroundColor:
                "color-mix(in srgb, var(--color-action-warning) 15%, transparent)",
              color: "var(--color-action-warning)",
            }}
          >
            {displayVisaType}
          </span>
        </div>
      )}

      {/* Document list */}
      <div
        className="divide-y"
        style={{
          borderColor: "var(--color-border-default)",
        }}
      >
        {visibleDocuments.map((doc, index) => {
          // 간단한 상태 시뮬레이션: 앞 절반 = 완료, 뒷 절반 = Needed
          // TODO: Phase 2에서 실제 체크리스트 데이터와 연결
          const isCompleted = index < Math.ceil(visibleDocuments.length / 2);

          return (
            <div
              key={index}
              className="flex items-center gap-3 py-3.5"
              style={{
                borderColor: "var(--color-border-default)",
              }}
            >
              {/* Document icon */}
              <FileText
                size={18}
                strokeWidth={1.5}
                style={{ color: "var(--color-text-tertiary)" }}
                className="flex-shrink-0"
              />

              {/* Document name */}
              <span
                className="flex-1 text-[15px] leading-[20px]"
                style={{
                  fontWeight: 400,
                  color: "var(--color-text-primary)",
                }}
              >
                {t(doc.titleKey)}
              </span>

              {/* Status */}
              {isCompleted ? (
                <CheckCircle2
                  size={20}
                  strokeWidth={2}
                  style={{ color: "var(--color-action-success)" }}
                  className="flex-shrink-0"
                />
              ) : (
                <span
                  className="text-[13px] leading-[18px] flex-shrink-0"
                  style={{
                    fontWeight: 500,
                    color: "var(--color-action-warning)",
                  }}
                >
                  {t("visa:guide_status_needed")}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p
        className="mt-3 text-[11px] leading-[13px]"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {t("common:disclaimer_ai")}
      </p>
    </div>
  );
}