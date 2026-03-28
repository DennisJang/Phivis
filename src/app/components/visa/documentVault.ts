/**
 * documentVault.ts — Phase 3-B Sprint 1
 *
 * document_vault 업로드 플로우:
 * 1. compressImage() → 1MB 이하 JPEG
 * 2. Supabase Storage 업로드 (user_id/fileName)
 * 3. document_vault 테이블에 레코드 INSERT
 *
 * Free: 3개 제한 / Premium: 무제한
 *
 * Dennis 규칙:
 * #1  원본 파일 먼저 확인 — 추측 금지
 * #36 .maybeSingle() 사용
 * #40 "유저가 자기 데이터를 자기 양식에 채우는 것"
 */

import { supabase } from "../../lib/supabase";
import { compressImage } from "./compressImage";
import type { CompressedImage } from "./compressImage";

// ─── Types ───

export interface VaultUploadResult {
  success: boolean;
  vaultId?: string;
  storagePath?: string;
  error?: string;
}

export interface VaultItem {
  id: string;
  document_code: string;
  file_name: string;
  file_name_normalized: string;
  storage_path: string;
  file_size_bytes: number;
  compressed_size_bytes: number;
  mime_type: string;
  status: "uploaded" | "verified" | "expired" | "rejected";
  expires_at: string | null;
  uploaded_at: string;
  is_latest: boolean;
}

// ─── Constants ───

const BUCKET = "document-vault";
const FREE_LIMIT = 3;

// ─── Functions ───

/**
 * 현재 vault 아이템 수 조회 (Free 제한 체크용)
 */
export async function getVaultCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("document_vault")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_latest", true);

  if (error) return 0;
  return count ?? 0;
}

/**
 * 유저의 vault 아이템 목록 조회
 */
export async function getVaultItems(userId: string): Promise<VaultItem[]> {
  const { data, error } = await supabase
    .from("document_vault")
    .select("*")
    .eq("user_id", userId)
    .eq("is_latest", true)
    .order("uploaded_at", { ascending: false });

  if (error || !data) return [];
  return data as VaultItem[];
}

/**
 * 서류 업로드 메인 플로우
 *
 * @param file      유저가 선택한 원본 파일
 * @param documentCode  서류 코드 (e.g. "passport", "employment_cert")
 * @param userId    인증된 유저 ID
 * @param isPremium Premium 여부
 */
export async function uploadDocument(
  file: File,
  documentCode: string,
  userId: string,
  isPremium: boolean
): Promise<VaultUploadResult> {
  // 1. Free 제한 체크
  if (!isPremium) {
    const currentCount = await getVaultCount(userId);
    if (currentCount >= FREE_LIMIT) {
      return {
        success: false,
        error: `Free plan allows ${FREE_LIMIT} documents. Upgrade to Premium for unlimited.`,
      };
    }
  }

  // 2. 이미지 압축
  let compressed: CompressedImage;
  try {
    compressed = await compressImage(file, documentCode);
  } catch (err) {
    return {
      success: false,
      error: `Image compression failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }

  // 3. Storage 업로드 (경로: user_id/fileName)
  const storagePath = `${userId}/${compressed.fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, compressed.blob, {
      contentType: compressed.mimeType,
      upsert: false,
    });

  if (uploadError) {
    return {
      success: false,
      error: `Storage upload failed: ${uploadError.message}`,
    };
  }

  // 4. 기존 동일 document_code의 is_latest를 false로
  await supabase
    .from("document_vault")
    .update({ is_latest: false })
    .eq("user_id", userId)
    .eq("document_code", documentCode)
    .eq("is_latest", true);

  // 5. document_vault 테이블에 레코드 INSERT
  const { data: inserted, error: insertError } = await supabase
    .from("document_vault")
    .insert({
      user_id: userId,
      document_code: documentCode,
      file_name: file.name,
      file_name_normalized: compressed.fileName,
      storage_path: storagePath,
      file_size_bytes: compressed.originalSize,
      compressed_size_bytes: compressed.compressedSize,
      mime_type: compressed.mimeType,
      status: "uploaded",
      is_latest: true,
    })
    .select("id")
    .maybeSingle(); // 규칙 #36

  if (insertError || !inserted) {
    // Storage에 올라간 파일 롤백
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return {
      success: false,
      error: `Database insert failed: ${insertError?.message ?? "No data returned"}`,
    };
  }

  return {
    success: true,
    vaultId: inserted.id,
    storagePath,
  };
}

/**
 * vault 아이템 삭제
 */
export async function deleteVaultItem(
  vaultId: string,
  userId: string
): Promise<boolean> {
  // 1. 레코드 조회
  const { data: item, error: fetchError } = await supabase
    .from("document_vault")
    .select("storage_path")
    .eq("id", vaultId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError || !item) return false;

  // 2. Storage 삭제
  await supabase.storage.from(BUCKET).remove([item.storage_path]);

  // 3. 테이블 레코드 삭제
  const { error: deleteError } = await supabase
    .from("document_vault")
    .delete()
    .eq("id", vaultId)
    .eq("user_id", userId);

  return !deleteError;
}