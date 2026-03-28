/**
 * compressImage.ts — Phase 3-B Sprint 1
 * 
 * Canvas API 기반 이미지 압축 유틸리티
 * - JPEG/PNG 입력 → JPEG 출력
 * - 최대 1MB (하이코리아 제약 흡수)
 * - 장변 최대 2048px 리사이즈
 * - 파일명 정규화 (한글/특수문자 제거)
 * 
 * Dennis 규칙:
 * #26 디자인 작업 시 비즈니스 로직 건드리지 않음
 * #39 "서류 작성 대행" 표현 금지
 */

const MAX_FILE_SIZE = 1_048_576; // 1MB
const MAX_DIMENSION = 2048;
const INITIAL_QUALITY = 0.85;
const MIN_QUALITY = 0.4;
const QUALITY_STEP = 0.1;

export interface CompressedImage {
  blob: Blob;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  mimeType: "image/jpeg";
}

/**
 * 파일명 정규화
 * - 한글, 특수문자, 공백 제거
 * - document_code + timestamp 기반 이름 생성
 * - 하이코리아 호환
 */
export function normalizeFileName(
  documentCode: string,
  originalName: string
): string {
  const ext = "jpg"; // 항상 JPEG 출력
  const timestamp = Date.now();
  // document_code에서 영문숫자만 추출
  const safeCode = documentCode.replace(/[^a-zA-Z0-9_-]/g, "");
  return `${safeCode}_${timestamp}.${ext}`;
}

/**
 * 이미지를 Canvas에 로드
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 리사이즈 후 크기 계산
 */
function calcResizeDimensions(
  width: number,
  height: number,
  maxDim: number
): { w: number; h: number } {
  if (width <= maxDim && height <= maxDim) {
    return { w: width, h: height };
  }
  const ratio = Math.min(maxDim / width, maxDim / height);
  return {
    w: Math.round(width * ratio),
    h: Math.round(height * ratio),
  };
}

/**
 * Canvas → Blob 변환 (특정 품질)
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * 이미지 압축 메인 함수
 * 
 * 1. 파일을 Canvas에 로드
 * 2. 장변 2048px로 리사이즈
 * 3. JPEG 품질 0.85부터 시작, 1MB 이하가 될 때까지 0.1씩 감소
 * 4. 최소 품질 0.4 — 그래도 초과하면 해상도 추가 축소
 */
export async function compressImage(
  file: File,
  documentCode: string
): Promise<CompressedImage> {
  // 이미 JPEG이고 1MB 이하면 리사이즈만
  const originalSize = file.size;

  const img = await loadImage(file);
  const { w, h } = calcResizeDimensions(
    img.naturalWidth,
    img.naturalHeight,
    MAX_DIMENSION
  );

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  ctx.drawImage(img, 0, 0, w, h);

  // objectURL 해제
  URL.revokeObjectURL(img.src);

  // 품질 점진적 감소
  let quality = INITIAL_QUALITY;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > MAX_FILE_SIZE && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    blob = await canvasToBlob(canvas, Math.max(quality, MIN_QUALITY));
  }

  // 그래도 초과하면 해상도 50% 축소 후 재시도
  if (blob.size > MAX_FILE_SIZE) {
    const smallW = Math.round(w * 0.5);
    const smallH = Math.round(h * 0.5);
    canvas.width = smallW;
    canvas.height = smallH;
    ctx.drawImage(img, 0, 0, smallW, smallH);
    blob = await canvasToBlob(canvas, 0.7);
  }

  const fileName = normalizeFileName(documentCode, file.name);

  return {
    blob,
    fileName,
    originalSize,
    compressedSize: blob.size,
    width: canvas.width,
    height: canvas.height,
    mimeType: "image/jpeg",
  };
}