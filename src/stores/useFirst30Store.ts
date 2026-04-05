// src/stores/useFirst30Store.ts
// ============================================
// First 30 Days 위젯 상태 관리
// Phase A 패턴 + 연동 4 (step 완료 → score-deadlines complete)
// ============================================

import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ─── Types ───

export interface First30Step {
  id: string;
  layer: string;
  step_code: string;
  sort_order: number;
  title_key: string;
  description_key: string;
  caution_key: string | null;
  emotion_message_key: string | null;
  is_waiting_step: boolean;
  estimated_days: number | null;
  target_widget: string | null;
  responsible: string;
  documents: string[] | null;
  recommended_bank: string | null;
  recommended_phone_plan: string | null;
  notes: string | null;
  status: string;
  completed_at: string | null;
  locked: boolean;
}

export interface First30Layer {
  layer: string;
  steps: First30Step[];
}

interface First30Store {
  loading: boolean;
  error: string | null;
  layers: First30Layer[];
  visaType: string;
  expandedStep: string | null;

  fetchFlow: () => Promise<void>;
  updateProgress: (stepCode: string, status: string) => Promise<void>;
  setExpandedStep: (code: string | null) => void;
}

// ─── EF 호출 헬퍼 ───

async function callFirst30EF(action: string, extra: Record<string, unknown> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/first30-guide`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, ...extra }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function callScoreDeadlines(action: string, extra: Record<string, unknown> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/score-deadlines`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...extra }),
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null; // 연동 실패해도 First30 기능은 계속 작동
  }
}

// step 완료 시 관련 마감일 자동 complete 매핑
const STEP_TO_DEADLINE_MAP: Record<string, string[]> = {
  'address_registration': ['전입신고', 'Address Registration'],
  'health_insurance': ['건강보험 납부', 'Health Insurance Payment'],
  'arc_application': ['외국인등록증 신청', 'ARC Application'],
};

// ─── Store ───

export const useFirst30Store = create<First30Store>((set) => ({
  loading: false,
  error: null,
  layers: [],
  visaType: '',
  expandedStep: null,

  fetchFlow: async () => {
    set({ loading: true, error: null });
    try {
      const data = await callFirst30EF('get_flow');
      set({ layers: data.flow, visaType: data.visa_type, loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  updateProgress: async (stepCode, status) => {
    try {
      await callFirst30EF('update_progress', { step_code: stepCode, status });

      // 로컬 업데이트
      set((s) => ({
        layers: s.layers.map(layer => ({
          ...layer,
          steps: layer.steps.map(step =>
            step.step_code === stepCode
              ? { ...step, status, completed_at: status === 'completed' ? new Date().toISOString() : null }
              : step
          ),
        })),
      }));

      // 연동 4: step 완료 시 관련 마감일 자동 complete
      if (status === 'completed' && STEP_TO_DEADLINE_MAP[stepCode]) {
        const titleKeys = STEP_TO_DEADLINE_MAP[stepCode];
        const result = await callScoreDeadlines('get_all');
        if (result?.deadlines) {
          for (const deadline of result.deadlines) {
            if (!deadline.completed && titleKeys.includes(deadline.title_key)) {
              await callScoreDeadlines('complete', { deadline_id: deadline.id });
            }
          }
        }
      }
    } catch (err) {
      console.error('[useFirst30Store] updateProgress error:', err);
    }
  },

  setExpandedStep: (code) => set({ expandedStep: code }),
}));