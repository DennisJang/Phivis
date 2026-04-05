// src/stores/useFirst30Store.ts

import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

export const useFirst30Store = create<First30Store>((set, get) => ({
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
    } catch (err) {
      console.error('[useFirst30Store] updateProgress error:', err);
    }
  },

  setExpandedStep: (code) => set({ expandedStep: code }),
}));