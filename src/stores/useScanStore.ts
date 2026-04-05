// src/stores/useScanStore.ts
// ============================================
// Scan 위젯 상태 머신 — Phase A 완성
//
// States: idle → validating → uploading → analyzing → result | error
// 신규: Supabase Storage 원본 저장 (병렬), status 필드, 실패 시 횟수 무효
// 규칙 #1: 원본 확인 — scan-analyze EF 스펙 기반
// 규칙 #34: i18n 키만 (하드코딩 텍스트 금지)
// 규칙 #39: "대행" 표현 금지
// ============================================

import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// ─── Types ───

export type ScanState =
  | 'idle'
  | 'validating'
  | 'uploading'
  | 'analyzing'
  | 'result'
  | 'error';

// 스캔 결과 상태: 횟수 카운트는 success만
export type ScanStatus = 'success' | 'failed' | 'error';

export interface ScanKeyNumber {
  label: string;
  value: string;
  emphasis?: boolean;
}

export interface ScanComparison {
  user_value: string;
  reference_value: string;
  reference_label?: string;
}

export interface ScanItem {
  name_ko: string;
  name_translated: string;
  amount: number | null;
  explanation: string;
  comparison: ScanComparison | null;
  linked_widget: string | null;
  action_text: string | null;
}

export interface ScanDeadline {
  title: string;
  date: string;
  consequence: string;
  urgency: 'info' | 'warning' | 'urgent';
}

export interface ScanResult {
  scan_id: string | null;
  category: string;
  category_confidence: number;
  status: ScanStatus;
  summary: {
    title: string;
    subtitle: string;
    key_numbers: ScanKeyNumber[];
  };
  items: ScanItem[];
  linked_widget: string | null;
  linked_data: Record<string, unknown> | null;
  deadlines: ScanDeadline[];
  disclaimer: string;
  tokens_used: number | null;
  raw_file_url: string | null;
}

// 허용 파일 타입
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Storage 버킷명
const STORAGE_BUCKET = 'scan-uploads';

// ─── Store ───

interface ScanStore {
  // State
  state: ScanState;
  file: File | null;
  filePreviewUrl: string | null;
  storageUrl: string | null;
  result: ScanResult | null;
  error: string | null; // i18n key
  progress: number; // 0-100

  // Actions
  selectFile: (file: File) => void;
  analyze: () => Promise<void>;
  reset: () => void;
  retry: () => void;
  clearError: () => void;
}

export const useScanStore = create<ScanStore>((set, get) => ({
  // Initial state
  state: 'idle',
  file: null,
  filePreviewUrl: null,
  storageUrl: null,
  result: null,
  error: null,
  progress: 0,

  // ── selectFile: idle → validating → uploading (or error) ──
  selectFile: (file: File) => {
    // Clean up previous preview URL
    const prevUrl = get().filePreviewUrl;
    if (prevUrl) URL.revokeObjectURL(prevUrl);

    set({ state: 'validating', file, error: null, result: null, progress: 0, storageUrl: null });

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
      set({ state: 'error', error: 'scan:error.unsupportedType' });
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      set({ state: 'error', error: 'scan:error.fileTooLarge' });
      return;
    }

    // Generate preview URL for images
    const previewUrl = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : null;

    set({ state: 'uploading', filePreviewUrl: previewUrl });

    // Auto-trigger analyze
    get().analyze();
  },

  // ── analyze: uploading → analyzing → result (or error) ──
  analyze: async () => {
    const { file } = get();
    if (!file) {
      set({ state: 'error', error: 'scan:error.noFile' });
      return;
    }

    try {
      // ── Auth check ──
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        set({ state: 'error', error: 'scan:error.notAuthenticated' });
        return;
      }

      set({ state: 'uploading', progress: 10 });

      // ── Phase 1: Storage 업로드 + Base64 인코딩 (병렬) ──
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${session.user.id}/${timestamp}_${safeName}`;

      const [storageResult, base64] = await Promise.all([
        uploadToStorage(file, storagePath),
        fileToBase64(file),
      ]);

      set({ progress: 40 });

      // Storage 실패는 치명적이지 않음 — 분석은 계속 진행
      // 단, URL을 기록해서 EF에 전달
      const storageUrl = storageResult.url;
      set({ storageUrl });

      if (storageResult.error) {
        console.warn('[useScanStore] Storage upload failed, continuing with analysis:', storageResult.error);
      }

      // file_type 결정
      const fileType = file.type === 'application/pdf' ? 'pdf'
        : file.type === 'image/png' ? 'png'
        : file.type === 'image/webp' ? 'webp'
        : 'image'; // jpeg default

      // ── Phase 2: API 호출 ──
      set({ state: 'analyzing', progress: 50 });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-analyze`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_base64: base64,
            file_type: fileType,
            file_url: storageUrl, // Storage URL 전달 → EF가 raw_file_url에 저장
          }),
        }
      );

      set({ progress: 80 });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'scan:error.analysisFailed';
        set({ state: 'error', error: errorMsg, progress: 0 });
        return;
      }

      if (!data.success) {
        set({ state: 'error', error: 'scan:error.analysisFailed', progress: 0 });
        return;
      }

      // ── Phase 3: 결과 판정 ──
      const items = data.items ?? [];
      const hasContent = items.length > 0;

      // items가 0개면 = 인식 실패 → status='failed', 횟수 무효
      const status: ScanStatus = hasContent ? 'success' : 'failed';

      set({
        state: 'result',
        progress: 100,
        result: {
          scan_id: data.scan_id,
          category: data.category,
          category_confidence: data.category_confidence,
          status,
          summary: data.summary,
          items,
          linked_widget: data.linked_widget,
          linked_data: data.linked_data,
          deadlines: data.deadlines ?? [],
          disclaimer: data.disclaimer,
          tokens_used: data.tokens_used,
          raw_file_url: storageUrl,
        },
      });

      // 실패 시 DB의 status도 업데이트
      if (status === 'failed' && data.scan_id) {
        await supabase
          .from('scan_results')
          .update({ status: 'failed' })
          .eq('id', data.scan_id);
      }
    } catch (err) {
      console.error('[useScanStore] analyze error:', err);
      set({
        state: 'error',
        error: 'scan:error.networkError',
        progress: 0,
      });
    }
  },

  // ── reset: any → idle ──
  reset: () => {
    const prevUrl = get().filePreviewUrl;
    if (prevUrl) URL.revokeObjectURL(prevUrl);

    set({
      state: 'idle',
      file: null,
      filePreviewUrl: null,
      storageUrl: null,
      result: null,
      error: null,
      progress: 0,
    });
  },

  // ── retry: error → idle ──
  retry: () => {
    set({ state: 'idle', error: null, progress: 0 });
  },

  // ── clearError ──
  clearError: () => {
    set({ error: null });
  },
}));

// ─── Helpers ───

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Failed to encode file'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Supabase Storage에 파일 업로드
 * 실패해도 분석은 계속 — 에러를 삼키고 null URL 반환
 */
async function uploadToStorage(
  file: File,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    // public URL 생성
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    return { url: null, error: (err as Error).message };
  }
}