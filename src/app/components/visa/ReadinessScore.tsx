/**
 * ReadinessScore.tsx — Phase 3-C (Visa 기능 극한 구비)
 *
 * "제출 전 완성도 체크" — Game Changer 후보.
 * 검증(X) 체크리스트 대조(O). 법적 안전: G-029 LOW.
 *
 * 체크 항목:
 * 1. 필수 서류 업로드 여부 (document_requirements vs document_vault)
 * 2. 서류 유효기간 경과 여부 (document_vault.expires_at vs today)
 * 3. 프로필 자동완성 필드 채움 여부 (통합신청서용 4개 필드)
 * 4. 총 수수료 합산 (cost_krw)
 *
 * 비즈니스 로직:
 * - document_requirements: 공개 읽기 (#41)
 * - document_vault: 유저별 RLS
 * - 판단/검증 절대 금지 (#39) — "없다/만료됨" 사실만 표시
 *
 * Dennis 규칙:
 * #26 비즈니스 로직 건드리지 않음 (이 컴포넌트는 신규)
 * #32 컬러 하드코딩 금지 → 시맨틱 토큰
 * #34 i18n
 * #36 .maybeSingle()
 * #39 "검증" 표현 금지 → "체크리스트"
 */

import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  DollarSign,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

// --- Types ---
interface DocRequirement {
  id: string;
  document_code: string;
  document_name_ko: string;
  document_name_en: string;
  document_name_vi: string | null;
  document_name_zh: string | null;
  is_required: boolean;
  cost_krw: number;
  validity_days: number | null;
  processing_days: number | null;
  online_url: string | null;
  automation_grade: string;
}

interface VaultItem {
  id: string;
  document_code: string;
  file_name: string;
  uploaded_at: string;
  expires_at: string | null;
  status: string;
}

interface ReadinessScoreProps {
  visaType: string | null;
  civilType: string;
  userProfile: Record<string, unknown> | null;
  userId?: string;
}

// --- Profile fields for 통합신청서 ---
const PROFILE_FIELDS = [
  "full_name",
  "foreign_reg_no",
  "passport_no",
  "address_korea",
  "date_of_birth",
] as const;

// --- Localized document name ---
function getDocName(
  doc: DocRequirement,
  lang: string
): string {
  if (lang === "ko" && doc.document_name_ko) return doc.document_name_ko;
  if (lang === "vi" && doc.document_name_vi) return doc.document_name_vi;
  if (lang === "zh" && doc.document_name_zh) return doc.document_name_zh;
  return doc.document_name_en || doc.document_name_ko;
}

// --- Status enum ---
type DocStatus = "ready" | "expiring" | "expired" | "missing";

interface DocCheckResult {
  requirement: DocRequirement;
  status: DocStatus;
  detail: string; // e.g. "Uploaded Mar 15" or "Expires in 12 days"
  vaultItem: VaultItem | null;
}

export function ReadinessScore({
  visaType,
  civilType,
  userProfile,
  userId,
}: ReadinessScoreProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [requirements, setRequirements] = useState<DocRequirement[]>([]);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch data ---
  useEffect(() => {
    async function fetch() {
      if (!visaType) return;
      setLoading(true);

      const [reqRes, vaultRes] = await Promise.all([
        supabase
          .from("document_requirements")
          .select(
            "id, document_code, document_name_ko, document_name_en, document_name_vi, document_name_zh, is_required, cost_krw, validity_days, processing_days, online_url, automation_grade"
          )
          .or(`visa_type.eq.${visaType},visa_type.eq.ALL`)
          .eq("civil_type", civilType)
          .order("sort_order"),
        supabase
          .from("document_vault")
          .select(
            "id, document_code, file_name, uploaded_at, expires_at, status"
          )
          .eq("is_latest", true),
      ]);

      if (reqRes.data) setRequirements(reqRes.data as DocRequirement[]);
      if (vaultRes.data) setVaultItems(vaultRes.data as VaultItem[]);
      setLoading(false);
    }
    fetch();
  }, [visaType, civilType]);

  // --- Compute readiness ---
  const {
    docResults,
    profileFilled,
    profileTotal,
    totalScore,
    issueCount,
    totalCost,
  } = useMemo(() => {
    const today = new Date();
    const required = requirements.filter((r) => r.is_required);
    const vaultMap = new Map(vaultItems.map((v) => [v.document_code, v]));

    const results: DocCheckResult[] = required.map((req) => {
      // Skip auto-fill (통합신청서) and fee items
      const isAuto = req.document_code === "unified_application_form";
      const isFee = req.document_code.startsWith("application_fee");

      if (isFee) {
        return {
          requirement: req,
          status: "ready" as DocStatus,
          detail: `₩${req.cost_krw.toLocaleString()}`,
          vaultItem: null,
        };
      }

      if (isAuto) {
        const filled = userProfile
          ? PROFILE_FIELDS.filter((f) => {
              const v = userProfile[f];
              return v && String(v).trim().length > 0;
            }).length
          : 0;
        return {
          requirement: req,
          status: filled >= 4 ? ("ready" as DocStatus) : ("missing" as DocStatus),
          detail:
            filled >= 4
              ? t("visa:readiness.profile_complete", {
                  defaultValue: "Profile complete",
                })
              : t("visa:readiness.profile_incomplete", {
                  count: filled,
                  defaultValue: `Profile ${filled}/${PROFILE_FIELDS.length} fields`,
                }),
          vaultItem: null,
        };
      }

      const vault = vaultMap.get(req.document_code);
      if (!vault) {
        return {
          requirement: req,
          status: "missing" as DocStatus,
          detail: t("visa:readiness.not_uploaded", {
            defaultValue: "Not uploaded — required",
          }),
          vaultItem: null,
        };
      }

      // Check expiration
      if (vault.expires_at) {
        const expiry = new Date(vault.expires_at);
        const daysLeft = Math.ceil(
          (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysLeft < 0) {
          return {
            requirement: req,
            status: "expired" as DocStatus,
            detail: t("visa:readiness.expired", {
              defaultValue: "Expired — reissue needed",
            }),
            vaultItem: vault,
          };
        }
        if (daysLeft <= 30) {
          return {
            requirement: req,
            status: "expiring" as DocStatus,
            detail: t("visa:readiness.expiring", {
              days: daysLeft,
              defaultValue: `Expires in ${daysLeft} days`,
            }),
            vaultItem: vault,
          };
        }
      }

      // Check validity_days from requirement
      if (req.validity_days && vault.uploaded_at) {
        const uploadDate = new Date(vault.uploaded_at);
        const validUntil = new Date(
          uploadDate.getTime() + req.validity_days * 24 * 60 * 60 * 1000
        );
        const daysLeft = Math.ceil(
          (validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysLeft < 0) {
          return {
            requirement: req,
            status: "expired" as DocStatus,
            detail: t("visa:readiness.expired", {
              defaultValue: "Expired — reissue needed",
            }),
            vaultItem: vault,
          };
        }
        if (daysLeft <= 30) {
          return {
            requirement: req,
            status: "expiring" as DocStatus,
            detail: t("visa:readiness.expiring", {
              days: daysLeft,
              defaultValue: `Expires in ${daysLeft} days`,
            }),
            vaultItem: vault,
          };
        }
      }

      // Ready
      const uploadDate = new Date(vault.uploaded_at);
      const dateStr = uploadDate.toLocaleDateString(
        lang === "ko" ? "ko-KR" : "en-US",
        { month: "short", day: "numeric" }
      );
      return {
        requirement: req,
        status: "ready" as DocStatus,
        detail: t("visa:readiness.uploaded", {
          date: dateStr,
          defaultValue: `Uploaded ${dateStr}`,
        }),
        vaultItem: vault,
      };
    });

    // Profile check
    const pFilled = userProfile
      ? PROFILE_FIELDS.filter((f) => {
          const v = userProfile[f];
          return v && String(v).trim().length > 0;
        }).length
      : 0;

    // Score calculation
    const readyCount = results.filter((r) => r.status === "ready").length;
    const total = results.length;
    const docScore = total > 0 ? (readyCount / total) * 70 : 0; // 70% weight
    const profileScore = (pFilled / PROFILE_FIELDS.length) * 30; // 30% weight
    const score = Math.round(docScore + profileScore);

    const issues = results.filter(
      (r) => r.status === "missing" || r.status === "expired" || r.status === "expiring"
    ).length;

    const cost = required.reduce((sum, r) => sum + (r.cost_krw || 0), 0);

    return {
      docResults: results,
      profileFilled: pFilled,
      profileTotal: PROFILE_FIELDS.length,
      totalScore: score,
      issueCount: issues,
      totalCost: cost,
    };
  }, [requirements, vaultItems, userProfile, lang, t]);

  // --- Score color ---
  const scoreColor =
    totalScore >= 80
      ? "var(--color-action-success)"
      : totalScore >= 50
        ? "var(--color-action-primary)"
        : "var(--color-action-warning)";

  // --- Status icon ---
  function StatusIcon({ status }: { status: DocStatus }) {
    switch (status) {
      case "ready":
        return (
          <CheckCircle2
            size={18}
            style={{ color: "var(--color-action-success)" }}
          />
        );
      case "expiring":
        return (
          <AlertTriangle
            size={18}
            style={{ color: "var(--color-action-warning)" }}
          />
        );
      case "expired":
        return (
          <XCircle
            size={18}
            style={{ color: "var(--color-action-error)" }}
          />
        );
      case "missing":
        return (
          <XCircle
            size={18}
            style={{ color: "var(--color-action-error)" }}
          />
        );
    }
  }

  // --- Status row background ---
  function rowBg(status: DocStatus): string {
    switch (status) {
      case "expiring":
        return "rgba(255,149,0,0.06)";
      case "expired":
      case "missing":
        return "rgba(255,59,48,0.06)";
      default:
        return "transparent";
    }
  }

  // --- SVG ring ---
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference - (totalScore / 100) * ringCircumference;

  if (!visaType) return null;

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: "var(--color-text-secondary)" }}
        />
      </div>
    );
  }

  // --- Empty ---
  if (requirements.length === 0) {
    return (
      <p
        className="text-center py-6 text-[13px]"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {t("visa:readiness.no_data", {
          defaultValue: "No requirements found for this visa type.",
        })}
      </p>
    );
  }

  // --- Sorted: issues first ---
  const sortedResults = [...docResults].sort((a, b) => {
    const order: Record<DocStatus, number> = {
      expired: 0,
      missing: 1,
      expiring: 2,
      ready: 3,
    };
    return order[a.status] - order[b.status];
  });

  const readyCount = docResults.filter((r) => r.status === "ready").length;

  return (
    <div>
      {/* Score ring + progress bars */}
      <div className="flex items-center gap-4 mb-4">
        {/* Ring */}
        <div
          className="relative flex-shrink-0"
          style={{ width: 80, height: 80 }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r={ringRadius}
              fill="none"
              stroke="var(--color-surface-secondary)"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r={ringRadius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              transform="rotate(-90 40 40)"
              style={{ transition: "stroke-dashoffset 600ms ease" }}
            />
          </svg>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ pointerEvents: "none" }}
          >
            <span
              className="text-[22px] leading-none"
              style={{
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              {totalScore}
            </span>
            <span
              className="text-[10px]"
              style={{ color: "var(--color-text-secondary)", marginTop: 2 }}
            >
              / 100
            </span>
          </div>
        </div>

        {/* Progress bars */}
        <div className="flex-1">
          {/* Documents */}
          <div className="flex justify-between mb-1.5">
            <span
              className="text-[12px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("visa:readiness.documents", { defaultValue: "Documents" })}
            </span>
            <span
              className="text-[12px]"
              style={{
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {readyCount} / {docResults.length}
            </span>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden mb-3"
            style={{ backgroundColor: "var(--color-surface-secondary)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  docResults.length > 0
                    ? (readyCount / docResults.length) * 100
                    : 0
                }%`,
                backgroundColor:
                  readyCount === docResults.length
                    ? "var(--color-action-success)"
                    : "var(--color-action-primary)",
              }}
            />
          </div>

          {/* Profile */}
          <div className="flex justify-between mb-1.5">
            <span
              className="text-[12px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("visa:readiness.profile", { defaultValue: "Profile fields" })}
            </span>
            <span
              className="text-[12px]"
              style={{
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {profileFilled} / {profileTotal}
            </span>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--color-surface-secondary)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(profileFilled / profileTotal) * 100}%`,
                backgroundColor:
                  profileFilled >= profileTotal
                    ? "var(--color-action-success)"
                    : "var(--color-action-primary)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Issue banner */}
      {issueCount > 0 && (
        <div
          className="rounded-2xl px-3 py-2.5 flex items-center gap-2 mb-4"
          style={{ backgroundColor: "rgba(255,149,0,0.08)" }}
        >
          <AlertTriangle
            size={16}
            style={{ color: "var(--color-action-warning)" }}
          />
          <span
            className="text-[13px]"
            style={{
              fontWeight: 500,
              color: "var(--color-action-warning)",
            }}
          >
            {t("visa:readiness.issues", {
              count: issueCount,
              defaultValue: `${issueCount} issues may cause rejection`,
            })}
          </span>
        </div>
      )}

      {/* Document list */}
      <div className="flex flex-col gap-0.5">
        {sortedResults.map((result) => (
          <div
            key={result.requirement.id}
            className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl"
            style={{ backgroundColor: rowBg(result.status) }}
          >
            <StatusIcon status={result.status} />
            <div className="flex-1 min-w-0">
              <p
                className="text-[14px] leading-[18px] truncate"
                style={{
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                }}
              >
                {getDocName(result.requirement, lang)}
              </p>
              <p
                className="text-[11px] leading-[14px] mt-0.5"
                style={{
                  fontWeight: result.status === "ready" ? 400 : 500,
                  color:
                    result.status === "ready"
                      ? "var(--color-text-secondary)"
                      : result.status === "expiring"
                        ? "var(--color-action-warning)"
                        : "var(--color-action-error)",
                }}
              >
                {result.detail}
              </p>
            </div>
            {result.requirement.online_url && result.status !== "ready" && (
              <a
                href={result.requirement.online_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
                style={{ color: "var(--color-action-primary)" }}
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Cost + Processing time */}
      <div
        className="rounded-2xl p-3 mt-4"
        style={{ backgroundColor: "var(--color-surface-secondary)" }}
      >
        <div className="flex justify-between mb-1">
          <span
            className="text-[12px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <DollarSign
              size={12}
              style={{
                display: "inline",
                verticalAlign: "middle",
                marginRight: 4,
              }}
            />
            {t("visa:readiness.total_fees", {
              defaultValue: "Estimated total fees",
            })}
          </span>
          <span
            className="text-[14px]"
            style={{
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            ₩{totalCost.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span
            className="text-[12px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <Clock
              size={12}
              style={{
                display: "inline",
                verticalAlign: "middle",
                marginRight: 4,
              }}
            />
            {t("visa:readiness.processing", {
              defaultValue: "Processing time",
            })}
          </span>
          <span
            className="text-[14px]"
            style={{
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            14–21{" "}
            {t("visa:readiness.days", { defaultValue: "days" })}
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <p
        className="text-[11px] leading-[14px] mt-3 text-center"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {t("visa:readiness.disclaimer", {
          defaultValue:
            "This checklist is for reference only. Verify requirements with your immigration office.",
        })}
      </p>
    </div>
  );
}
