export interface CompressOptions {
  maxSizeBytes?: number;
  maxWidth?: number;
  maxHeight?: number;
  initialQuality?: number;
  minQuality?: number;
  outputType?: string;
}

export interface CompressResult {
  file: File;
  blob: Blob;
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  didCompress: boolean;
}

export const DEFAULT_MAX_IMAGE_SIZE_BYTES = 500 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function fileToDataUrl(fileOrBlob: Blob): Promise<string> {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file into data URL'));
      reader.readAsDataURL(fileOrBlob);
    });
  }

  return fileOrBlob.arrayBuffer().then((buffer) => {
    const base64 = Buffer.from(buffer).toString('base64');
    const mime = fileOrBlob.type || 'application/octet-stream';
    return `data:${mime};base64,${base64}`;
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for canvas compression'));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob returned null'));
        }
      },
      type,
      quality,
    );
  });
}

export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<CompressResult> {
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_IMAGE_SIZE_BYTES;
  const maxWidth = options.maxWidth ?? 1920;
  const maxHeight = options.maxHeight ?? 1920;
  const initialQuality = options.initialQuality ?? 0.85;
  const minQuality = options.minQuality ?? 0.35;
  const outputType = options.outputType ?? 'image/jpeg';
  const originalSizeBytes = file.size;

  if (!file.type.startsWith('image/')) {
    const dataUrl = await fileToDataUrl(file);
    return {
      file,
      blob: file,
      dataUrl,
      originalSizeBytes,
      compressedSizeBytes: file.size,
      didCompress: false,
    };
  }

  if (file.size <= maxSizeBytes && file.type === outputType) {
    const dataUrl = await fileToDataUrl(file);
    return {
      file,
      blob: file,
      dataUrl,
      originalSizeBytes,
      compressedSizeBytes: file.size,
      didCompress: false,
    };
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    const dataUrl = await fileToDataUrl(file);
    return {
      file,
      blob: file,
      dataUrl,
      originalSizeBytes,
      compressedSizeBytes: file.size,
      didCompress: false,
    };
  }

  const initialDataUrl = await fileToDataUrl(file);
  const img = await loadImage(initialDataUrl);

  let currentWidth = img.naturalWidth || img.width;
  let currentHeight = img.naturalHeight || img.height;

  if (currentWidth > maxWidth || currentHeight > maxHeight) {
    const ratio = Math.min(maxWidth / currentWidth, maxHeight / currentHeight);
    currentWidth = Math.round(currentWidth * ratio);
    currentHeight = Math.round(currentHeight * ratio);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      file,
      blob: file,
      dataUrl: initialDataUrl,
      originalSizeBytes,
      compressedSizeBytes: file.size,
      didCompress: false,
    };
  }

  canvas.width = currentWidth;
  canvas.height = currentHeight;
  ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

  let quality = initialQuality;
  let blob = await canvasToBlob(canvas, outputType, quality);

  while (blob.size > maxSizeBytes && quality > minQuality) {
    quality -= 0.1;
    if (quality < minQuality) quality = minQuality;
    blob = await canvasToBlob(canvas, outputType, quality);
    if (quality === minQuality) break;
  }

  while (blob.size > maxSizeBytes && (currentWidth > 320 || currentHeight > 320)) {
    currentWidth = Math.round(currentWidth * 0.8);
    currentHeight = Math.round(currentHeight * 0.8);

    canvas.width = currentWidth;
    canvas.height = currentHeight;
    ctx.clearRect(0, 0, currentWidth, currentHeight);
    ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

    blob = await canvasToBlob(canvas, outputType, minQuality);
  }

  const extension = outputType === 'image/jpeg' ? '.jpg' : '.png';
  const newFileName = file.name.replace(/\.[^/.]+$/, '') + extension;
  const compressedFile = new File([blob], newFileName, { type: outputType });
  const finalDataUrl = await fileToDataUrl(blob);

  return {
    file: compressedFile,
    blob,
    dataUrl: finalDataUrl,
    originalSizeBytes,
    compressedSizeBytes: blob.size,
    didCompress: true,
  };
}
