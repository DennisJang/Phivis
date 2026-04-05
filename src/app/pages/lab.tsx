// src/app/pages/lab.tsx
// ============================================
// Lab 위젯 페이지
// 규칙 #32: 시맨틱 토큰 · #34: i18n · #42: Progressive Disclosure
// ============================================

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, MessageSquarePlus, BarChart3, Layers, Send, Loader2 } from 'lucide-react';
import { useLabStore } from '../../stores/useLabStore';
import type { LabView, LabFeature } from '../../stores/useLabStore';

const CATEGORY_CONFIG: Record<string, { icon: string }> = {
  visa_admin:       { icon: '📋' },
  finance_money:    { icon: '💰' },
  housing:          { icon: '🏠' },
  health_medical:   { icon: '🏥' },
  work_employment:  { icon: '💼' },
  life_culture:     { icon: '🎭' },
  other:            { icon: '✨' },
};

const STATUS_COLORS: Record<string, string> = {
  green: 'var(--color-action-success)',
  amber: 'var(--color-action-warning)',
  red:   'var(--color-action-error)',
};

const TABS: { key: LabView; icon: typeof CheckCircle2 }[] = [
  { key: 'vote',     icon: CheckCircle2 },
  { key: 'suggest',  icon: MessageSquarePlus },
  { key: 'results',  icon: BarChart3 },
  { key: 'features', icon: Layers },
];

export default function LabPage() {
  const { t } = useTranslation('lab');
  const { view, setView, fetchCurrent, fetchFeatures } = useLabStore();

  useEffect(() => {
    fetchCurrent();
    fetchFeatures();
  }, [fetchCurrent, fetchFeatures]);

  return (
    <div
      className="min-h-screen px-[var(--space-md)] pt-[var(--space-xl)] pb-[var(--space-2xl)]"
      style={{ backgroundColor: 'var(--color-surface-page)' }}
    >
      {/* Header */}
      <motion.h1
        className="text-[24px] font-bold mb-[var(--space-xs)]"
        style={{ color: 'var(--color-text-primary)' }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {t('title')}
      </motion.h1>
      <motion.p
        className="text-[15px] mb-[var(--space-lg)]"
        style={{ color: 'var(--color-text-secondary)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {t('subtitle')}
      </motion.p>

      {/* Tabs */}
      <div
        className="flex gap-[var(--space-xs)] mb-[var(--space-lg)] p-[3px] rounded-[var(--radius-md)]"
        style={{ backgroundColor: 'var(--color-surface-secondary)' }}
      >
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className="flex-1 py-[10px] rounded-[var(--radius-sm)] text-[13px] font-medium flex items-center justify-center gap-[4px] transition-all"
            style={{
              backgroundColor: view === key ? 'var(--color-surface-primary)' : 'transparent',
              color: view === key ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              boxShadow: view === key ? 'var(--shadow-card-soft)' : 'none',
            }}
          >
            <Icon size={14} />
            {t(`tab.${key}`)}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'vote' && <VoteView key="vote" />}
        {view === 'suggest' && <SuggestView key="suggest" />}
        {view === 'results' && <ResultsView key="results" />}
        {view === 'features' && <FeaturesView key="features" />}
      </AnimatePresence>

      {/* Disclaimer */}
      <p
        className="text-[12px] text-center mt-[var(--space-xl)] px-[var(--space-md)]"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {t('disclaimer')}
      </p>
    </div>
  );
}

// ─── Vote View ───
function VoteView() {
  const { t } = useTranslation('lab');
  const {
    selectedCategories, toggleCategory, hasVoted, myVote,
    categoryCounts, totalVoters, submitVote, loading, period,
  } = useLabStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-[var(--space-md)]"
    >
      {/* Period + voter count */}
      <div className="flex justify-between items-center">
        <p className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {period}
        </p>
        <p className="text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
          {t('vote.totalVoters', { count: totalVoters })}
        </p>
      </div>

      {hasVoted && (
        <div
          className="rounded-[var(--radius-md)] p-[var(--space-md)] text-[14px]"
          style={{
            backgroundColor: 'var(--color-bg-success)',
            color: 'var(--color-text-success)',
          }}
        >
          {t('vote.alreadyVoted')}
        </div>
      )}

      <p className="text-[15px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {t('vote.question')}
      </p>

      {/* Category cards */}
      <div className="space-y-[var(--space-sm)]">
        {Object.keys(CATEGORY_CONFIG).map((cat) => {
          const selected = selectedCategories.includes(cat);
          const count = categoryCounts[cat] ?? 0;

          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between p-[var(--space-md)] rounded-[var(--radius-md)] transition-all"
              style={{
                backgroundColor: selected
                  ? 'var(--color-action-primary-subtle)'
                  : 'var(--color-surface-primary)',
                border: selected
                  ? '2px solid var(--color-action-primary)'
                  : '2px solid var(--color-border-default)',
              }}
            >
              <div className="flex items-center gap-[var(--space-sm)]">
                <span className="text-[20px]">{CATEGORY_CONFIG[cat].icon}</span>
                <span
                  className="text-[15px] font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {t(`category.${cat}`)}
                </span>
              </div>
              <span className="text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
                {count > 0 ? t('vote.votes', { count }) : ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selection count */}
      <p className="text-[13px] text-center" style={{ color: 'var(--color-text-tertiary)' }}>
        {t('vote.selected', { count: selectedCategories.length, max: 3 })}
      </p>

      {/* Submit */}
      <button
        onClick={submitVote}
        disabled={selectedCategories.length === 0 || loading}
        className="w-full py-[14px] rounded-[var(--radius-md)] text-[16px] font-semibold flex items-center justify-center gap-[var(--space-xs)] disabled:opacity-40"
        style={{
          backgroundColor: 'var(--color-action-primary)',
          color: 'var(--color-text-on-color)',
        }}
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : null}
        {hasVoted ? t('vote.updateVote') : t('vote.submit')}
      </button>
    </motion.div>
  );
}

// ─── Suggest View ───
function SuggestView() {
  const { t } = useTranslation('lab');
  const {
    suggestionText, setSuggestionText, submitSuggestion,
    submittingSuggestion, suggestionResult, error,
  } = useLabStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-[var(--space-md)]"
    >
      <p className="text-[15px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {t('suggest.question')}
      </p>
      <p className="text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
        {t('suggest.hint')}
      </p>

      <textarea
        value={suggestionText}
        onChange={(e) => setSuggestionText(e.target.value)}
        placeholder={t('suggest.placeholder')}
        maxLength={500}
        rows={4}
        className="w-full rounded-[var(--radius-md)] p-[var(--space-md)] text-[15px] resize-none outline-none"
        style={{
          backgroundColor: 'var(--color-surface-primary)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border-default)',
        }}
      />

      <div className="flex justify-between items-center">
        <p className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
          {suggestionText.length}/500
        </p>
      </div>

      {error && (
        <p className="text-[13px]" style={{ color: 'var(--color-action-error)' }}>
          {error === 'suggestion_limit_reached' ? t('suggest.limitReached') : error}
        </p>
      )}

      <button
        onClick={submitSuggestion}
        disabled={!suggestionText.trim() || submittingSuggestion}
        className="w-full py-[14px] rounded-[var(--radius-md)] text-[16px] font-semibold flex items-center justify-center gap-[var(--space-xs)] disabled:opacity-40"
        style={{
          backgroundColor: 'var(--color-action-primary)',
          color: 'var(--color-text-on-color)',
        }}
      >
        {submittingSuggestion ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        {t('suggest.submit')}
      </button>

      {/* AI result */}
      {suggestionResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[var(--radius-md)] p-[var(--space-md)] space-y-[var(--space-xs)]"
          style={{
            backgroundColor: 'var(--color-bg-success)',
          }}
        >
          <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-success)' }}>
            {t('suggest.success')}
          </p>
          {suggestionResult.category && (
            <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
              {t('suggest.classified')}: {CATEGORY_CONFIG[suggestionResult.category]?.icon ?? '📁'} {t(`category.${suggestionResult.category}`)}
            </p>
          )}
          {suggestionResult.translation && (
            <p className="text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
              {t('suggest.translated')}: {suggestionResult.translation}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Results View ───
function ResultsView() {
  const { t } = useTranslation('lab');
  const { categoryCounts, totalVoters, period } = useLabStore();

  const sorted = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);

  const maxCount = sorted[0]?.[1] ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-[var(--space-md)]"
    >
      <div className="flex justify-between items-center">
        <p className="text-[15px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {t('results.title', { period })}
        </p>
        <p className="text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
          {t('results.totalVoters', { count: totalVoters })}
        </p>
      </div>

      {sorted.length === 0 ? (
        <div
          className="rounded-[var(--radius-md)] p-[var(--space-2xl)] text-center"
          style={{ backgroundColor: 'var(--color-surface-primary)' }}
        >
          <p className="text-[14px]" style={{ color: 'var(--color-text-tertiary)' }}>
            {t('results.empty')}
          </p>
        </div>
      ) : (
        <div className="space-y-[var(--space-sm)]">
          {sorted.map(([cat, count], i) => (
            <div
              key={cat}
              className="rounded-[var(--radius-md)] p-[var(--space-md)]"
              style={{
                backgroundColor: 'var(--color-surface-primary)',
                boxShadow: 'var(--shadow-card-soft)',
              }}
            >
              <div className="flex items-center justify-between mb-[var(--space-xs)]">
                <div className="flex items-center gap-[var(--space-sm)]">
                  <span className="text-[14px] font-bold" style={{ color: 'var(--color-text-tertiary)' }}>
                    #{i + 1}
                  </span>
                  <span className="text-[18px]">{CATEGORY_CONFIG[cat]?.icon}</span>
                  <span className="text-[15px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {t(`category.${cat}`)}
                  </span>
                </div>
                <span className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {count}
                </span>
              </div>
              {/* Bar */}
              <div
                className="h-[6px] rounded-[var(--radius-sm)] overflow-hidden"
                style={{ backgroundColor: 'var(--color-surface-secondary)' }}
              >
                <motion.div
                  className="h-full rounded-[var(--radius-sm)]"
                  style={{ backgroundColor: 'var(--color-action-primary)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCount) * 100}%` }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Features View (Green/Amber/Red) ───
function FeaturesView() {
  const { t } = useTranslation('lab');
  const { features } = useLabStore();

  const sections: { key: string; color: string; items: LabFeature[] }[] = [
    { key: 'green', color: STATUS_COLORS.green, items: features.green },
    { key: 'amber', color: STATUS_COLORS.amber, items: features.amber },
    { key: 'red',   color: STATUS_COLORS.red,   items: features.red },
  ];

  const hasAny = sections.some((s) => s.items.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-[var(--space-lg)]"
    >
      {!hasAny && (
        <div
          className="rounded-[var(--radius-md)] p-[var(--space-2xl)] text-center"
          style={{ backgroundColor: 'var(--color-surface-primary)' }}
        >
          <p className="text-[14px]" style={{ color: 'var(--color-text-tertiary)' }}>
            {t('features.empty')}
          </p>
        </div>
      )}

      {sections.map(({ key, color, items }) =>
        items.length > 0 ? (
          <div key={key} className="space-y-[var(--space-sm)]">
            <div className="flex items-center gap-[var(--space-xs)]">
              <div className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: color }} />
              <p className="text-[14px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {t(`features.${key}Title`)}
              </p>
            </div>

            {items.map((f) => (
              <FeatureCard key={f.id} feature={f} statusColor={color} statusKey={key} />
            ))}
          </div>
        ) : null
      )}
    </motion.div>
  );
}

function FeatureCard({ feature, statusColor, statusKey }: { feature: LabFeature; statusColor: string; statusKey: string }) {
  const { t } = useTranslation('lab');

  return (
    <div
      className="rounded-[var(--radius-md)] p-[var(--space-md)]"
      style={{
        backgroundColor: 'var(--color-surface-primary)',
        boxShadow: 'var(--shadow-card-soft)',
        borderLeft: `3px solid ${statusColor}`,
      }}
    >
      <div className="flex items-center justify-between mb-[var(--space-xs)]">
        <p className="text-[15px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {t(`featureName.${feature.name_key}`, { defaultValue: feature.name_key })}
        </p>
        <span className="text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
          {feature.total_votes} {t('features.votes')}
        </span>
      </div>

      {statusKey === 'amber' && feature.legal_barrier && (
        <p className="text-[13px] mt-[var(--space-xs)]" style={{ color: 'var(--color-text-secondary)' }}>
          {feature.legal_barrier}
        </p>
      )}

      {statusKey === 'red' && feature.structural_note && (
        <p className="text-[13px] mt-[var(--space-xs)]" style={{ color: 'var(--color-text-secondary)' }}>
          {feature.structural_note}
        </p>
      )}
    </div>
  );
}