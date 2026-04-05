// src/stores/useLabStore.ts
// ============================================
// Lab 위젯 상태 관리
// 규칙 #34: i18n 키만 · #39: "대행" 금지
// ============================================

import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export type LabView = 'vote' | 'suggest' | 'results' | 'features';

export interface LabFeature {
  id: string;
  name_key: string;
  category: string;
  status: string;
  legal_barrier?: string | null;
  alternative_widget?: string | null;
  structural_note?: string | null;
  total_votes: number;
  months_in_top3: number;
  visa_breakdown?: Record<string, number> | null;
}

interface LabStore {
  // State
  view: LabView;
  loading: boolean;
  error: string | null;

  // Vote
  selectedCategories: string[];
  hasVoted: boolean;
  myVote: string[] | null;
  categoryCounts: Record<string, number>;
  totalVoters: number;
  period: string;

  // Suggest
  suggestionText: string;
  suggestionResult: { translation: string | null; category: string | null } | null;
  submittingSuggestion: boolean;

  // Features
  features: { green: LabFeature[]; amber: LabFeature[]; red: LabFeature[] };

  // Actions
  setView: (v: LabView) => void;
  toggleCategory: (cat: string) => void;
  setSuggestionText: (t: string) => void;
  fetchCurrent: () => Promise<void>;
  submitVote: () => Promise<void>;
  submitSuggestion: () => Promise<void>;
  fetchFeatures: () => Promise<void>;
  reset: () => void;
}

async function callLabEF(action: string, extra: Record<string, unknown> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/lab-process`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, ...extra }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

export const useLabStore = create<LabStore>((set, get) => ({
  view: 'vote',
  loading: false,
  error: null,

  selectedCategories: [],
  hasVoted: false,
  myVote: null,
  categoryCounts: {},
  totalVoters: 0,
  period: '',

  suggestionText: '',
  suggestionResult: null,
  submittingSuggestion: false,

  features: { green: [], amber: [], red: [] },

  setView: (v) => set({ view: v }),

  toggleCategory: (cat) => {
    const { selectedCategories } = get();
    if (selectedCategories.includes(cat)) {
      set({ selectedCategories: selectedCategories.filter((c) => c !== cat) });
    } else if (selectedCategories.length < 3) {
      set({ selectedCategories: [...selectedCategories, cat] });
    }
  },

  setSuggestionText: (t) => set({ suggestionText: t }),

  fetchCurrent: async () => {
    set({ loading: true, error: null });
    try {
      const data = await callLabEF('get_current');
      set({
        period: data.period,
        hasVoted: data.has_voted,
        myVote: data.my_vote,
        categoryCounts: data.category_counts,
        totalVoters: data.total_voters,
        selectedCategories: data.my_vote ?? [],
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  submitVote: async () => {
    const { selectedCategories } = get();
    if (selectedCategories.length === 0) return;

    set({ loading: true, error: null });
    try {
      await callLabEF('vote', { categories: selectedCategories });
      set({ hasVoted: true, myVote: selectedCategories, loading: false });
      // 카운트 새로고침
      get().fetchCurrent();
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  submitSuggestion: async () => {
    const { suggestionText } = get();
    if (!suggestionText.trim()) return;

    set({ submittingSuggestion: true, error: null, suggestionResult: null });
    try {
      const data = await callLabEF('suggest', { text: suggestionText });
      set({
        submittingSuggestion: false,
        suggestionResult: {
          translation: data.translation,
          category: data.category,
        },
        suggestionText: '',
      });
    } catch (err) {
      const msg = (err as Error).message;
      set({ submittingSuggestion: false, error: msg });
    }
  },

  fetchFeatures: async () => {
    set({ loading: true, error: null });
    try {
      const data = await callLabEF('get_features');
      set({ features: data.features, loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  reset: () => set({
    view: 'vote',
    selectedCategories: [],
    suggestionText: '',
    suggestionResult: null,
    error: null,
  }),
}));