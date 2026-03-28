/**
 * AccordionCard.tsx — Phase 3-C (UX 리뉴얼)
 *
 * 범용 Accordion 카드 컴포넌트.
 * Visa 탭의 각 섹션을 접힘/펼침으로 래핑한다.
 *
 * 설계 원칙:
 * - 접힌 상태: 아이콘 + 제목 + 요약값 (1줄) → 56px
 * - 펼친 상태: children 전체 렌더링
 * - 한 번에 1개만 펼침 (부모가 제어)
 * - D-Day ≤ 30 자동 펼침은 부모(visa.tsx)에서 처리
 *
 * Dennis 규칙:
 * #26 비즈니스 로직 건드리지 않음
 * #32 컬러 하드코딩 금지 → 시맨틱 토큰
 */

import { ChevronDown, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AccordionCardProps {
  /** 고유 식별자 */
  id: string;
  /** 카드 제목 */
  title: string;
  /** 접힌 상태에서 보여줄 요약 (텍스트 or ReactNode) */
  summary?: ReactNode;
  /** 제목 옆 아이콘 */
  icon?: LucideIcon;
  /** 아이콘 색상 (시맨틱 토큰) */
  iconColor?: string;
  /** 펼침 여부 */
  isOpen: boolean;
  /** 토글 콜백 */
  onToggle: (id: string) => void;
  /** 펼쳤을 때 보여줄 내용 */
  children: ReactNode;
  /** 접힌 상태에서도 children을 DOM에 유지할지 (기본 false) */
  keepMounted?: boolean;
}

export function AccordionCard({
  id,
  title,
  summary,
  icon: Icon,
  iconColor = "var(--color-action-primary)",
  isOpen,
  onToggle,
  children,
  keepMounted = false,
}: AccordionCardProps) {
  return (
    <div
      className="rounded-3xl overflow-hidden transition-shadow duration-300"
      style={{
        backgroundColor: "var(--color-surface-primary)",
        boxShadow: isOpen
          ? "0 2px 8px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header — 항상 보임. 터치 타겟 44pt+ */}
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center gap-3 px-4 active:scale-[0.99] transition-transform"
        style={{ minHeight: 56 }}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
      >
        {/* 아이콘 */}
        {Icon && (
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 32,
              height: 32,
              backgroundColor: `color-mix(in srgb, ${iconColor} 12%, transparent)`,
            }}
          >
            <Icon size={18} style={{ color: iconColor }} strokeWidth={2} />
          </div>
        )}

        {/* 제목 */}
        <div className="flex-1 min-w-0 text-left">
          <span
            className="text-[15px] leading-[20px]"
            style={{
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {title}
          </span>
        </div>

        {/* 요약값 */}
        {summary && (
          <div className="flex-shrink-0 mr-1">
            {typeof summary === "string" ? (
              <span
                className="text-[13px] leading-[18px]"
                style={{
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                }}
              >
                {summary}
              </span>
            ) : (
              summary
            )}
          </div>
        )}

        {/* 쉐브론 */}
        <ChevronDown
          size={18}
          style={{
            color: "var(--color-text-tertiary)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 250ms cubic-bezier(0.32, 0.72, 0, 1)",
            flexShrink: 0,
          }}
        />
      </button>

      {/* Content */}
      <div
        id={`accordion-content-${id}`}
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isOpen ? "2000px" : "0px",
          opacity: isOpen ? 1 : 0,
          transition:
            "max-height 300ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease",
        }}
      >
        {(isOpen || keepMounted) && (
          <div className="px-4 pb-4">{children}</div>
        )}
      </div>
    </div>
  );
}