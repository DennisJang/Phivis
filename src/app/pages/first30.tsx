// src/app/pages/first30.tsx

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Lock, Clock, ChevronDown, ChevronUp, AlertTriangle, Phone } from 'lucide-react';
import { useFirst30Store } from '../../stores/useFirst30Store';
import type { First30Step } from '../../stores/useFirst30Store';

const LAYER_CONFIG: Record<string, { icon: string }> = {
  land:     { icon: '🛬' },
  identity: { icon: '🪪' },
  connect:  { icon: '🔗' },
  protect:  { icon: '🛡️' },
  settle:   { icon: '🌱' },
};

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  in_progress: Clock,
  waiting: Clock,
  not_started: Circle,
  skipped: Circle,
};

export default function First30Page() {
  const { t } = useTranslation('first30');
  const { fetchFlow, layers, loading } = useFirst30Store();

  useEffect(() => { fetchFlow(); }, [fetchFlow]);

  return (
    <div
      className="min-h-screen px-[var(--space-md)] pt-[var(--space-xl)] pb-[var(--space-2xl)]"
      style={{ backgroundColor: 'var(--color-surface-page)' }}
    >
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

      {loading ? (
        <div className="text-center py-[var(--space-2xl)]">
          <p style={{ color: 'var(--color-text-tertiary)' }}>{t('loading')}</p>
        </div>
      ) : (
        <div className="space-y-[var(--space-md)]">
          {layers.map((layer, i) => (
            <LayerCard key={layer.layer} layer={layer.layer} steps={layer.steps} index={i} />
          ))}
        </div>
      )}

      {/* Emergency button */}
      <EmergencyButton />

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

function LayerCard({ layer, steps, index }: { layer: string; steps: First30Step[]; index: number }) {
  const { t } = useTranslation('first30');
  const config = LAYER_CONFIG[layer] ?? { icon: '📋' };

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const totalCount = steps.length;
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-[var(--radius-lg)] overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface-primary)',
        boxShadow: 'var(--shadow-card-soft)',
        opacity: allDone ? 0.7 : 1,
      }}
    >
      {/* Layer header */}
      <div className="p-[var(--space-md)] flex items-center justify-between">
        <div className="flex items-center gap-[var(--space-sm)]">
          <span className="text-[20px]">{config.icon}</span>
          <div>
            <p className="text-[16px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {t(`layer.${layer}.title`)}
            </p>
            <p className="text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
              {t(`layer.${layer}.subtitle`)}
            </p>
          </div>
        </div>
        <span className="text-[13px] font-medium" style={{ color: allDone ? 'var(--color-action-success)' : 'var(--color-text-tertiary)' }}>
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Steps */}
      <div className="px-[var(--space-md)] pb-[var(--space-md)] space-y-[var(--space-xs)]">
        {steps.map(step => (
          <StepRow key={step.step_code} step={step} />
        ))}
      </div>
    </motion.div>
  );
}

function StepRow({ step }: { step: First30Step }) {
  const { t } = useTranslation('first30');
  const { expandedStep, setExpandedStep, updateProgress } = useFirst30Store();
  const expanded = expandedStep === step.step_code;
  const Icon = STATUS_ICON[step.status] ?? Circle;

  const statusColor =
    step.status === 'completed' ? 'var(--color-action-success)' :
    step.status === 'in_progress' || step.status === 'waiting' ? 'var(--color-action-warning)' :
    'var(--color-icon-secondary)';

  return (
    <div
      className="rounded-[var(--radius-md)]"
      style={{
        backgroundColor: 'var(--color-surface-secondary)',
        opacity: step.locked ? 0.5 : 1,
      }}
    >
      <button
        className="w-full flex items-center gap-[var(--space-sm)] p-[var(--space-sm)] text-left"
        onClick={() => !step.locked && setExpandedStep(expanded ? null : step.step_code)}
        disabled={step.locked}
      >
        {step.locked ? (
          <Lock size={18} style={{ color: 'var(--color-icon-secondary)' }} />
        ) : (
          <Icon size={18} style={{ color: statusColor }} />
        )}
        <span className="flex-1 text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {t(step.title_key, { defaultValue: step.step_code })}
        </span>
        {step.is_waiting_step && step.status !== 'completed' && (
          <span className="text-[11px] px-[6px] py-[2px] rounded-[var(--radius-sm)]"
            style={{ backgroundColor: 'var(--color-bg-warning)', color: 'var(--color-text-warning)' }}>
            {t('waiting', { days: step.estimated_days })}
          </span>
        )}
        {!step.locked && (
          expanded
            ? <ChevronUp size={16} style={{ color: 'var(--color-icon-secondary)' }} />
            : <ChevronDown size={16} style={{ color: 'var(--color-icon-secondary)' }} />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-[var(--space-md)] pb-[var(--space-md)] space-y-[var(--space-sm)]">
              {/* Description */}
              <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                {t(step.description_key, { defaultValue: '' })}
              </p>

              {/* Emotion message */}
              {step.emotion_message_key && (
                <p className="text-[13px] italic" style={{ color: 'var(--color-text-tertiary)' }}>
                  {t(step.emotion_message_key, { defaultValue: '' })}
                </p>
              )}

              {/* Caution */}
              {step.caution_key && (
                <div className="flex items-start gap-[var(--space-xs)] text-[13px]"
                  style={{ color: 'var(--color-text-warning)' }}>
                  <AlertTriangle size={14} className="mt-[2px] shrink-0" />
                  <span>{t(step.caution_key, { defaultValue: '' })}</span>
                </div>
              )}

              {/* Documents */}
              {step.documents && step.documents.length > 0 && (
                <div>
                  <p className="text-[12px] font-medium mb-[var(--space-xs)]" style={{ color: 'var(--color-text-tertiary)' }}>
                    {t('documents')}
                  </p>
                  {step.documents.map((doc, i) => (
                    <p key={i} className="text-[13px] ml-[var(--space-sm)]" style={{ color: 'var(--color-text-secondary)' }}>
                      • {doc}
                    </p>
                  ))}
                </div>
              )}

              {/* Recommended bank/phone */}
              {step.recommended_bank && (
                <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {t('recommendedBank')}: {step.recommended_bank}
                </p>
              )}
              {step.recommended_phone_plan && (
                <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {t('recommendedPhone')}: {step.recommended_phone_plan}
                </p>
              )}

              {/* Notes */}
              {step.notes && (
                <p className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
                  {step.notes}
                </p>
              )}

              {/* Action buttons */}
              {step.status !== 'completed' && (
                <div className="flex gap-[var(--space-xs)] pt-[var(--space-xs)]">
                  <button
                    onClick={() => updateProgress(step.step_code, 'completed')}
                    className="flex-1 py-[10px] rounded-[var(--radius-sm)] text-[14px] font-medium"
                    style={{
                      backgroundColor: 'var(--color-action-primary)',
                      color: 'var(--color-text-on-color)',
                    }}
                  >
                    {t('markDone')}
                  </button>
                  {step.status === 'not_started' && (
                    <button
                      onClick={() => updateProgress(step.step_code, 'skipped')}
                      className="py-[10px] px-[var(--space-md)] rounded-[var(--radius-sm)] text-[14px]"
                      style={{
                        backgroundColor: 'var(--color-surface-primary)',
                        color: 'var(--color-text-tertiary)',
                      }}
                    >
                      {t('skip')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmergencyButton() {
  const { t } = useTranslation('first30');

  return (
    <a
      href="tel:119"
      className="fixed bottom-[var(--space-xl)] right-[var(--space-md)] w-[56px] h-[56px] rounded-full flex items-center justify-center shadow-lg"
      style={{
        backgroundColor: 'var(--color-action-error)',
        color: 'var(--color-text-on-color)',
      }}
      title={t('emergency')}
    >
      <Phone size={24} />
    </a>
  );
}