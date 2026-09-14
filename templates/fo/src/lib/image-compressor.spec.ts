import { describe, expect, it, vi } from 'vitest';
import {
  compressImage,
  DEFAULT_MAX_IMAGE_SIZE_BYTES,
  fileToDataUrl,
  formatFileSize,
} from './image-compressor';

describe('image-compressor', () => {
  it('formats file sizes into readable units', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1024 * 350)).toBe('350.0 KB');
    expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.50 MB');
  });

  it('converts file or blob to data URL', async () => {
    const file = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    const dataUrl = await fileToDataUrl(file);
    expect(dataUrl).toContain('data:text/plain;base64,');
  });

  it('passes non-image files without attempting compression', async () => {
    const file = new File(['some doc content'], 'doc.pdf', { type: 'application/pdf' });
    const result = await compressImage(file);
    expect(result.didCompress).toBe(false);
    expect(result.originalSizeBytes).toBe(file.size);
    expect(result.compressedSizeBytes).toBe(file.size);
  });

  it('returns uncompressed file if size is below 500KB and matching output type', async () => {
    const file = new File(['small image bytes'], 'small.jpg', { type: 'image/jpeg' });
    const result = await compressImage(file, { maxSizeBytes: DEFAULT_MAX_IMAGE_SIZE_BYTES });
    expect(result.didCompress).toBe(false);
    expect(result.compressedSizeBytes).toBe(file.size);
    expect(result.originalSizeBytes).toBe(file.size);
  });

  it('executes canvas compression loop for large image files when window and canvas are available', async () => {
    const fakeCanvasBlob = new Blob(['compressed-jpeg-data'], { type: 'image/jpeg' });

    const fakeCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue({
        drawImage: vi.fn(),
        clearRect: vi.fn(),
      }),
      toBlob: vi.fn().mockImplementation((cb: (blob: Blob | null) => void) => {
        cb(fakeCanvasBlob);
      }),
    };

    const fakeDocument = {
      createElement: vi.fn().mockImplementation((tagName: string) => {
        if (tagName.toLowerCase() === 'canvas') {
          return fakeCanvas;
        }
        return {};
      }),
    };

    class MockImage {
      src = '';
      naturalWidth = 2400;
      naturalHeight = 1800;
      width = 2400;
      height = 1800;
      crossOrigin = '';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 10);
      }
    }

    vi.stubGlobal('window', {});
    vi.stubGlobal('document', fakeDocument);
    vi.stubGlobal('Image', MockImage);

    const largeContent = new Uint8Array(800 * 1024);
    const largeFile = new File([largeContent], 'large-photo.png', { type: 'image/png' });

    const result = await compressImage(largeFile, { maxSizeBytes: 500 * 1024 });

    expect(result.didCompress).toBe(true);
    expect(result.compressedSizeBytes).toBe(fakeCanvasBlob.size);
    expect(result.compressedSizeBytes).toBeLessThan(500 * 1024);
    expect(result.file.name).toBe('large-photo.jpg');

    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
});
